"""HTTP contract tests use the checked-in CMS schemas, not a fictitious backend."""

import copy
import json
from pathlib import Path
from typing import Any

import httpx
import pytest
from pydantic import SecretStr
from test_parser import edit, workbook
from typer.testing import CliRunner

from app.cli import cli
from app.config import Settings
from app.services.import_service import InvalidCatalog, run
from app.strapi.client import StrapiClient, StrapiError
from app.strapi.mapping import ORDER, RELATIONS

CMS = Path(__file__).parents[2] / "cms"
SCHEMAS = {
    json.loads(p.read_text())["info"]["pluralName"]: json.loads(p.read_text())["attributes"]
    for p in (CMS / "src/api").glob("*/content-types/*/schema.json")
}


class Server:
    def __init__(self) -> None:
        self.records: dict[str, dict[str, dict[str, Any]]] = {k: {} for k in ORDER}
        self.published: dict[str, dict[str, dict[str, Any]]] = {k: {} for k in ORDER}
        self.methods: list[str] = []
        self.fail_variations = False
        self.page_size = 100

    def populated(self, entity: str, raw: dict[str, Any], status: str) -> dict[str, Any]:
        data = copy.deepcopy(raw)
        source = self.records if status == "draft" else self.published
        for key, (target, many) in RELATIONS.get(entity, {}).items():
            ids = raw.get(key)

            def related(identifier: str, target: str = target) -> dict[str, Any]:
                record = source[target].get(str(identifier)) or self.records[target].get(
                    str(identifier)
                )
                assert record is not None, (target, identifier)
                return copy.deepcopy(record)

            data[key] = (
                [related(i) for i in ids or []]
                if many
                else related(ids)
                if ids is not None
                else None
            )
        if entity == "products":
            data.setdefault("characteristics", [])
            for index, c in enumerate(data["characteristics"]):
                c["id"] = index + 1
        return data

    def handle(self, request: httpx.Request) -> httpx.Response:
        self.methods.append(request.method)
        parts = request.url.path.strip("/").split("/")
        kind = parts[1]
        status = request.url.params.get("status", "published")
        if request.method == "GET":
            if kind == "upload":
                return httpx.Response(
                    200,
                    json={
                        "data": list(self.records["media"].values()),
                        "meta": {"pagination": {"pageCount": 1}},
                    },
                )
            page = int(request.url.params.get("pagination[page]", "1"))
            source = self.records if status == "draft" else self.published
            data = [self.populated(kind, raw, status) for raw in source[kind].values()]
            return httpx.Response(
                200,
                json={
                    "data": data[(page - 1) * self.page_size : page * self.page_size],
                    "meta": {
                        "pagination": {
                            "pageCount": max(1, (len(data) + self.page_size - 1) // self.page_size)
                        }
                    },
                },
            )
        if self.fail_variations and kind == "product-variations":
            return httpx.Response(400, json={"error": "private information"})
        if kind == "upload":
            from email.parser import BytesParser
            from email.policy import default

            msg = BytesParser(policy=default).parsebytes(
                ("Content-Type: " + request.headers["content-type"] + "\r\n\r\n").encode()
                + request.content
            )
            name = next(msg.iter_parts()).get_filename()
            media_id = len(self.records["media"]) + 1
            raw = {"id": media_id, "name": name, "url": "/uploads/" + str(name)}
            self.records["media"][str(media_id)] = raw
            return httpx.Response(200, json=[raw])
        payload = json.loads(request.content)["data"]
        assert set(payload) <= SCHEMAS[kind].keys(), (kind, set(payload) - SCHEMAS[kind].keys())
        remote_id = parts[2] if request.method == "PUT" else str(len(self.records[kind]) + 1)
        previous = self.records[kind].get(remote_id, {})
        raw = {**previous, **payload, "documentId": remote_id, "publishedAt": None}
        self.records[kind][remote_id] = raw
        if status == "published":
            self.published[kind][remote_id] = {**copy.deepcopy(raw), "publishedAt": "2026-09-18"}
        return httpx.Response(200, json={"data": raw})


@pytest.fixture
def settings() -> Settings:
    return Settings(strapi_token=SecretStr("secret-token"))


def test_dry_run_and_idempotency(tmp_path: Path, settings: Settings) -> None:
    server = Server()
    client = StrapiClient(settings, httpx.MockTransport(server.handle))
    path = workbook(tmp_path)
    plan = run(path, settings, client)
    assert all(op.action == "create" for op in plan.operations)
    assert set(server.methods) == {"GET"}
    run(path, settings, client, write=True, journal_directory=tmp_path / "runs")
    server.methods.clear()
    plan = run(path, settings, client, write=True, journal_directory=tmp_path / "runs")
    assert all(op.action == "unchanged" for op in plan.operations)
    assert set(server.methods) == {"GET"}
    assert len(server.records["products"]) == len(server.records["product-variations"]) == 1
    assert not server.published["products"]
    client.close()


def test_invalid_catalog_zero_requests(tmp_path: Path, settings: Settings) -> None:
    server = Server()
    client = StrapiClient(settings, httpx.MockTransport(server.handle))
    with pytest.raises(InvalidCatalog):
        run(workbook(tmp_path, price=-1), settings, client, write=True)
    assert not server.methods
    client.close()


def test_missing_entities_never_deleted(tmp_path: Path, settings: Settings) -> None:
    server = Server()
    server.records["products"]["old"] = {"external_id": "absent", "documentId": "old"}
    client = StrapiClient(settings, httpx.MockTransport(server.handle))
    run(workbook(tmp_path), settings, client, write=True, journal_directory=tmp_path)
    assert "old" in server.records["products"]
    assert "DELETE" not in server.methods
    client.close()


def test_stop_on_failure_journal(tmp_path: Path, settings: Settings) -> None:
    server = Server()
    server.fail_variations = True
    client = StrapiClient(settings, httpx.MockTransport(server.handle))
    with pytest.raises(StrapiError, match="400"):
        run(workbook(tmp_path), settings, client, write=True, journal_directory=tmp_path / "runs")
    events = [
        json.loads(line)
        for line in next((tmp_path / "runs").glob("*.jsonl")).read_text().splitlines()
    ]
    assert events[-1]["event"] == "failed_or_unknown"
    assert len(server.records["products"]) == 1
    assert "secret-token" not in str(events)
    client.close()


def test_pagination(settings: Settings) -> None:
    server = Server()
    server.page_size = 1
    server.records["products"] = {
        str(i): {"external_id": str(i), "documentId": str(i)} for i in range(3)
    }
    client = StrapiClient(settings, httpx.MockTransport(server.handle))
    assert len(client.fetch("products")) == 3
    assert len(server.methods) == 3
    client.close()


def test_remote_duplicate_aborts_before_writes(tmp_path: Path, settings: Settings) -> None:
    server = Server()
    server.records["products"] = {
        str(i): {"external_id": "same", "documentId": str(i)} for i in range(2)
    }
    client = StrapiClient(settings, httpx.MockTransport(server.handle))
    with pytest.raises(StrapiError, match="Duplicate"):
        run(workbook(tmp_path), settings, client, write=True)
    assert set(server.methods) == {"GET"}
    client.close()


def test_cli(tmp_path: Path) -> None:
    path = workbook(tmp_path)
    runner = CliRunner()
    assert runner.invoke(cli, ["validate", str(path)]).exit_code == 0
    assert "variation" in runner.invoke(cli, ["inspect", str(path)]).output
    edit(path, "C5", -1)
    assert runner.invoke(cli, ["validate", str(path)]).exit_code == 1
    assert runner.invoke(cli, ["import", str(path)]).exit_code == 1


def test_update_and_decimal_equivalence(tmp_path: Path, settings: Settings) -> None:
    server = Server()
    client = StrapiClient(settings, httpx.MockTransport(server.handle))
    path = workbook(tmp_path)
    run(path, settings, client, write=True, journal_directory=tmp_path)
    server.records["product-variations"]["1"]["price"] = 10.25
    assert all(op.action == "unchanged" for op in run(path, settings, client).operations)
    edit(path, "C5", 40)
    changes = run(path, settings, client, write=True, journal_directory=tmp_path)
    assert (
        next(op for op in changes.operations if op.entity == "product-variations").action
        == "update"
    )
    assert len(server.records["product-variations"]) == 1
    assert server.records["product-variations"]["1"]["price"] == "40"
    client.close()


def test_publish_existing_drafts(tmp_path: Path, settings: Settings) -> None:
    server = Server()
    client = StrapiClient(settings, httpx.MockTransport(server.handle))
    path = workbook(tmp_path)
    run(path, settings, client, write=True, journal_directory=tmp_path)
    settings.strapi_publication_status = "published"
    changes = run(path, settings, client, write=True, journal_directory=tmp_path)
    assert all(op.action == "update" for op in changes.operations)
    assert len(server.records["products"]) == len(server.published["products"]) == 1
    assert all(op.action == "unchanged" for op in run(path, settings, client).operations)
    # Draft differs while published already matches: refresh draft, keeping the document ID.
    server.records["products"]["1"]["name"] = "Edited draft"
    changes = run(path, settings, client)
    assert next(op for op in changes.operations if op.entity == "products").action == "update"
    client.close()


def test_reuse_named_taxonomy(tmp_path: Path, settings: Settings) -> None:
    server = Server()
    server.records["categories"]["existing"] = {
        "documentId": "existing",
        "name": "Двері",
        "slug": "doors",
        "parent": None,
    }
    client = StrapiClient(settings, httpx.MockTransport(server.handle))
    run(workbook(tmp_path), settings, client, write=True, journal_directory=tmp_path)
    assert len(server.records["categories"]) == 1
    assert server.records["categories"]["existing"]["slug"] == "doors"
    assert server.records["products"]["1"]["category"] == "existing"
    client.close()


def test_media_upload_deduplicated(tmp_path: Path, settings: Settings) -> None:
    server = Server()
    client = StrapiClient(settings, httpx.MockTransport(server.handle))
    p = workbook(tmp_path)
    (tmp_path / "photo.png").write_bytes(b"example-image")
    edit(p, "D4", "image")
    edit(p, "D5", "photo.png")
    assert all(op.action == "create" for op in run(p, settings, client).operations)
    assert set(server.methods) == {"GET"}
    run(p, settings, client, write=True, journal_directory=tmp_path)
    assert len(server.records["media"]) == 1
    assert server.records["product-variations"]["1"]["image"] == "1"
    assert all(op.action == "unchanged" for op in run(p, settings, client).operations)
    client.close()


def test_duplicate_media_names_reuse_lowest_id(tmp_path: Path, settings: Settings) -> None:
    import hashlib

    server = Server()
    client = StrapiClient(settings, httpx.MockTransport(server.handle))
    p = workbook(tmp_path)
    content = b"example-image"
    (tmp_path / "photo.png").write_bytes(content)
    edit(p, "D4", "image")
    edit(p, "D5", "photo.png")
    name = f"catalog-{hashlib.sha256(content).hexdigest()}.png"
    for media_id in (10, 2):
        server.records["media"][str(media_id)] = {
            "id": media_id, "name": name, "url": f"/uploads/{media_id}.png",
        }

    plan = run(p, settings, client)
    media = next(op for op in plan.operations if op.entity == "media")
    assert media.action == "unchanged"
    assert media.remote_id == "2"
    assert set(server.methods) == {"GET"}
    run(p, settings, client, write=True, journal_directory=tmp_path)
    assert len(server.records["media"]) == 2
    assert server.records["product-variations"]["1"]["image"] == "2"
    server.records["media"] = dict(reversed(list(server.records["media"].items())))
    assert all(op.action == "unchanged" for op in run(p, settings, client).operations)
    client.close()


def test_full_personnel_workbook_relations(tmp_path: Path, settings: Settings) -> None:
    from example_support import corrected_example

    path = corrected_example(tmp_path)
    server = Server()
    client = StrapiClient(settings, httpx.MockTransport(server.handle))
    run(path, settings, client, write=True, journal_directory=tmp_path)
    assert len(server.records["products"]) == 3
    assert len(server.records["product-variations"]) == 50
    assert len(server.records["brands"]) == 3
    assert len(server.records["decors"]) == 1
    assert len(server.records["decor-colors"]) == 9
    assert len(server.records["media"]) == 1
    product = next(p for p in server.records["products"].values() if p["external_id"] == "1020")
    assert product["shortDescription"]
    assert len(product["characteristics"]) == 2
    assert len(product["addons"]) == 1
    addon = server.records["architrave-types"][product["addons"][0]]
    assert addon["group"] == "Коробка"
    assert addon["additionalCost"] == "1020"
    related_variations = [
        variation for variation in server.records["product-variations"].values()
        if product["documentId"] in variation["products"]
    ]
    assert related_variations
    assert all(v["addons"] == product["addons"] for v in related_variations)
    assert product["filter_values"]
    assert all(op.action == "unchanged" for op in run(path, settings, client).operations)
    client.close()


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        ("Міжкімнатні двері", "mizhkimnatni"),
        ("Вхідні двері", "vhidni"),
        ("Підлога", "pidloha"),
        ("Фурнітура", "furnitura"),
        ("Нові категорії", "novi-katehoriyi"),
    ],
)
def test_readable_category_slugs(
    tmp_path: Path, settings: Settings, name: str, expected: str
) -> None:
    from openpyxl import load_workbook

    from app.strapi.mapping import slug

    path = workbook(tmp_path)
    wb = load_workbook(path)
    assert wb.active is not None
    wb.active.title = name
    wb.save(path)
    server = Server()
    client = StrapiClient(settings, httpx.MockTransport(server.handle))
    run(path, settings, client, write=True, journal_directory=tmp_path)
    category = server.records["categories"]["1"]
    assert category["slug"] == expected
    category["slug"] = slug("categories", category["external_id"])
    plan = run(path, settings, client)
    change = next(op for op in plan.operations if op.entity == "categories")
    assert change.action == "update"
    assert change.payload["slug"] == expected
    run(path, settings, client, write=True, journal_directory=tmp_path)
    assert all(op.action == "unchanged" for op in run(path, settings, client).operations)
    category = server.records["categories"]["1"]
    category["slug"] = "custom-legacy-url"
    assert (
        next(
            op for op in run(path, settings, client).operations if op.entity == "categories"
        ).payload["slug"]
        == "custom-legacy-url"
    )
    client.close()


