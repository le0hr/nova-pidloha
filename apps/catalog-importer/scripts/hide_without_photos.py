"""Hide products that have no photo at all (no product image and no image on any active variation): active=false.

Usage: .venv/bin/python scripts/hide_without_photos.py [--apply] [--journal FILE]
Dry run by default. Journal keeps the previous value; to undo, set active back to true for the listed documents.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any

from app.config import Settings
from app.strapi.client import StrapiClient

PUBLISHED = {"status": "published"}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--journal", default="import-runs/hide-without-photos.jsonl")
    parser.add_argument("--keep", help="file with external_id per line that must stay visible (e.g. visible on the server)")
    args = parser.parse_args()
    client = StrapiClient(Settings())
    products: list[dict[str, Any]] = []
    page = 1
    while True:
        body = client.request("GET", "api/products", params={
            **PUBLISHED, "pagination[page]": page, "pagination[pageSize]": 100,
            "fields[0]": "name", "fields[1]": "active", "fields[2]": "external_id",
            "populate[image][fields][0]": "url",
            "populate[category][fields][0]": "name",
            "populate[product_variations][fields][0]": "active",
            "populate[product_variations][populate][image][fields][0]": "url",
        })
        products += body["data"]
        if page >= body["meta"]["pagination"]["pageCount"]:
            break
        page += 1

    def has_photo(p: dict[str, Any]) -> bool:
        return bool(p.get("image")) or any(v.get("image") for v in p.get("product_variations") or [] if v.get("active") is not False)

    keep = set(Path(args.keep).read_text().split()) if args.keep else set()
    hide = [p for p in products if p.get("active") is not False and not has_photo(p) and p.get("external_id") not in keep]
    by_category = Counter((p.get("category") or {}).get("name", "—") for p in hide)
    print(("APPLY" if args.apply else "DRY RUN") + f" on {client.settings.strapi_url}")
    print(f"active products: {sum(1 for p in products if p.get('active') is not False)}, without photo -> hide: {len(hide)}")
    for name, n in by_category.most_common():
        print(f"   {name}: {n}")
    if not args.apply:
        return
    with Path(args.journal).open("a", encoding="utf-8") as journal:
        for p in hide:
            client.request("PUT", f"api/products/{p['documentId']}", params=PUBLISHED, json={"data": {"active": False}})
            journal.write(json.dumps({"action": "hide", "documentId": p["documentId"], "name": p["name"],
                                      "before": {"active": p.get("active")}}, ensure_ascii=False) + "\n")
    print("done; journal:", args.journal)


if __name__ == "__main__":
    main()
