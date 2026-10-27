"""Strapi 5 REST, explicit publication status and read-only snapshots."""

import hashlib
import logging
from pathlib import Path
from typing import Any
from urllib.parse import quote, urlparse

import httpx

from app.config import Settings
from app.models.import_plan import MediaAsset
from app.strapi.mapping import ORDER


class StrapiError(RuntimeError):
    pass


class StrapiClient:
    def __init__(self, settings: Settings, transport: httpx.BaseTransport | None = None) -> None:
        if not settings.strapi_token.get_secret_value():
            raise ValueError("Set STRAPI_TOKEN before planning or importing.")
        url = urlparse(settings.strapi_url)
        if (
            url.scheme not in {"http", "https"}
            or not url.netloc
            or url.username
            or url.password
            or url.query
            or url.fragment
        ):
            raise ValueError("STRAPI_URL must be HTTP(S), without credentials, query, or fragment.")
        self.settings = settings
        self.http = httpx.Client(
            base_url=settings.strapi_url.rstrip("/") + "/",
            timeout=settings.strapi_timeout,
            headers={"Authorization": "Bearer " + settings.strapi_token.get_secret_value()},
            transport=transport,
            follow_redirects=False,
        )

    def close(self) -> None:
        self.http.close()

    def request(self, method: str, path: str, **kwargs: Any) -> Any:
        try:
            response = self.http.request(method, path, **kwargs)
        except httpx.HTTPError as exc:
            raise StrapiError(
                f"Strapi {method} transport failure ({type(exc).__name__}); inspect journal before retrying."
            ) from None
        if not 200 <= response.status_code < 300:
            raise StrapiError(f"Strapi {method} {path} returned HTTP {response.status_code}.")
        try:
            return response.json()
        except ValueError:
            raise StrapiError("Strapi returned invalid JSON.") from None

    def fetch(self, entity: str, status: str = "draft") -> list[dict[str, Any]]:
        if entity not in ORDER or entity == "media":
            raise ValueError("Unknown CMS collection.")
        logging.getLogger(__name__).info("fetching existing Strapi %s status=%s", entity, status)
        result: list[dict[str, Any]] = []
        seen: set[str] = set()
        page = 1
        while True:
            body = self.request(
                "GET",
                f"api/{entity}",
                params={
                    "pagination[page]": page,
                    "pagination[pageSize]": 100,
                    "sort": "documentId:asc",
                    "populate": "*",
                    "status": status,
                },
            )
            if not isinstance(body, dict) or not isinstance(body.get("data"), list):
                raise StrapiError("Expected a Strapi collection response.")
            for raw in body["data"]:
                if not isinstance(raw, dict) or not isinstance(raw.get("documentId"), str):
                    raise StrapiError("Expected a Strapi 5 documentId.")
                if raw["documentId"] in seen:
                    raise StrapiError(
                        "Repeated document during pagination; retry with a stable database."
                    )
                seen.add(raw["documentId"])
                result.append(raw)
            pages = body.get("meta", {}).get("pagination", {}).get("pageCount")
            if not isinstance(pages, int) or pages < 0:
                raise StrapiError("Missing pagination metadata; refusing an incomplete snapshot.")
            if page >= pages:
                return result
            if not body["data"]:
                raise StrapiError("Empty page before end of collection.")
            page += 1

    def media(self) -> list[dict[str, Any]]:
        result: list[dict[str, Any]] = []
        seen: set[int] = set()
        page = 1
        while True:
            body = self.request(
                "GET",
                "api/upload/files/page",
                params={"pagination[page]": page, "pagination[pageSize]": 100, "sort": "id:asc"},
            )
            if not isinstance(body, dict) or not isinstance(body.get("data"), list):
                raise StrapiError("Expected paginated media library response.")
            for raw in body["data"]:
                if (
                    not isinstance(raw, dict)
                    or not isinstance(raw.get("id"), int)
                    or raw["id"] in seen
                ):
                    raise StrapiError(
                        "Invalid/repeated media records; refusing an incomplete snapshot."
                    )
                seen.add(raw["id"])
                result.append(raw)
            pages = body.get("meta", {}).get("pagination", {}).get("pageCount")
            if not isinstance(pages, int) or pages < 0:
                raise StrapiError("Missing media pagination metadata.")
            if page >= pages:
                return result
            if not body["data"]:
                raise StrapiError("Empty media page before end of collection.")
            page += 1

    def upload(self, asset: MediaAsset) -> str:
        content = Path(asset.path).read_bytes()
        if hashlib.sha256(content).hexdigest() != asset.sha256:
            raise StrapiError("Photo changed after validation; rebuild the plan.")
        body = self.request(
            "POST", "api/upload", files={"files": (asset.name, content, asset.mime)}
        )
        if not isinstance(body, list) or len(body) != 1 or not isinstance(body[0].get("id"), int):
            raise StrapiError("Upload response has no media ID; check the journal before retrying.")
        return str(body[0]["id"])

    def write(self, entity: str, payload: dict[str, Any], remote_id: str | None) -> str:
        if entity not in ORDER or entity == "media":
            raise ValueError("Unknown CMS collection.")
        path = f"api/{entity}"
        if remote_id is not None:
            path += "/" + quote(remote_id, safe="")
        body = self.request(
            "POST" if remote_id is None else "PUT",
            path,
            params={"status": self.settings.strapi_publication_status},
            json={"data": payload},
        )
        raw = body.get("data") if isinstance(body, dict) else None
        if not isinstance(raw, dict) or not isinstance(raw.get("documentId"), str):
            raise StrapiError(
                "Write response has no documentId; verify server state before retrying."
            )
        return str(raw["documentId"])
