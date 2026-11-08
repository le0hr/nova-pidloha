"""One photo per look: variations that differ from their look only by edge (кромка) get the look's main photo.

Look = decor + colour + glass + every other attribute except edge, size, side and lock preparation.
The main photo is the one most variations of the look already use. Photos left unused afterwards are
listed and, with --delete-unused, removed from the media library.

Usage: .venv/bin/python scripts/dedupe_edge_photos.py [--apply] [--delete-unused] [--journal FILE]
Dry run by default. Every change is journaled with the previous value.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from app.config import Settings
from app.strapi.client import StrapiClient

INVISIBLE = ("кромка", "ширина", "висота", "сторона", "підготовка під замок")
MAPPED = {"тип покриття", "декор", "decor", "покриття", "колір", "color", "скло", "glass"}
PUBLISHED = {"status": "published"}


def look_key(variation: dict[str, Any]) -> str:
    attrs = variation.get("catalog_attributes") or {}
    visible = sorted(
        (d["key"], str(attrs.get(d["key"], "")))
        for d in variation.get("attribute_definitions") or []
        if d["display_name"].strip().lower() not in MAPPED and not d["display_name"].strip().lower().startswith(INVISIBLE)
    )
    rel = [(variation.get(f) or {}).get("name", "") for f in ("decor", "decor_color", "decor_glass")]
    return json.dumps([rel, visible], ensure_ascii=False)


def pages(client: StrapiClient, path: str, params: dict[str, Any]) -> list[dict[str, Any]]:
    out, page = [], 1
    while True:
        body = client.request("GET", path, params={**params, **PUBLISHED, "pagination[page]": page, "pagination[pageSize]": 100})
        out += body["data"]
        if page >= body["meta"]["pagination"]["pageCount"]:
            return out
        page += 1


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--delete-unused", action="store_true")
    parser.add_argument("--journal", default="import-runs/dedupe-edge-photos.jsonl")
    args = parser.parse_args()
    client = StrapiClient(Settings())
    journal = Path(args.journal)

    def log(**entry: Any) -> None:
        with journal.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    variations = pages(client, "api/product-variations", {
        "fields[0]": "catalog_attributes", "fields[1]": "attribute_definitions", "fields[2]": "active",
        "populate[image][fields][0]": "url", "populate[decor][fields][0]": "name",
        "populate[decor_color][fields][0]": "name", "populate[decor_glass][fields][0]": "name",
        "populate[products][fields][0]": "name",
    })
    groups: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for v in variations:
        product = (v.get("products") or [{}])[0].get("documentId", "")
        groups[(product, look_key(v))].append(v)

    changes, before_ids, after_ids = [], Counter(), Counter()
    for (_, _), rows in groups.items():
        photos = Counter(r["image"]["id"] for r in rows if r.get("image"))
        if len(photos) < 2:
            continue
        main_id = photos.most_common(1)[0][0]
        main_url = next(r["image"]["url"] for r in rows if r.get("image") and r["image"]["id"] == main_id)
        for r in rows:
            if r.get("image") and r["image"]["id"] != main_id:
                changes.append((r, main_id, main_url))
    for v in variations:
        if v.get("image"):
            before_ids[v["image"]["id"]] += 1
    after_ids = before_ids.copy()
    for r, main_id, _ in changes:
        after_ids[r["image"]["id"]] -= 1
        after_ids[main_id] += 1
    unused = sorted(i for i, n in after_ids.items() if n == 0)

    print(("APPLY" if args.apply else "DRY RUN") + f" on {client.settings.strapi_url}")
    print(f"variations re-linked to their look's main photo: {len(changes)}")
    print(f"photos no longer used by any variation: {len(unused)}")
    for r, _, main_url in changes[:8]:
        print("  ", (r.get("products") or [{}])[0].get("name"), "|", (r.get("decor_color") or {}).get("name"), "|",
              r["image"]["url"].rsplit("/", 1)[-1][:40], "->", main_url.rsplit("/", 1)[-1][:40])
    if not args.apply:
        return
    for r, main_id, _ in changes:
        client.request("PUT", f"api/product-variations/{r['documentId']}", params=PUBLISHED, json={"data": {"image": main_id}})
        log(action="relink", variation=r["documentId"], before=r["image"]["id"], after=main_id)
    if args.delete_unused:
        for media_id in unused:
            # only files that no other content (products, categories, globals) uses
            info = client.request("GET", f"api/upload/files/{media_id}", params={"populate": "related"})
            if info.get("related"):
                log(action="keep-media", media=media_id, reason="still related")
                continue
            client.http.request("DELETE", f"api/upload/files/{media_id}")
            log(action="delete-media", media=media_id, url=info.get("url"), name=info.get("name"))
    print("done; journal:", journal)


if __name__ == "__main__":
    main()
