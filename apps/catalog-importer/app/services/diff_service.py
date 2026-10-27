"""Compute a complete dependency-ordered plan without uploading or writing."""

import logging
from decimal import Decimal
from typing import Any

from app.models.catalog import Catalog
from app.models.import_plan import ImportPlan, MediaAsset, Operation
from app.parser.headers import normalize
from app.strapi.client import StrapiClient, StrapiError
from app.strapi.mapping import (
    ORDER,
    desired_records,
    project_remote,
    relation_id,
    resolve,
    slug,
)


def comparable(value: Any, key: str = "") -> Any:
    if key in {"price", "price_delta", "additionalCost"} and value is not None:
        return Decimal(str(value))
    if isinstance(value, dict):
        return {k: comparable(v, k) for k, v in value.items()}
    if isinstance(value, list):
        items = [comparable(v) for v in value]
        # Owned collections are sets; Excel row/column order must not trigger updates.
        return sorted(items, key=str)
    return value


def natural_match(entity: str, wanted: dict[str, Any], remote: dict[str, Any]) -> bool:
    if normalize(wanted.get("name")) != normalize(remote.get("name")):
        return False
    scope = {"categories": "parent", "decor-colors": "decor", "filter-codes": "filter_group"}.get(
        entity
    )
    return scope is None or relation_id(remote.get(scope)) == wanted.get(scope)


def index_records(records: list[dict[str, Any]], entity: str) -> dict[str, dict[str, Any]]:
    indexed: dict[str, dict[str, Any]] = {}
    for raw in records:
        key = raw.get("external_id")
        if key is None or key == "":
            continue  # Existing unmanaged records may not have catalog IDs yet.
        if not isinstance(key, str):
            raise StrapiError(f"{entity}: external_id must be a string.")
        if key in indexed:
            raise StrapiError(f"Duplicate remote external ID in {entity}: {key}")
        indexed[key] = raw
    return indexed


def build_plan(
    catalog: Catalog, client: StrapiClient, assets: dict[str, MediaAsset] | None = None
) -> ImportPlan:
    assets = assets or {}
    desired = desired_records(catalog, assets)
    operations: list[Operation] = []
    identifiers: dict[tuple[str, str], str] = {}
    media = client.media() if desired["media"] else []
    for external_id, payload in desired["media"].items():
        matches = [
            item
            for item in media
            if (
                item.get("url") == payload.get("url")
                if "url" in payload
                else item.get("name") == payload["name"]
            )
        ]
        if len(matches) > 1:
            if "url" in payload:
                raise StrapiError(f"Ambiguous media match: {payload}")
            # Content-addressed filenames identify reusable imported assets.
            # Use the oldest record regardless of the media API's ordering.
            matches.sort(key=lambda item: item["id"])
            logging.getLogger(__name__).warning(
                "Found %s media records named %s; reusing media ID %s",
                len(matches), payload["name"], matches[0]["id"],
            )
        if not matches and "url" in payload:
            raise StrapiError(f"Media URL was not found in Strapi: {payload['url']}")
        remote_id = str(matches[0]["id"]) if matches else None
        if remote_id is not None:
            identifiers[("media", external_id)] = remote_id
        operations.append(
            Operation(
                entity="media",
                action="unchanged" if matches else "create",
                external_id=external_id,
                remote_id=remote_id,
                payload=payload,
            )
        )
    for entity in ORDER[1:]:
        if not desired[entity]:
            continue
        draft_records = client.fetch(entity, "draft")
        published_records = client.fetch(entity, "published")
        drafts = index_records(draft_records, entity)
        published = index_records(published_records, entity)
        published_by_id = {r["documentId"]: r for r in published_records}
        all_by_id = {r["documentId"]: r for r in published_records + draft_records}
        for external_id, payload in desired[entity].items():
            remote = drafts.get(external_id) or published.get(external_id)
            if (
                drafts.get(external_id)
                and published.get(external_id)
                and drafts[external_id]["documentId"] != published[external_id]["documentId"]
            ):
                raise StrapiError(
                    f"{entity}: different draft/published documents share external ID {external_id}."
                )
            resolved = resolve(payload, identifiers, pending=True)
            if remote is None and entity not in {
                "products",
                "product-variations",
                "architrave-types",
            }:
                matches = [r for r in all_by_id.values() if natural_match(entity, resolved, r)]
                if len(matches) > 1:
                    raise StrapiError(f"Ambiguous existing {entity} name: {payload.get('name')}")
                if matches:
                    remote = matches[0]
                    if remote.get("external_id") not in {None, "", external_id}:
                        raise StrapiError(
                            f"{entity}: matching name belongs to a different external ID."
                        )
            if remote is None and entity in {"products", "product-variations"}:
                # Never guess legacy identity from a display name or Strapi internal ID.
                matches = [
                    r
                    for r in all_by_id.values()
                    if not r.get("external_id")
                    and (
                        r.get("slug") == payload.get("slug")
                        or (
                            entity == "products"
                            and normalize(r.get("name")) == normalize(payload.get("name"))
                        )
                    )
                ]
                if matches:
                    raise StrapiError(
                        f"Existing {entity} matches {external_id} but lacks external_id. Backfill the catalog ID in CMS before importing."
                    )
            # Repair only URLs generated by the old importer; keep custom/legacy URLs.
            if (
                remote is not None
                and entity not in {"filter-groups", "filter-codes"}
                and remote.get("slug")
                and "slug" in payload
                and (entity != "categories" or remote["slug"] != slug(entity, external_id))
            ):
                payload["slug"] = remote["slug"]
            if entity in {"categories", "filter-groups", "filter-codes"}:
                conflicts = any(
                    r.get("slug") == payload["slug"]
                    and (remote is None or r["documentId"] != remote["documentId"])
                    for r in all_by_id.values()
                ) or any(
                    op.entity == entity and op.payload.get("slug") == payload["slug"]
                    for op in operations
                )
                if conflicts:
                    label = "Category" if entity == "categories" else "Filter"
                    raise StrapiError(f"{label} URL already in use: {payload['slug']}")
            if remote is not None and entity == "filter-groups":
                # A partial workbook must not disconnect another category from a shared filter.
                existing_ids = [relation_id(c) for c in remote.get("categories", [])]
                resolved_ids = resolve(payload["categories"], identifiers, pending=True)
                payload["categories"].extend(i for i in existing_ids if i not in resolved_ids)
            resolved = resolve(payload, identifiers, pending=True)
            before = project_remote(entity, remote, payload) if remote is not None else None
            action = (
                "create"
                if remote is None
                else "unchanged"
                if comparable(before) == comparable(resolved)
                else "update"
            )
            if remote is not None and client.settings.strapi_publication_status == "published":
                live = published_by_id.get(remote["documentId"])
                if live is None or comparable(project_remote(entity, live, payload)) != comparable(
                    resolved
                ):
                    action = "update"
            remote_id = remote["documentId"] if remote else None
            if remote_id is not None:
                identifiers[(entity, external_id)] = remote_id
            operations.append(
                Operation(
                    entity=entity,
                    action=action,
                    external_id=external_id,
                    remote_id=remote_id,
                    payload=payload,
                    before=before,
                )
            )
    # Every relation reference must resolve to an existing or earlier planned record.
    known: dict[tuple[str, str], str] = {}
    for op in operations:
        resolve(op.payload, known)
        known[(op.entity, op.external_id)] = op.remote_id or "planned"
    return ImportPlan(
        operations=operations, assets={asset.sha256: asset for asset in assets.values()}
    )
