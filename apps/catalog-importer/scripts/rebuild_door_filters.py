"""Rebuild door filters: Колір / Скло / Тип покриття families from variations; drop junk door groups.
Usage: python rebuild_door_filters.py URL TOKEN DOORS_JSON|- JOURNAL [--write]
DOORS_JSON "-" fetches the door products from the CMS itself. A missing price group ("cost") is created."""
import json, sys, urllib.request, urllib.parse, collections, re, os
sys.path.insert(0, os.path.dirname(__file__)); import door_filter_rules as rules
URL, TOKEN, DOORS, JOURNAL = sys.argv[1:5]; WRITE = "--write" in sys.argv
log = open(JOURNAL, "a")
def call(method, path, params=None, body=None):
    url = f"{URL}/api/{path}" + ("?" + urllib.parse.urlencode(params) if params else "")
    req = urllib.request.Request(url, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Authorization": "Bearer " + TOKEN, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as r: out = r.read()
    except urllib.error.HTTPError as e: raise SystemExit(f"{method} {path}: {e.code} {e.read()[:400]}")
    if method != "GET": log.write(json.dumps({"method": method, "path": path, "body": body}, ensure_ascii=False) + "\n"); log.flush()
    return json.loads(out) if out else None
def all_pages(path, params):
    rows, page = [], 1
    while True:
        d = call("GET", path, {**params, "pagination[page]": page, "pagination[pageSize]": 100})
        rows += d["data"]
        if page >= d["meta"]["pagination"]["pageCount"]: return rows
        page += 1

GROUPS = {"kolir": ("Колір", rules.color_family), "sklo": ("Скло / вставка", rules.glass_family), "pokryttia": ("Тип покриття", rules.coating),
          "kromka": ("Кромка", rules.edge_family)}
SLUGS = {"Білий": "bilyi", "Кремовий / бежевий": "kremovyi", "Сірий": "siryi", "Чорний / антрацит": "chornyi", "Бетон / камінь": "beton",
         "Світле дерево": "svitle-derevo", "Натуральне дерево": "naturalne-derevo", "Темне дерево": "temne-derevo",
         "Дзеркало": "dzerkalo", "Склопакет": "sklopaket", "Чорне скло": "chorne-sklo", "Сатин": "satyn", "Молдинг / вставка": "moldyng", "Глухе": "glukhe",
         "Звичайна": "zvychaina", "Чорна матова": "chorna-matova", "Алюмінієва": "aliuminiieva",
         "Алюмінієва чорна": "aliuminiieva-chorna", "Алюмінієва сіра": "aliuminiieva-sira"}
TR = dict(zip("абвгґдеєжзиіїйклмнопрстуфхцчшщьюя", ["a","b","v","h","g","d","e","ie","zh","z","y","i","i","i","k","l","m","n","o","p","r","s","t","u","f","kh","ts","ch","sh","shch","","iu","ia"]))
def vslug(group, name):
    text = "".join(TR.get(ch, ch) for ch in name.lower())
    return f"{group}-" + (SLUGS.get(name) or re.sub(r"[^a-z0-9]+", "-", text).strip("-") or "x")

def values_of(variation, fn, group):
    a = variation.get("catalog_attributes") or {}
    if group == "kolir": return fn((variation.get("decor_color") or {}).get("name"))
    if group == "sklo": return fn((variation.get("decor_glass") or {}).get("name") or a.get("glass"))
    if group == "kromka": return fn(next((v for k, v in a.items() if k.startswith("кромка")), None))
    return fn(a.get("тип_покриття"))

def fetch_doors():
    cats = all_pages("categories", {"fields[0]": "slug", "status": "published", "populate[parent][fields][0]": "slug"})
    parent = {c["slug"]: (c["parent"] or {}).get("slug") for c in cats}
    def root(slug):
        while parent.get(slug): slug = parent[slug]
        return slug
    params = {"status": "published", "fields[0]": "name", "fields[1]": "active",
              "populate[category][fields][0]": "slug", "populate[filter_values][fields][0]": "name",
              "populate[product_variations][fields][0]": "catalog_attributes", "populate[product_variations][fields][1]": "active",
              "populate[product_variations][populate][decor_color][fields][0]": "name",
              "populate[product_variations][populate][decor_glass][fields][0]": "name"}
    for i, slug in enumerate(s for s in parent if root(s) == "dveri"):
        params[f"filters[category][slug][$in][{i}]"] = slug
    rows, page = [], 1
    while True:  # 50 per page: products carry all their variations
        d = call("GET", "products", {**params, "pagination[page]": page, "pagination[pageSize]": 50})
        rows += d["data"]
        if page >= d["meta"]["pagination"]["pageCount"]: return rows
        page += 1

prods = fetch_doors() if DOORS == "-" else json.load(open(DOORS))
plan = {}
for p in prods:
    vs = [v for v in p["product_variations"] if v.get("active") is not False] or p["product_variations"]
    plan[p["documentId"]] = {g: sorted({x for v in vs if (x := values_of(v, fn, g))}) for g, (_, fn) in GROUPS.items()}
counts = {g: collections.Counter(x for d in plan.values() for x in d[g]) for g in GROUPS}
for g, c in counts.items(): print(g, dict(c.most_common()))
print("products without any value:", sum(1 for d in plan.values() if not any(d.values())), "of", len(plan))

groups = all_pages("filter-groups", {"status": "published", "populate[categories][fields][0]": "slug", "populate[filter_values][fields][0]": "slug"})
cats = {c["slug"]: c["documentId"] for c in all_pages("categories", {"fields[0]": "slug", "status": "published"})}
door_slugs = {"dveri", "mizhkimnatni", "dveri-nakladky-na-vkhidni-dveri"} | {s for s in cats if s.startswith("dveri-")}
DROP = [g for g in groups if g["type"] != "price" and g["slug"] not in ("cost", "колір", "тип-покриття") and g["slug"] not in GROUPS
        and {c["slug"] for c in g["categories"]} and {c["slug"] for c in g["categories"]} <= door_slugs]
DROP += [g for g in groups if not g["categories"] and g["slug"] not in GROUPS and g["slug"] != "cost"]
print("drop groups:", [(g["name"], len(g["filter_values"])) for g in DROP])
if not WRITE: raise SystemExit("dry run")

# 1) new groups + values
gid, vid = {}, {}
existing = {g["slug"]: g for g in groups}
for g, (name, _) in GROUPS.items():
    if g in existing: gid[g] = existing[g]["documentId"]
    else: gid[g] = call("POST", "filter-groups", {"status": "published"}, {"data": {"name": name, "slug": g, "type": "select", "categories": [cats["dveri"]]}})["data"]["documentId"]
    have = {v["slug"]: v["documentId"] for v in (existing.get(g) or {}).get("filter_values", [])}
    for value in counts[g]:
        s = vslug(g, value)
        vid[(g, value)] = have.get(s) or call("POST", "filter-codes", {"status": "published"}, {"data": {"name": value, "slug": s, "filter_group": gid[g]}})["data"]["documentId"]
# 2) price group also for all doors (created when the CMS has none)
cost = existing.get("cost")
if cost is None:
    call("POST", "filter-groups", {"status": "published"}, {"data": {"name": "Ціна", "slug": "cost", "type": "price",
         "categories": [cats[s] for s in ("dveri", "pidloha", "furnitura") if s in cats]}})
else:
    call("PUT", f"filter-groups/{cost['documentId']}", {"status": "published"}, {"data": {"categories": sorted({cats[c["slug"]] for c in cost["categories"]} | {cats["dveri"]})}})
# 3) products
for i, (doc, d) in enumerate(plan.items()):
    ids = [vid[(g, x)] for g in GROUPS for x in d[g]]
    call("PUT", f"products/{doc}", {"status": "published"}, {"data": {"filter_values": ids}})
    if i % 100 == 0: print("products", i)
# 4) old shared groups: unlink from door categories
for slug in ("колір", "тип-покриття"):
    g = existing.get(slug)
    if g: call("PUT", f"filter-groups/{g['documentId']}", {"status": "published"}, {"data": {"categories": [cats[c["slug"]] for c in g["categories"] if c["slug"] not in door_slugs]}})
# 5) drop junk groups and their values
for g in DROP:
    for v in g["filter_values"]: call("DELETE", f"filter-codes/{v['documentId']}")
    call("DELETE", f"filter-groups/{g['documentId']}")
# 6) unused values of the old shared groups
for slug in ("колір", "тип-покриття"):
    for v in all_pages("filter-codes", {"status": "published", "filters[filter_group][slug][$eq]": slug, "populate[products][fields][0]": "documentId"}):
        if not v["products"]: call("DELETE", f"filter-codes/{v['documentId']}")
print("done")