def test_category_subclasses_have_scoped_slugs() -> None:
    from app.strapi.mapping import category_slug

    assert category_slug("Класичні", "Міжкімнатні двері") == "mizhkimnatni-klasychni"
    assert category_slug("Класичні", "Вхідні двері") == "vhidni-klasychni"


def test_category_slug_collision_aborts_before_writes(tmp_path: Path, settings: Settings) -> None:
    server = Server()
    server.records["categories"]["existing"] = {
        "documentId": "existing",
        "name": "Other category",
        "slug": "dveri",
        "parent": None,
    }
    client = StrapiClient(settings, httpx.MockTransport(server.handle))
    with pytest.raises(StrapiError, match="Category URL already in use"):
        run(workbook(tmp_path), settings, client, write=True, journal_directory=tmp_path)
    assert set(server.methods) == {"GET"}
    client.close()


def test_existing_filter_slugs_are_updated(tmp_path: Path, settings: Settings) -> None:
    from app.strapi.mapping import filter_slug, slug

    assert filter_slug('Дуб білений', 'Колір') == 'колір-дуб-білений'
    assert filter_slug('Super PET', 'Покриття') == 'покриття-super-pet'
    path = Path(__file__).parents[1] / "examples" / "catalog.xlsx"
    server = Server()
    client = StrapiClient(settings, httpx.MockTransport(server.handle))
    run(path, settings, client, write=True, journal_directory=tmp_path)
    for entity in ('filter-groups', 'filter-codes'):
        assert server.records[entity]
        assert SCHEMAS[entity]['slug'] == {'type': 'string', 'unique': True}
        for record in server.records[entity].values():
            scope = ()
            if entity == 'filter-codes':
                scope = (server.records['filter-groups'][record['filter_group']]['name'],)
            assert record['slug'] == filter_slug(record['name'], *scope)
            record['slug'] = slug(entity, record['external_id'])
    plan = run(path, settings, client)
    changes = [op for op in plan.operations if op.entity in {'filter-groups', 'filter-codes'}]
    assert changes and all(op.action == 'update' for op in changes)
    run(path, settings, client, write=True, journal_directory=tmp_path)
    assert all(op.action == 'unchanged' for op in run(path, settings, client).operations)
    client.close()
