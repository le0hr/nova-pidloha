"""Floor filters: Виробник (brand), Клас зносостійкості, Фаска, from the products' variations; groups on category "pidloha".
The furniture "Колір" group is unlinked from floor (its values are door/furniture colours).

Usage: python rebuild_floor_filters.py URL TOKEN JOURNAL [--write]
"""
import collections
import json
import re
import sys
import urllib.parse
import urllib.request

URL, TOKEN, JOURNAL = sys.argv[1:4]
WRITE = "--write" in sys.argv
log = open(JOURNAL, "a")


def call(method, path, params=None, body=None):
    url = f"{URL}/api/{path}" + ("?" + urllib.parse.urlencode(params) if params else "")
    req = urllib.request.Request(url, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Authorization": "Bearer " + TOKEN, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as response:
            out = response.read()
    except urllib.error.HTTPError as error:
        raise SystemExit(f"{method} {path}: {error.code} {error.read()[:400]}")
    if method != "GET":
        log.write(json.dumps({"method": method, "path": path, "body": body}, ensure_ascii=False) + "\n")
        log.flush()
    return json.loads(out) if out else None


def all_pages(path, params):
    rows, page = [], 1
    while True:
        data = call("GET", path, {**params, "pagination[page]": page, "pagination[pageSize]": 100})
        rows += data["data"]
        if page >= data["meta"]["pagination"]["pageCount"]:
            return rows
        page += 1


FLOOR = ["pidloha", "pidloha-laminat", "pidloha-pidlozhka"]
GROUPS = {"vyrobnyk": "Виробник", "klas": "Клас зносостійкості", "faska": "Фаска"}
TR = dict(zip("абвгґдеєжзиіїйклмнопрстуфхцчшщьюя", ["a", "b", "v", "h", "g", "d", "e", "ie", "zh", "z", "y", "i", "i", "i", "k", "l", "m",
                                                   "n", "o", "p", "r", "s", "t", "u", "f", "kh", "ts", "ch", "sh", "shch", "", "iu", "ia"]))


def slug(group, name):
    text = "".join(TR.get(ch, ch) for ch in name.lower())
    return f"{group}-" + re.sub(r"[^a-z0-9]+", "-", text).strip("-")


params = {"status": "published", "fields[0]": "name", "populate[brand][fields][0]": "name",
          "populate[product_variations][fields][0]": "catalog_attributes", "populate[product_variations][fields][1]": "active"}
for i, s in enumerate(FLOOR):
    params[f"filters[category][slug][$in][{i}]"] = s
products = all_pages("products", params)

plan = {}
for p in products:
    variations = [v for v in p["product_variations"] if v.get("active") is not False] or p["product_variations"]
    attrs = [v.get("catalog_attributes") or {} for v in variations]
    plan[p["documentId"]] = {
        "vyrobnyk": [p["brand"]["name"]] if p.get("brand") else [],
        "klas": sorted({f"{a['клас_зносостійкості']} клас" for a in attrs if a.get("клас_зносостійкості")}),
        "faska": ["З фаскою"] if any(str(a.get("фаска", "")).lower() == "так" for a in attrs) else [],
    }
counts = {g: collections.Counter(x for d in plan.values() for x in d[g]) for g in GROUPS}
for g, c in counts.items():
    print(g, dict(c.most_common()))
if not WRITE:
    raise SystemExit("dry run")

groups = {g["slug"]: g for g in all_pages("filter-groups", {"status": "published", "populate[categories][fields][0]": "slug",
                                                            "populate[filter_values][fields][0]": "slug"})}
cats = {c["slug"]: c["documentId"] for c in all_pages("categories", {"fields[0]": "slug", "status": "published"})}
value_ids = {}
for g, name in GROUPS.items():
    if g in groups:
        gid = groups[g]["documentId"]
    else:
        gid = call("POST", "filter-groups", {"status": "published"},
                   {"data": {"name": name, "slug": g, "type": "select", "categories": [cats["pidloha"]]}})["data"]["documentId"]
    have = {v["slug"]: v["documentId"] for v in (groups.get(g) or {}).get("filter_values", [])}
    for value in counts[g]:
        s = slug(g, value)
        value_ids[(g, value)] = have.get(s) or call("POST", "filter-codes", {"status": "published"},
                                                    {"data": {"name": value, "slug": s, "filter_group": gid}})["data"]["documentId"]
for doc, d in plan.items():
    call("PUT", f"products/{doc}", {"status": "published"}, {"data": {"filter_values": [value_ids[(g, x)] for g in GROUPS for x in d[g]]}})
old = groups.get("колір")
if old and any(c["slug"] in FLOOR for c in old["categories"]):
    call("PUT", f"filter-groups/{old['documentId']}", {"status": "published"},
         {"data": {"categories": [cats[c["slug"]] for c in old["categories"] if c["slug"] not in FLOOR]}})
print("done")
