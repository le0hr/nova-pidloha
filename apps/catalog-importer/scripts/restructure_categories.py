"""One-off storefront category restructuring on a live CMS (REST, journaled, dry-run by default).

* Interior doors -> subcategories by subclass (Каркасно-щитові, Збірні, Приховані, Соснові),
  with the same names/external_id/slug the importer produces, so later imports reuse them.
* "Профіль" merged into "З’єднувальний профіль" (same H-profile goods); its filter groups follow.
* Service/option classes (Послуга, Акційний комплект, Наповнення, Випрямляч): products become
  inactive and uncategorised, the empty categories are deleted.

Usage: .venv/bin/python scripts/restructure_categories.py [--apply] [--journal FILE]
Only the documents listed in the journal are touched; previous values are recorded for rollback.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from types import SimpleNamespace
from typing import Any

from app.config import Settings
from app.parser.headers import normalize
from app.strapi.client import StrapiClient
from app.strapi.mapping import (
    CLASS_ALIASES,
    DOOR_CLASSES,
    HIDDEN_CLASSES,
    category_slug,
    door_subcategory,
    stable_id,
)

PUBLISHED = {"status": "published"}


def delete(client: StrapiClient, path: str) -> None:
    """DELETE answers 204 without a body, which StrapiClient.request would reject as invalid JSON."""
    response = client.http.request("DELETE", path)
    if response.status_code not in (200, 204):
        raise SystemExit(f"DELETE {path} returned HTTP {response.status_code}")


def all_pages(client: StrapiClient, path: str, params: dict[str, Any]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    page = 1
    while True:
        body = client.request(
            "GET", path, params={**params, **PUBLISHED, "pagination[page]": page, "pagination[pageSize]": 100}
        )
        rows += body["data"]
        if page >= body["meta"]["pagination"]["pageCount"]:
            return rows
        page += 1


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write changes (default: dry run)")
    parser.add_argument("--journal", default="import-runs/restructure-categories.jsonl")
    args = parser.parse_args()
    client = StrapiClient(Settings())
    journal = Path(args.journal)

    def log(**entry: Any) -> None:
        if args.apply:
            with journal.open("a", encoding="utf-8") as file:
                file.write(json.dumps(entry, ensure_ascii=False) + "\n")

    categories = all_pages(
        client, "api/categories", {"populate[parent][fields][0]": "name", "populate[filter_groups][fields][0]": "name"}
    )
    by_name: dict[tuple[str, str], dict[str, Any]] = {
        (normalize((c.get("parent") or {}).get("name")), normalize(c["name"])): c for c in categories
    }

    def category(parent: str, name: str) -> dict[str, Any]:
        found = by_name.get((normalize(parent), normalize(name)))
        if found is None:
            raise SystemExit(f"Category {parent}/{name} not found")
        return found

    plan: list[str] = []

    # 1. Door subcategories (created under every interior-door class found).
    doors_classes = [c for c in categories if normalize(c["name"]) in DOOR_CLASSES and c.get("parent")]
    subcategory_ids: dict[tuple[str, str], str] = {}
    for door_class in doors_classes:
        root = door_class["parent"]["name"]
        for name in ("Каркасно-щитові", "Збірні", "Приховані", "Соснові"):
            existing = by_name.get((normalize(door_class["name"]), normalize(name)))
            if existing:
                subcategory_ids[(door_class["documentId"], name)] = existing["documentId"]
                continue
            data = {
                "name": name,
                "slug": category_slug(name, root, door_class["name"]),
                "external_id": stable_id("categories", root, door_class["name"], name),
                "parent": door_class["documentId"],
            }
            plan.append(f"create category {root}/{door_class['name']}/{name} [{data['slug']}]")
            if args.apply:
                created = client.request("POST", "api/categories", params=PUBLISHED, json={"data": data})["data"]
                log(action="create-category", documentId=created["documentId"], data=data)
                subcategory_ids[(door_class["documentId"], name)] = created["documentId"]

    moves: Counter[str] = Counter()
    for door_class in doors_classes:
        products = all_pages(
            client,
            "api/products",
            {
                "filters[category][documentId][$eq]": door_class["documentId"],
                "fields[0]": "name",
                "fields[1]": "catalog_attributes",
                "populate[brand][fields][0]": "name",
            },
        )
        for product in products:
            target = door_subcategory(
                SimpleNamespace(
                    attributes=product.get("catalog_attributes") or {},
                    brand=(product.get("brand") or {}).get("name"),
                )
            )
            if target is None:
                moves[f"{door_class['name']} (лишається)"] += 1
                continue
            moves[f"{door_class['name']}/{target}"] += 1
            if args.apply:
                new_id = subcategory_ids[(door_class["documentId"], target)]
                client.request(
                    "PUT", f"api/products/{product['documentId']}", params=PUBLISHED, json={"data": {"category": new_id}}
                )
                log(action="move-product", documentId=product["documentId"], name=product["name"],
                    before=door_class["documentId"], after=new_id)
    plan += [f"move {count} doors -> {target}" for target, count in sorted(moves.items())]

    # 2. Class aliases: move goods, carry filter groups over, delete the emptied class.
    for alias, target_name in CLASS_ALIASES.items():
        for source in [c for c in categories if normalize(c["name"]) == alias and c.get("parent")]:
            target = category(source["parent"]["name"], target_name)
            products = all_pages(
                client, "api/products", {"filters[category][documentId][$eq]": source["documentId"], "fields[0]": "name"}
            )
            plan.append(f"move {len(products)} products {source['name']} -> {target['name']}, delete {source['name']}")
            groups = [g for g in source.get("filter_groups") or [] if g["documentId"] not in
                      {t["documentId"] for t in target.get("filter_groups") or []}]
            plan.append(f"link {len(groups)} filter groups to {target['name']}: {[g['name'] for g in groups]}")
            if not args.apply:
                continue
            for product in products:
                client.request("PUT", f"api/products/{product['documentId']}", params=PUBLISHED,
                               json={"data": {"category": target["documentId"]}})
                log(action="move-product", documentId=product["documentId"], name=product["name"],
                    before=source["documentId"], after=target["documentId"])
            linked = [g["documentId"] for g in target.get("filter_groups") or []] + [g["documentId"] for g in groups]
            client.request("PUT", f"api/categories/{target['documentId']}", params=PUBLISHED,
                           json={"data": {"filter_groups": linked}})
            log(action="link-filter-groups", category=target["documentId"], added=[g["documentId"] for g in groups])
            delete(client, f"api/categories/{source['documentId']}")
            log(action="delete-category", documentId=source["documentId"], name=source["name"], slug=source["slug"],
                external_id=source.get("external_id"), parent=source["parent"]["documentId"],
                filter_groups=[g["documentId"] for g in source.get("filter_groups") or []])

    # 3. Hidden service/option classes: products inactive + uncategorised, categories deleted.
    for source in [c for c in categories if normalize(c["name"]) in HIDDEN_CLASSES and c.get("parent")]:
        products = all_pages(
            client,
            "api/products",
            {"filters[category][documentId][$eq]": source["documentId"], "fields[0]": "name", "fields[1]": "active"},
        )
        plan.append(f"hide {len(products)} products of {source['name']} (inactive, no category), delete {source['name']}")
        if not args.apply:
            continue
        for product in products:
            client.request("PUT", f"api/products/{product['documentId']}", params=PUBLISHED,
                           json={"data": {"active": False, "category": None}})
            log(action="hide-product", documentId=product["documentId"], name=product["name"],
                before={"active": product.get("active"), "category": source["documentId"]})
        delete(client, f"api/categories/{source['documentId']}")
        log(action="delete-category", documentId=source["documentId"], name=source["name"], slug=source["slug"],
            external_id=source.get("external_id"), parent=source["parent"]["documentId"],
            filter_groups=[g["documentId"] for g in source.get("filter_groups") or []])

    print(("APPLIED" if args.apply else "DRY RUN") + f" on {client.settings.strapi_url}")
    print("\n".join(plan))


if __name__ == "__main__":
    main()
