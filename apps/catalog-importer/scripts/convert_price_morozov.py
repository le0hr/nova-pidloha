"""Convert the "ПП Морозов" floor price catalogue (.xls, cp1251) into an importer workbook (sheet "Підлога").

Product = collection (Kronospan Super Natural, Variostep, Castello, Expert Choice, RedClic Park…, AGT Luna…);
variation = decor/colour. Price = "Оптовая" per unit (м2 for laminate) × MARKUP (env, default 1.4). Rows with no stock are skipped;
duplicate decors keep the row with the largest stock. Products are written inactive until photos are added
(PHOTOS=matches.json, path relative to OUT; a product with a photo becomes active).

Usage: PYTHONPATH=<xlrd> .venv/bin/python scripts/convert_price_morozov.py OUT.xlsx REPORT.json PRICE.xls
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

COLLECTIONS = [  # (pattern in group or name, product name)
    (r"super natural", "Kronospan Super Natural"), (r"variostep", "Kronospan Variostep"),
    (r"castello", "Kronospan Castello"), (r"expert choice", "Kronospan Expert Choice"),
    (r"\bpark\b|\brcp\b", "Kronospan RedClic Park"), (r"\bisland\b|\brci\b", "Kronospan RedClic Island"),
    (r"\boasis\b|\brco\b", "Kronospan RedClic Oasis"), (r"valley|velley|\brcv\b", "Kronospan Valley"),
    (r"kronostep", "Kronospan Kronostep"), (r"kronofix|кronofix", "Kronospan Kronofix"),
    (r"modera", "Kronospan Modera"), (r"atlantic", "Kronospan Atlantic"), (r"impression", "Kronospan Impression"),
    (r"corvina", "AGT Corvina"), (r"\bluna\b", "AGT Luna"), (r"eurohom", "Kronospan Eurohome"), (r"kaindl", "Kaindl"),
]
NOISE = re.compile(
    r"(?i)ламінован\w*\.?\s*(підлога|покриття)( для підлоги)?|ламінат|kronospan|super natural|classik|classic|variostep|"
    r"castello|expert choice|redclic|valley|velley|kronostep|кronofix|kronofix|modera|atlantic|agt|corvina|luna\s*v?|eurohom|kaindl|"
    r"\(?\d+[*хx]\d+[*хx]\d+\s*(мм)?\)?|\(\d+\s*шт\.?\)|\(м2\)|\(\d[\d.,]*\s*м2\)|\b\d{2}\s*кл\.?|\bкл\.|"
    r"\b(32|33|31)/(ас4|ac4|4v)\S*|\bас5\b|\bac5\b|акція|\(8мм\)|\d+мм|клас\w*|фаска\w*|\(\s*\)|!|/\s*$|mese\b")


def stable(*parts: str) -> str:
    return hashlib.sha256("|".join(parts).encode()).hexdigest()[:10]


def collection_of(group: str, name: str) -> str:
    text = f"{group} {name}".lower()
    if group.lower() != "акція":  # the 1C group decides, except for the promo group
        for pattern, product in COLLECTIONS:
            if re.search(pattern, group.lower()):
                return product
    for pattern, product in COLLECTIONS:
        if re.search(pattern, text):
            return product
    return "Kronospan"


def main() -> None:
    out, report, price_file = sys.argv[1:4]
    markup = float(os.environ.get("MARKUP", "1.4"))
    photos = {}
    if os.environ.get("PHOTOS"):
        for m in json.loads(Path(os.environ["PHOTOS"]).read_text()):
            if m.get("file"):
                photos[(m["product"], m["color"])] = m["file"]
    sheet = xlrd.open_workbook(price_file, encoding_override="cp1251").sheet_by_index(0)
    group, rows, skipped = "", [], []
    for r in range(8, sheet.nrows):
        c = [str(v).strip() for v in sheet.row_values(r)]
        if not c[0] and c[2] and not c[8]:
            group = c[2]
            continue
        if not c[2]:
            continue
        name = re.sub(r"\s+", " ", c[2])
        stock = float(c[9] or 0)
        if stock <= 0:
            skipped.append({"name": name, "why": "no stock"})
            continue
        rows.append({"group": group, "art": c[1], "name": name, "pack": c[5], "unit": c[6], "price": round(float(c[8]) * markup, 2), "wholesale": float(c[8]), "stock": stock})

    items = []
    for x in rows:
        if x["group"].lower().startswith("подложка"):
            category, product = "Підложка", ("Aqua-Guard мембрана" if "aqua" in x["name"].lower() else "ProFloor XPS")
            if (m := re.search(r"уп\s*-\s*(\d+)\s*м", x["name"])):
                x["name"] = f"Рулон {m[1]} м²"
            color = re.sub(r"(?i)\(.*?уп.*?\)|\((шт|паков)\)|гидроиз\. мембрана для наполных покрытий|підкладка", " ", x["name"])
            attrs = {}
        else:
            category, product = "Ламінат", collection_of(x["group"], x["name"])
            if product.startswith("AGT") and re.search(r"(?i)PRK8\d\d", x["art"]):  # PRK8xx decors are AGT Corvina
                product = "AGT Corvina"
            code = re.search(r"\b([KК]\d{3}|\d{4})\b", x["name"])
            body = x["name"]
            if product.startswith("AGT"):  # decor name is the article ("Albana-PRK804")
                body = x["art"].split("-")[0].title()
            body = re.sub(r"\(?\s*\d*\s*[*хx]\s*\d+\s*[*хx]\s*\d*\s*(мм)?\s*\)?", " ", body)  # board size
            if product == "Kronospan Modera" and (m := re.search(r"\)\s*([\w ]+?)\s+Mese", x["name"])):
                body = m[1]
            if product == "Kronospan Kronostep" and "/" in body:
                body = body.split("/")[0]
            color = re.sub(r"^[\s_]*(RC[IOPV]|VFUC|KRFC)-?\s*", "", body)
            color = re.sub(r"\b[KК]?\d{3,4}\b", " ", color)
            color = NOISE.sub(" ", color)
            attrs = {"Площа в пачці, м2": x["pack"]}
            if code:
                attrs["Декор №"] = code[1].replace("К", "K")
            if re.search(r"фаск|4v", x["name"], re.I):
                attrs["Фаска"] = "так"
            if (m := re.search(r"(\d{2})\s*кл", x["name"])):
                attrs["Клас зносостійкості"] = m[1]
            if (m := re.search(r"(\d)\s*[*мm]+\s*\*?\s*(\d{3})\s*[*мm]+\s*\*?\s*(\d{3,4})|(\d{4})\*(\d{3})\*(\d)", x["name"])):
                g = [v for v in m.groups() if v]
                attrs["Розмір дошки, мм"] = "×".join(sorted(g, key=lambda v: -int(v)))
        color = re.sub(r"\(\s*[*\s]*\)|/(?=\s|$)|\(\d+\s*шт.*$", " ", color)
        color = re.sub(r"\s+", " ", color).strip(" ,./-")
        color = color[:1].upper() + color[1:] if color else "Стандарт"
        items.append({**x, "category": category, "product": product, "color": color, "attrs": attrs,
                      "mark": "Акція" if x["group"].lower() == "акція" or "акці" in x["name"].lower() else ""})

    best: dict[tuple, dict] = {}
    for it in items:  # duplicate decor rows -> the one with most stock
        key = (it["category"], it["product"], it["color"], it["attrs"].get("Розмір дошки, мм", ""))
        if key not in best or it["stock"] > best[key]["stock"]:
            best[key] = it
    products: dict[tuple, list] = defaultdict(list)
    for it in best.values():
        products[(it["category"], it["product"])].append(it)

    attr_cols = sorted({k for it in best.values() for k in it["attrs"]})
    book = openpyxl.Workbook()
    ws = book.active
    ws.title = "Підлога"
    ws.append(["ID товару", "Назва", "Клас", "Бренд", "Позначка", "ID Варіації", "Тип покриття", "Покриття", *attr_cols,
               "Ціна", "Фото", "Активний", "артикул"])
    for (category, product), group_items in sorted(products.items()):
        pid = "price-" + stable(category, product)
        active = any(photos.get((product, it["color"])) for it in group_items)
        marks = sorted({it["mark"] for it in group_items if it["mark"]})
        for i, it in enumerate(sorted(group_items, key=lambda v: v["color"])):
            first = i == 0
            ws.append([pid, product if first else None, category if first else None,
                       product.split()[0] if first else None, (", ".join(marks) or None) if first else None,
                       "price-v" + stable(pid, it["color"], it["attrs"].get("Розмір дошки, мм", "")),
                       "Ламінат" if category == "Ламінат" else "Підложка", it["color"],
                       *[it["attrs"].get(k) for k in attr_cols], it["price"], photos.get((product, it["color"])),
                       "так" if active else "ні", it["art"] or None])
    for cell in ws[1]:
        cell.font = openpyxl.styles.Font(bold=True)
    book.save(out)
    Path(report).write_text(json.dumps({"items": list(best.values()), "skipped": skipped}, ensure_ascii=False, indent=1))
    print(f"products {len(products)}, variations {len(best)}, skipped (no stock) {len(skipped)}, "
          f"duplicates merged {len(items) - len(best)}")


if __name__ == "__main__":
    main()
