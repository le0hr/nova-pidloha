"""Delete products and their variations whose external_id starts with a prefix (local clean-up of an import).

Usage: .venv/bin/python scripts/delete_by_external_prefix.py PREFIX [--apply] [--delete-categories NAME ...]
Dry run by default; deleted documents are journaled (external_id, name) so they can be re-imported from the workbook.
"""
from __future__ import annotations

import argparse
import json

from app.config import Settings
from app.strapi.client import StrapiClient


def all_docs(client, path, params):
    out, page = [], 1
    while True:
        b = client.request("GET", path, params={**params, "status": "draft", "pagination[page]": page, "pagination[pageSize]": 100})
        out += b["data"]
        if page >= b["meta"]["pagination"]["pageCount"]:
            return out
        page += 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("prefix")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--delete-categories", nargs="*", default=[])
    ap.add_argument("--journal", default="import-runs/delete-floor-local.jsonl")
    a = ap.parse_args()
    c = StrapiClient(Settings())
    flt = {"filters[external_id][$startsWith]": a.prefix, "fields[0]": "external_id", "fields[1]": "name"}
    products = all_docs(c, "api/products", flt)
    variations = all_docs(c, "api/product-variations", {"filters[external_id][$startsWith]": a.prefix, "fields[0]": "external_id"})
    cats = [x for x in all_docs(c, "api/categories", {"fields[0]": "name", "populate[parent][fields][0]": "name"})
            if x["name"] in a.delete_categories and (x.get("parent") or {}).get("name") == "Підлога"]
    print(("APPLY" if a.apply else "DRY RUN"), c.settings.strapi_url, "| products:", len(products),
          "| variations:", len(variations), "| categories:", [x["name"] for x in cats])
    if not a.apply:
        return
    with open(a.journal, "a", encoding="utf-8") as j:
        for kind, docs in (("product-variations", variations), ("products", products), ("categories", cats)):
            for d in docs:
                r = c.http.request("DELETE", f"api/{kind}/{d['documentId']}")
                if r.status_code not in (200, 204):
                    raise SystemExit(f"DELETE {kind} {d['documentId']} -> {r.status_code}")
                j.write(json.dumps({"deleted": kind, "documentId": d["documentId"], "external_id": d.get("external_id"),
                                    "name": d.get("name")}, ensure_ascii=False) + "\n")
    print("done")


if __name__ == "__main__":
    main()
