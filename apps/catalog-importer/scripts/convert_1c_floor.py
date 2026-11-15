"""Convert floor stock exports (.xls) into an importer workbook, sheet "Підлога" with subcategories.

* 9_11-style supplier availability (laminate, skirting, underlay, cork, panels): grouped by brand / series.
* 06.11-style roll stock (linoleum ПВХ, carpet): collection / colour + roll width; cut pieces are ignored.

Files carry no prices: every product is written inactive ("Активний: ні") until prices are added.
Discontinued rows ("Х ..." / "X ...", "не актуальне", "Виведений", "Розпродаж") and rows with no stock are skipped.

Usage: PYTHONPATH=<xlrd> .venv/bin/python scripts/convert_1c_floor.py OUT.xlsx REPORT.json FILE.xls [...]
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
from collections import defaultdict
from dataclasses import asdict, dataclass, field
from pathlib import Path

import openpyxl
import xlrd


@dataclass
class Item:
    category: str
    brand: str
    product: str
    kind: str  # element type: Ламінат, Плінтус, З'єднувач, Підложка …
    color: str
    attrs: dict[str, str] = field(default_factory=dict)
    sku: str = ""
    source: str = ""


def stable(*parts: str) -> str:
    return hashlib.sha256("|".join(parts).encode()).hexdigest()[:10]


def cut(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip(" ,.;")


def discontinued(text: str) -> bool:
    return bool(re.match(r"\s*[ХX]\s", text)) or re.search(r"не актуальн|виведен|розпродаж|снят с производства", text, re.I) is not None


def rows(file: Path):
    sheet = xlrd.open_workbook(str(file), formatting_info=True).sheet_by_index(0)
    raw = []
    for r in range(sheet.nrows):
        level = sheet.rowinfo_map[r].outline_level if r in sheet.rowinfo_map else 0
        raw.append((level, [str(v).strip() for v in sheet.row_values(r)]))
    return raw


# ---------------------------------------------------------------- 9_11: supplier availability

KIND = [
    (r"ламінат|м2\)\s*/\s*\d+\s*шт", "Ламінат"), (r"^плінтус\b", "Плінтус"), (r"з['`]?єднувач", "З'єднувач"),
    (r"закінчення\s+ліве", "Закінчення ліве"), (r"закінчення\s+праве", "Закінчення праве"), (r"закінчення", "Закінчення (ліве+праве)"),
    (r"кут\s+внутр", "Кут внутрішній"), (r"кут\s+зовн", "Кут зовнішній"), (r"\bкут\b", "Кут"), (r"заглушк", "Заглушка"),
    (r"кріплення|кліпс", "Кріплення"), (r"блок", "Блок універсальний"), (r"панель", "Панель"),
    (r"підкладка|підложка|еко-плита|multiprotec|рулон", "Підложка"),
]


def kind_of(name: str) -> str:
    n = name.lower()
    for pattern, label in KIND:
        if re.search(pattern, n):
            return label
    return "Елемент"


def category_of(brand: str, group: str, kind: str) -> str:
    g = f"{brand} {group}".lower()
    if kind == "Ламінат":
        return "Ламінат"
    if "плінтус" in g or kind not in ("Підложка", "Панель", "Елемент"):
        return "Плінтус"
    if kind == "Панель" or "woodline" in g:
        return "Стінові панелі"
    return "Підложка"


def laminate(brand: str, header: str, name: str) -> tuple[str, str, dict[str, str]] | None:
    attrs = {}
    if (m := re.search(r"\(([\d.,]+)\s*м2?\)\s*/\s*(\d+)\s*шт", name)):
        attrs["Площа в пачці, м2"] = m[1].replace(",", ".")
        attrs["Дощок в пачці"] = m[2]
    body = re.sub(r"^\s*[\w-]*\d[\w-]*\s+", "", name)  # supplier code
    body = re.sub(r"\(.*$", "", body.split("Ламінат", 1)[-1])
    body = re.sub(r"\b\d{3,4}\s*[xх*]\s*\d{3}(\s*мм)?|\bStop\b|\bфаска\b|\b4V\b", " ", body, flags=re.I)
    if (m := re.match(r"\s*(.+?)\s+(\d{1,2}/\d{2})\s+(.+)$", body)):
        collection, cls, color = m[1], m[2], m[3]
    else:  # no class in the name (Kronopol, some Kronospan): take the collection from the 1C group
        hm = re.match(r"\s*(?:(\d{1,2}/\d{2})\s+)?(.+?)\s*(?:\(|,|$)", header)
        cls = hm[1] if hm and hm[1] else ""
        collection = hm[2] if hm else header
        words = [w for w in collection.split() if len(w) > 1]
        color = body
        for w in words:
            color = re.sub(r"(?i)(?<!\w)" + re.escape(w) + r"(?!\w)", " ", color)
        color = re.sub(r"^\s*\d+\s+", "", color)
    collection = re.sub(r"\s+", " ", re.sub(r"(?i)\b(wr|4v)\b", lambda x: x[0].upper(), collection)).strip(" ,")
    if cls:
        attrs["Клас / товщина"] = cls
    label = brand.title() if brand.isupper() else brand
    product = collection if collection.lower().startswith(label.lower()) else f"{label} {collection}".strip()
    return product, cut(color), attrs


def availability(file: Path) -> tuple[list[Item], list[dict]]:
    items, skipped = [], []
    stack: list[tuple[int, str]] = []
    data = rows(file)
    for i, (level, c) in enumerate(data[4:], start=4):
        nxt = data[i + 1][0] if i + 1 < len(data) else -1
        name = c[2]
        while stack and stack[-1][0] >= level:
            stack.pop()
        if nxt > level and not c[1]:
            stack.append((level, name))
            continue
        path = [cut(s[1]) for s in stack]
        if not path:
            continue
        brand = cut(path[0]).replace("CLASSEN плінтус", "CLASSEN")
        groups = path[1:]
        stock = sum(float(x) for x in (c[3], c[5]) if re.fullmatch(r"-?[\d.]+", x or ""))
        why = ("discontinued" if discontinued(name) or any(discontinued(g) for g in groups)
               else "no stock" if stock <= 0 else "")
        if not why and re.search(r"взірц|зразок|образц|стенд", name, re.I):
            why = "samples"
        if not why and re.search(r"ламінат", name, re.I) and re.match(r"\s*(\d{1,2}/\d{2}\s+)?" + re.escape(brand) + r"\s*,?$", (groups or [""])[-1] , re.I):
            why = "no collection"
        if why:
            skipped.append({"file": file.name, "group": " / ".join(path), "name": name, "why": why})
            continue
        kind = kind_of(re.sub(r"^\s*[\w.-]*\d[\w.-]*\s+", "", name))
        header = next((g for g in reversed(groups) if not re.search(r"акці|грн|евро|€", g, re.I)), brand)
        category = category_of(brand, " ".join(groups), kind)
        if category == "Плінтус":  # one product per skirting series; element type and colour are variations
            header = groups[0] if groups else brand
        if category == "Ламінат":
            product, color, attrs = laminate(brand, header, name)
        else:
            series = re.sub(r"(?i)^плінтус\s+|^підложка\s+", "", header).strip(" ,") or brand
            label = brand.title() if brand.isupper() else brand
            product = series if label.lower() in series.lower() else f"{label} {series}"
            color = re.sub(r"^\s*[\w.]*\d[\w.]*\.?\s+(?=\D)", "", name)  # leading code
            color = re.sub(r",\s*шт\s*$", "", color)
            attrs = {}
            if category == "Плінтус":
                if (m := re.search(r"\((\d+)\s*[хx]\s*(\d+)\s*[хx]\s*(\d+)\)", color)):
                    attrs["Розмір, мм"] = f"{m[1]}×{m[2]}×{m[3]}"
                    color = color.replace(m[0], " ")
                if re.search(r"фольга", color, re.I):
                    attrs["Виконання"] = "Фольга"
                color = re.sub(r"(?i)^(плінтус|з['`]?єднувач|закінчення( ліве| праве)?(\s*\(ліве\+праве\))?|кут (внутрішній|зовнішній))\s*", "", color.strip())
                for w in re.split(r"[\s,/]+", series) + ["Arbiton", "Arbito", "Classen", "фольга"]:
                    if len(w) > 1:
                        color = re.sub(r"(?i)\(?(?<![\w-])" + re.escape(w) + r"(?![\w-])\)?", " ", color)
                color = re.sub(r"\(\s*\)|\b(L|ZL|ZP|ZР|NW|NZ)\b|;", " ", color)
        items.append(Item(category, brand, cut(product), kind, cut(color) or "Стандарт", attrs, c[1].replace(".0", ""), name))
    return items, skipped


# ---------------------------------------------------------------- 06.11: roll stock

def rolls(file: Path) -> tuple[list[Item], list[dict]]:
    items, skipped = [], []
    group = collection = ""
    for level, c in rows(file)[7:]:
        name = c[0]
        if level == 1:
            group = name
        elif level == 2:
            collection = name
        elif level == 3:
            if group.lower().startswith("прочее") or discontinued(collection) or discontinued(name):
                skipped.append({"file": file.name, "group": f"{group} / {collection}", "name": name, "why": "discontinued/samples"})
                continue
            if not c[6] or float(c[6] or 0) <= 0:
                skipped.append({"file": file.name, "group": f"{group} / {collection}", "name": name, "why": "no stock"})
                continue
            category = "Ковролін" if group.lower().startswith("ковролін") else "Лінолеум"
            brand = re.sub(r"(?i)^(ковролін|пвх)\s+|\s*\(.*?\)\s*", " ", group).strip()
            brand = re.sub(r"\s+(Україна|Євро)\b.*", "", brand).strip()
            coll = cut(re.sub(r"\(.*?\)|\b\d+([.,]\d+)?\s*(/\s*\d+([.,]\d+)?)*\s*(м|m)\b|ексклюзив|эксклюзив|\b\d[\d.,;/ ]*\s*(м|m)\b", " ", collection))
            coll = re.sub(r"(?i)^дор\.\s*", "", coll)
            width = ""
            if (m := re.search(r"\b([2-5])00\b", name)) and "BEAUFLOR" in group.upper():
                width = m[1]
            elif (m := re.search(r"(?<![\d.,])([2-5])\s*м\b", name)):
                width = m[1]
            elif (m := re.search(r"(\d)[.,](\d{1,2})\b", name)):
                width = f"{m[1]}.{m[2]}".rstrip("0").rstrip(".")
            elif (m := re.search(r"/(\d(?:[.,]\d)?)\s*м", name)):
                width = m[1].replace(",", ".")
            color = re.sub(r"^\s*[\d ]{2,10}\s+", "", name)
            for w in coll.split():
                color = re.sub(r"(?i)(?<!\w)" + re.escape(w) + r"(?!\w)", " ", color)
            color = re.sub(r"\d[.,]\d{1,2}\s*м?|/\s*\d[\d.,]*\s*м|\b\d клас\b|\bRV\b|\b\d{3}\b", " ", color)
            color = re.sub(r"^[\s/]+|[\s/]+$", "", re.sub(r"\s+", " ", color))
            color = re.sub(r"(?<![\d.,])[2-5]\s*м\b|\b[2-5]00\b", " ", color).strip()
            if "tarkett" in group.lower() and (m := re.match(r"(.+?\d+)\s+[а-яіїєґ\s-]+$", color, re.I)):
                color = m[1]  # "Аврора 1 актіва" -> "Аврора 1"
            if " / " in color:  # "Beige / Бежевий" -> Ukrainian part
                color = color.split(" / ")[-1]
            attrs = {"Ширина рулону, м": width} if width else {}
            items.append(Item(category, brand, cut(f"{brand} {coll}"), category, cut(color).capitalize() or "Стандарт", attrs, c[3], name))
    return items, skipped


def main() -> None:
    out, report, *files = sys.argv[1:]
    import os
    photos = {}  # PHOTOS=matches.json: approved photo per (product, colour, element type), path relative to OUT
    if os.environ.get("PHOTOS"):
        for m in json.loads(Path(os.environ["PHOTOS"]).read_text()):
            if m.get("file"):
                photos[(m["product"], m["color"], m["kind"])] = m["file"]
    items, skipped = [], []
    for f in map(Path, files):
        got, sk = rolls(f) if rows(f)[4][1][0] == "Склад" else availability(f)
        items += got
        skipped += sk
    products: dict[tuple[str, str], list[Item]] = defaultdict(list)
    for it in items:
        products[(it.category, it.product)].append(it)

    attr_cols = sorted({k for it in items for k in it.attrs})
    book = openpyxl.Workbook()
    sheet = book.active
    sheet.title = "Підлога"
    sheet.append(["ID товару", "Назва", "Клас", "Бренд", "ID Варіації", "Тип покриття", "Покриття", *attr_cols,
                  "Ціна", "Фото", "Активний", "артикул"])
    seen: set[str] = set()
    for (category, product), group in sorted(products.items()):
        pid = "floor-" + stable(category, product)
        uniq = {}
        for it in group:  # same colour/kind/attrs listed twice (two stock rows) -> one variation
            uniq.setdefault((it.kind, it.color, tuple(sorted(it.attrs.items()))), it)
        for index, it in enumerate(uniq.values()):
            vid = "floor-v" + stable(pid, it.kind, it.color, json.dumps(it.attrs, sort_keys=True))
            if vid in seen:
                continue
            seen.add(vid)
            first = index == 0
            sheet.append([pid, product if first else None, category if first else None, (group[0].brand or None) if first else None,
                          vid, it.kind, it.color, *[it.attrs.get(k) for k in attr_cols], 0,
                          photos.get((product, it.color, it.kind)), "ні", it.sku or None])  # no price yet: 0, hidden
    for cell in sheet[1]:
        cell.font = openpyxl.styles.Font(bold=True)
    book.save(out)
    Path(report).write_text(json.dumps({"products": len(products), "variations": len(seen), "skipped": skipped,
                                        "items": [asdict(i) for i in items]}, ensure_ascii=False, indent=1))
    by = defaultdict(lambda: [0, 0])
    for (cat, _), g in products.items():
        by[cat][0] += 1
        by[cat][1] += len(g)
    print(f"products {len(products)}, variations {len(seen)}, skipped {len(skipped)}")
    for cat, (p, v) in sorted(by.items()):
        print(f"  {cat}: товарів {p}, рядків {v}")


if __name__ == "__main__":
    main()
