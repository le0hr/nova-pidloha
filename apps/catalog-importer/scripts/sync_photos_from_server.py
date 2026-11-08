"""Copy variation photo links from the deployed CMS to the local one (same external_id, same file name).

Files must already exist in the local media library (same content-addressed names as on the server).
Only variations whose local photo differs are updated. Usage:
  STRAPI_URL/STRAPI_TOKEN = local; SERVER_ENV=.env (server) ; [--apply] [--journal FILE]
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any

from app.config import Settings
from app.strapi.client import StrapiClient

PUB = {"status": "published"}


def variations(client: StrapiClient) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    page = 1
    while True:
        body = client.request("GET", "api/product-variations", params={
            **PUB, "pagination[page]": page, "pagination[pageSize]": 100,
            "fields[0]": "external_id", "populate[image][fields][0]": "name"})
        for v in body["data"]:
            if v.get("external_id"):
                out[v["external_id"]] = v
        if page >= body["meta"]["pagination"]["pageCount"]:
            return out
        page += 1


def stem(name: str) -> str:
    return Path(name).stem


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--journal", default="import-runs/sync-photos-local.jsonl")
    args = ap.parse_args()
    local = StrapiClient(Settings())
    env = dict(line.split("=", 1) for line in Path(os.environ.get("SERVER_ENV", ".env")).read_text().splitlines()
               if "=" in line and not line.startswith("#"))
    server = StrapiClient(Settings(strapi_url=env["STRAPI_URL"].strip(), strapi_token=env["STRAPI_TOKEN"].strip()))
    files = {stem(f["name"]): f["id"] for f in local.media()}
    remote, mine = variations(server), variations(local)
    todo, missing = [], 0
    for ext, rv in remote.items():
        lv = mine.get(ext)
        if not lv or not rv.get("image"):
            continue
        fid = files.get(stem(rv["image"]["name"]))
        if fid is None:
            missing += 1
            continue
        if (lv.get("image") or {}).get("id") != fid:
            todo.append((lv, fid))
    print(("APPLY" if args.apply else "DRY RUN"), "local:", local.settings.strapi_url,
          "| to link:", len(todo), "| server photos missing locally:", missing)
    if not args.apply:
        return
    with open(args.journal, "a", encoding="utf-8") as j:
        for lv, fid in todo:
            local.request("PUT", f"api/product-variations/{lv['documentId']}", params=PUB, json={"data": {"image": fid}})
            j.write(json.dumps({"variation": lv["documentId"], "before": (lv.get("image") or {}).get("id"), "after": fid}) + "\n")
    print("done")


if __name__ == "__main__":
    main()
