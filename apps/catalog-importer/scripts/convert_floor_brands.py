"""Convert the floor brand price lists (2026-11) into one importer workbook (sheet "Підлога").

Sources (SRC directory): egger.xlsx, excellent.xlsx, honnex.xlsx, divino.xlsx, firmfit.xlsx (same column layout),
vitolux.xlsx (distributor "programs": Kronopol, Aurum, Classen, Kastamonu, Vitality, Grandeco, linoleum),
virtuo.xls (Arbiton, Falquon, Gerflor, Unilin vinyl; decor photos as hyperlinks).

Product = brand + collection, variation = decor. Price = recommended retail per m² (РРЦ / «роздріб»);
when a promotion is running the promo retail price is used and the product is marked «Акція».
Categories: Ламінат, Вінілова підлога/Замкова SPC, Вінілова підлога/Клейова LVT, Лінолеум.
Skipped on request: Kronospan (already imported from the Morozov list), skirting, profiles, underlay, glue, panels.
A product is active only when one of its variations has a photo (PHOTOS=matches.json, keyed by product + decor).

Usage: PYTHONPATH=<xlrd> .venv/bin/python scripts/convert_floor_brands.py SRC OUT.xlsx REPORT.json
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path

import openpyxl
import xlrd

LAMINATE, CLICK, GLUE, LINO = "Ламінат", "Вінілова підлога/Замкова SPC", "Вінілова підлога/Клейова LVT", "Лінолеум"


def stable(*parts: object) -> str:
    return hashlib.sha256("|".join(str(p) for p in parts).encode()).hexdigest()[:10]


def num(value: object) -> float | None:
    if value is None:
        return None
    text = str(value).replace("\xa0", "").replace(" ", "").replace(",", ".").strip()
    match = re.match(r"^-?\d+(\.\d+)?", text)
    return float(match.group()) if match else None


def text(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        value = int(value)
    return re.sub(r"\s+", " ", str(value)).strip()


def title(value: str) -> str:
    """'EXCELLENT 4V 33' -> 'Excellent 4V 33'; keeps short codes (4V, WR, LVT, SPC, XL) upper-case."""
    words = []
    for word in value.split():
        keep = re.fullmatch(r"[0-9A-ZА-ЯІЇЄҐ+\-/]{1,3}|\d.*|[A-Z]{2,4}", word) and not re.fullmatch(r"[A-ZА-Я]{4,}", word)
        words.append(word if keep or not word.isupper() else word.capitalize())
    return " ".join(words)


def board(length: object, width: object, thickness: object) -> str:
    parts = [text(v).replace(".0", "") for v in (length, width) if num(v)]
    t = num(thickness)
    if t:
        parts.append(f"{t:g}")
    return "×".join(parts)


def item(**fields: object) -> dict:
    return {k: v for k, v in fields.items() if v not in (None, "")}


# ---------------------------------------------------------------- same-layout brand lists
STANDARD = {  # file -> (brand, default category)
    "egger.xlsx": ("Egger", LAMINATE),
    "excellent.xlsx": ("Balterio", LAMINATE),
    "honnex.xlsx": ("Honnex", LAMINATE),
    "divino.xlsx": ("Divino", GLUE),
    "firmfit.xlsx": ("Firmfit", CLICK),
}


def parse_standard(path: Path, brand: str, default_category: str) -> list[dict]:
    rows = [list(r) for r in openpyxl.load_workbook(path, read_only=True, data_only=True).worksheets[0].iter_rows(values_only=True)]
    out, header, category = [], None, default_category
    for row in rows:
        cells = [text(c) for c in row]
        filled = [c for c in cells if c]
        if "Колекція" in cells:
            header = {}
            for i, name in enumerate(cells):
                header.setdefault(name.lower(), []).append(i)
            continue
        if len(filled) == 1 and filled[0] in {"RIGID", "FLEX FINYL"}:
            category = CLICK
            continue
        if header is None or len(filled) < 8:
            continue
        def col(name: str, n: int = 0) -> object:
            key = next((k for k in header if k == name or k.startswith(name + " ")), None)
            return row[header[key][n]] if key and len(header[key]) > n else None
        collection = text(col("колекція"))
        lock = text(col("замок"))
        maker = text(col("виробник")).lower()
        row_brand = "Unilin" if brand == "Balterio" and "unilin" in maker else brand
        decor_no = text(col("артикул №"))
        decor = text(col("назва декора")) or decor_no
        retail = num(col("роздріб"))
        price, mark = retail, ""
        if retail is None and num(col("прайс")):  # retail replaced by a note ("розпродаж"): dealer price +40%
            price, mark = round(num(col("прайс")) * 1.4, 2), "Розпродаж"
        promo = num(col("акція"))
        if promo and len(header.get("роздріб", [])) > 1 and num(col("роздріб", 1)):
            price, mark = num(col("роздріб", 1)), "Акція"
        price_cols = [i for k, v in header.items() if k.startswith(("роздріб", "прайс")) for i in v]
        tail = " ".join(cells[max(price_cols, default=0):]).lower()
        if "розпродаж" in tail:
            mark = "Розпродаж"
        elif "акція" in tail:
            mark = "Акція"
        cat = category
        if brand == "Divino":
            cat = GLUE if "клей" in lock.lower() else CLICK
        if brand == "Firmfit":
            cat = GLUE if ("клеє" in lock.lower() or "dryback" in collection.lower()) else CLICK
        name = {"Divino": "Divino" + (" Rigit" if "rigit" in collection.lower() else ""),
                "Honnex": "Honnex Hydro"}.get(brand) or f"{row_brand} {title(collection)}"
        wear = text(col("клас"))
        out.append(item(
            source=path.name, brand=row_brand, product=re.sub(r"\s+", " ", name), category=cat,
            decor=title(decor) if decor.isupper() else decor, decor_no=decor_no, price=price, mark=mark,
            wear=(re.search(r"3[1-4]", wear) or [""])[0], thickness=num(col("толщина") or col("товщина")),
            size=board(col("довжина"), col("ширина"), col("толщина") or col("товщина")),
            pack=num(col("м2/уп")), planks=num(col("кол-во пл/уп")),
            bevel=text(col("фаска")).replace("-", ""), lock=lock, status=text(col("статус")),
        ))
    return out


# ---------------------------------------------------------------- Vitolux distributor programs
VITOLUX = {  # sheet prefix -> (maker, category)
    "Kronopol  ": ("Kronopol", LAMINATE), "Kronopol Aurum": ("Kronopol Aurum", LAMINATE), "Classen": ("Classen", LAMINATE),
    "KASTAMONU": ("Kastamonu", LAMINATE), "Vitality": ("Vitality", LAMINATE), "Grandeco": ("Grandeco", LAMINATE),
}


def parse_program(ws, maker: str, category: str) -> list[dict]:
    rows = [list(r[:24]) for r in ws.iter_rows(values_only=True)]
    out, header = [], None
    for row in rows:
        cells = [text(c) for c in row]
        low = [c.lower() for c in cells]
        if "колекція" in low and "декор №" in low:
            header = {}
            for i, name in enumerate(low):
                header.setdefault(re.sub(r"\s+", " ", name), []).append(i)
            continue
        if header is None or not cells or not re.fullmatch(r"\d+", cells[0]) or len([c for c in cells if c]) < 8:
            continue
        col = lambda name, n=0: row[header[name][n]] if name in header and len(header[name]) > n else None  # noqa: E731
        collection = text(col("колекція"))
        mark = ""
        if collection.lower().startswith("акція "):
            collection, mark = collection[6:], "Акція"
        collection = re.sub(r"^[ХX]\s+", "", collection).replace("\xa0", " ")
        collection = re.sub(r"4V(?=Pool)", "4V ", re.sub(rf"(?i)^{re.escape(maker.split()[0])}\s+", "", collection))
        if maker == "Classen":  # 3rd "прайс грн/м2" = retail, 5th = promo retail (when filled)
            prices = header.get("прайс грн/м2", [])
            retail = num(row[prices[1]]) if len(prices) > 1 else None
            promo = num(row[prices[3]]) if len(prices) > 3 else None
            price = promo or retail
            mark = "Акція" if promo else mark
        else:
            price = num(col("реком. роздріб"))
            if any("акці" in c for c in low[header.get("нац. роздріб", [0])[0] + 1:]) or num(col("акція")):
                mark = "Акція"
        params = text(col("параметри")).upper()
        parts = params.split("/")
        size = text(col("розмім"))
        length, width = (size.split("*") + [""])[:2]
        thickness = num(parts[0]) if parts else None
        wear = text(col("клас")) or next((p for p in parts[1:] if re.fullmatch(r"3[1-4]", p)), "")
        out.append(item(
            source=f"vitolux.xlsx:{ws.title.strip()}", brand=maker.split()[0], product=f"{maker} {collection}".strip(),
            category=category, decor=text(col("декор назва")), decor_no=text(col("декор №")), price=price, mark=mark,
            wear=(re.search(r"3[1-4]", wear) or [""])[0], thickness=thickness, size=board(length, width, thickness),
            pack=num(col("1 уп/м2")), planks=num(col("1уп/ план.")),
            bevel="4V" if re.search(r"V4|4V", params + collection.upper()) or "4V" in text(col("фаска")).upper() else "",
            water="так" if re.search(r"AQUA|WR|HYDRO|ZERO", (collection + params).upper()) else "",
        ))
    return out


def parse_linoleum(ws) -> list[dict]:
    rows = [list(r[:20]) for r in ws.iter_rows(values_only=True)]
    out, header = [], None
    for row in rows:
        cells = [text(c) for c in row]
        if "Колекція" in cells and "Декор" in cells:
            header = {name: i for i, name in enumerate(cells) if name}
            widths = [(name, i) for name, i in header.items() if re.fullmatch(r"\d+(,\d+)? m", name)]
            continue
        if header is None or len([c for c in cells if c]) < 8 or not cells[header["Декор"]]:
            continue
        offered = [(w, num(row[i])) for w, i in widths if num(row[i])]
        if not offered:
            continue
        brand = title(cells[header["Бренд"]])
        out.append(item(
            source="vitolux.xlsx:Лінолеум", brand=brand, product=f"Лінолеум {brand} {title(cells[header['Колекція']])}",
            category=LINO, decor=title(cells[header["Декор"]]), price=min(p for _, p in offered),
            mark="Під замовлення" if "ЗАМОВЛЕННЯ" in cells[0].upper() else "",
            thickness=num(cells[header.get("Товщина мм", 6)]), base=cells[header["Основа"]],
            wear_layer=cells[header["Захисний шар"]], roll_widths=", ".join(w.replace(" m", " м") for w, _ in offered),
            roll_length=cells[header["Довжина в рулоні"]],
        ))
    return out


# ---------------------------------------------------------------- Virtuo (xls with photo links)
VIRTUO = {"SPC_LVT Arbiton": "Arbiton", "SPC Falquon": "Falquon", "Gerflor Virtuo": "Gerflor", "Unilin Розпродаж!": "Unilin"}


def parse_virtuo(path: Path) -> list[dict]:
    book = xlrd.open_workbook(path, formatting_info=True)
    out = []
    for sheet_name, brand in VIRTUO.items():
        sh = book.sheet_by_name(sheet_name)
        links = {(h.frowx, h.fcolx): h.url_or_path for h in sh.hyperlink_list}
        header, collection = None, ""
        for r in range(sh.nrows):
            cells = [text(c) for c in sh.row_values(r)]
            filled = [c for c in cells if c]
            if "Артикул" in cells and "Найменування" in cells:
                header = {c.split(",")[0].split("*")[0].strip().lower(): i for i, c in enumerate(cells) if c}
                continue
            if header is None:
                continue
            if len(filled) <= 2 and filled:
                if re.search(r"клей|підкладка|розпродаж|новий|знято|ррц|існує|товар під|the floor", filled[0].lower()):
                    if re.search(r"клей|підкладка", filled[0].lower()):
                        header = None  # accessories follow; not imported now
                    continue
                collection = re.sub(r"(?i)колекція|\|.*$|\bnew\b", " ", filled[0])
                collection = re.sub(r"(?i)engineered vinyl flooring rigid|luxury vynil tiles", " ", collection)
                collection = re.sub(r"\s+", " ", collection).strip()
                continue
            if len(filled) < 10:
                continue
            xf = book.xf_list[sh.cell_xf_index(r, 1)]
            if book.colour_map.get(xf.background.pattern_colour_index) == (51, 51, 51):
                continue  # dark grey = discontinued
            col = lambda name: cells[header[name]] if name in header else ""  # noqa: E731
            material = col("матеріал")
            lock = col("замок")
            dry = re.search(r"dry|клей|lvt tiles", (material + " " + lock + " " + collection).lower()) and "click" not in lock.lower()
            pack_text = col("упаковка")
            pack = re.search(r"=\s*([\d.,]+)", pack_text)
            planks = re.match(r"\s*(\d+)", pack_text)
            photo = links.get((r, header.get("фото декору", -1)))
            rrp = col("ррц")
            price = num(rrp) or num(cells[-1]) or num(cells[-2])
            thickness = col("товщина")
            out.append(item(
                source=f"virtuo.xls:{sheet_name}", brand=brand, product=f"{brand} {title(collection)}".strip(),
                category=GLUE if dry else CLICK, decor=title(col("найменування")), decor_no=col("артикул"), price=price,
                mark="Розпродаж" if "Розпродаж" in sheet_name or "розпродаж" in " ".join(cells).lower() else "",
                wear=(re.search(r"3[1-4]|4[1-3]", col("клас")) or [""])[0], thickness=num(thickness),
                size=board(col("довжина"), col("ширина"), None) + (f"×{thickness}" if thickness else ""),
                pack=num(pack.group(1)) if pack else None, planks=num(planks.group(1)) if planks else None,
                bevel=col("фаска"), lock=lock, wear_layer=col("захисний шар"), material=material,
                photo_url=photo if photo and re.search(r"\.(jpe?g|png|webp)", photo, re.I) else "",
            ))
    return out


# ---------------------------------------------------------------- workbook
ATTRS = [("decor_no", "Декор №"), ("wear", "Клас зносостійкості"), ("thickness", "Товщина, мм"), ("size", "Розмір дошки, мм"),
         ("pack", "Площа в пачці, м2"), ("planks", "Планок у пачці"), ("bevel", "Фаска"), ("lock", "Замок"),
         ("water", "Вологостійкий"), ("material", "Матеріал"), ("wear_layer", "Захисний шар"), ("base", "Основа"),
         ("roll_widths", "Ширина рулону"), ("roll_length", "Довжина рулону"), ("status", "Наявність")]


def main() -> None:
    src, out, report = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
    photos = {}
    if os.environ.get("PHOTOS"):
        for m in json.loads(Path(os.environ["PHOTOS"]).read_text()):
            if m.get("file"):  # supplier photos are per article: two decors may share a name
                photos.setdefault((m["product"], m["decor"], m.get("decor_no", "")), m["file"])
                photos.setdefault((m["product"], m["decor"], ""), m["file"])
    photo = lambda i: photos.get((i["product"], i["decor"], i.get("decor_no", ""))) or photos.get((i["product"], i["decor"], ""))  # noqa: E731
    items: list[dict] = []
    for name, (brand, category) in STANDARD.items():
        items += parse_standard(src / name, brand, category)
    book = openpyxl.load_workbook(src / "vitolux.xlsx", read_only=True, data_only=True)
    for ws in book.worksheets:
        if ws.title.startswith("Лінолеум"):
            items += parse_linoleum(ws)
        for prefix, (maker, category) in VITOLUX.items():
            if ws.title.startswith(prefix) and not (prefix == "Kronopol  " and "Aurum" in ws.title):
                items += parse_program(ws, maker, category)
    items += parse_virtuo(src / "virtuo.xls")

    skipped = [i for i in items if not i.get("price") or not i.get("decor")]
    items = [i for i in items if i.get("price") and i.get("decor")]
    for i in items:
        if i.get("water") is None and re.search(r"(?i)aqua|hydro|wr\b|zero", i["product"]):
            i["water"] = "так"
    best: dict[tuple, dict] = {}
    for i in items:  # the same decor twice in one collection: keep the first, unless the board differs
        best.setdefault((i["category"], i["product"], i["decor"], i.get("decor_no", ""), i.get("size", "")), i)
    products: dict[tuple, list] = defaultdict(list)
    for i in best.values():
        products[(i["category"], i["product"])].append(i)

    used = [(k, label) for k, label in ATTRS if any(k in i for i in best.values())]
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Підлога"
    ws.append(["ID товару", "Назва", "Клас", "Бренд", "Позначка", "ID Варіації", "Тип покриття", "Покриття",
               *[label for _, label in used], "Ціна", "Фото", "Активний", "артикул"])
    for (category, product), group in sorted(products.items()):
        pid = "fb-" + stable(category, product)
        active = any(photo(i) for i in group)
        marks = sorted({i["mark"] for i in group if i.get("mark")})
        names = defaultdict(int)
        for i in group:
            names[i["decor"]] += 1
        for n, i in enumerate(sorted(group, key=lambda v: (v["decor"], v.get("size", "")))):
            first = n == 0
            colour = i["decor"] if names[i["decor"]] == 1 else f"{i['decor']} {i.get('decor_no') or i.get('size')}".strip()
            ws.append([pid, product if first else None, category if first else None, i["brand"] if first else None,
                       (", ".join(marks) or None) if first else None,
                       "fbv-" + stable(pid, i["decor"], i.get("decor_no", ""), i.get("size", "")),
                       category.split("/")[-1], colour, *[i.get(k) for k, _ in used], round(i["price"], 2),
                       photo(i), "так" if active else "ні", i.get("decor_no") or None])
    for cell in ws[1]:
        cell.font = openpyxl.styles.Font(bold=True)
    wb.save(out)
    Path(report).write_text(json.dumps({"items": list(best.values()), "skipped": skipped}, ensure_ascii=False, indent=1))
    by_cat = defaultdict(int)
    for (category, _), group in products.items():
        by_cat[category] += len(group)
    print(f"products {len(products)}, variations {len(best)}, skipped {len(skipped)}, duplicates {len(items) - len(best)}")
    print(dict(by_cat))


if __name__ == "__main__":
    main()
