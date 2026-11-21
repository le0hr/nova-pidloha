"""Floor skirting from the Vitolux price list → JSON for apps/cms/scripts/floor-skirting.js.

Each board: line (shown as buttons), colour (dropdown), retail price per board (2.4–2.5 m), and where it is offered:
  scope "all"            every laminate / SPC / LVT (universal TIS PVC skirting),
  scope "brand:<Brand>"  every floor of that brand (Classen white MDF, Arbiton lines),
  scope "decor:<text>"   only the Classen decor it is made for ("Impression 4V WR Дуб Бассано").
Usage: .venv/bin/python scripts/convert_skirting.py import-runs/floor-brands-2026-11/src/vitolux.xlsx OUT.json
"""
import json
import re
import sys

import openpyxl


def num(value):
    try:
        return float(str(value).replace(",", ".").replace(" ", ""))
    except (TypeError, ValueError):
        return None


def clean(value):
    return re.sub(r"\s+", " ", str(value or "")).strip()


def rows(ws):
    return [[c for c in row] for row in ws.iter_rows(values_only=True)]


def classen(ws):
    out = []
    for r in rows(ws):
        if not isinstance(r[0], (int, float)) or not clean(r[3]).startswith("Плінтус"):
            continue
        name, floor, price = clean(r[3]), clean(r[2]), num(r[9])
        height, width = num(r[5]), num(r[6])
        if not price:
            continue
        size = f"{height:g}×{width:g} мм" if height and width else ""
        if not floor and "The 80th" in name:  # "…The 80th L3988 Дуб Берлі": the decor name itself
            floor = re.sub(r"^Плінтус Classen The 80th\s+[A-Z]?\d+\s*", "", name).strip()
        if floor:  # made for one Classen decor: "Плінтус Classen The 80th L3670 Bassano Oak"
            colour = re.sub(r"^Плінтус Classen The 80th\s+[A-Z]?\d+\s*", "", name).strip()
            out.append({"line": "Плінтус Classen у колір підлоги", "colour": f"{colour}, {size}".strip(", "), "price": price,
                        "code": clean(r[1]), "scope": f"decor:{floor}"})
        else:  # white MDF, any Classen floor: "Плінтус Naxos Pure+ Білий"
            line = re.sub(r"\s+Білий$", "", name).replace("Плінтус ", "Плінтус Classen ", 1)
            out.append({"line": line, "colour": f"Білий, {size}".strip(", "), "price": price, "code": clean(r[1]), "scope": "brand:Classen"})
    return out


def tis(ws):
    """55 mm: retail per board in column J; 48 mm economy: retail per metre in J (× board length)."""
    out, section = [], ""
    for r in rows(ws):
        values = [c for c in r if c not in (None, "")]
        if len(values) == 1 and isinstance(values[0], str):
            section = clean(values[0])
            continue
        code = clean(r[1])
        if not re.search(r"з резинкою (55|48)", section) or not re.match(r"ПЛГ", code):
            continue
        name, retail, length = clean(r[2]), num(r[9]), num(r[4]) or 2.5
        economy = "48" in section
        price = retail * length if economy and retail else retail
        colour = re.sub(r"^\d+\.\s*Плінтус (ТІС з резинкою|ЕКОНОМ 48мм,)\s*\d*\s*", "", name).strip()
        if not price or not colour:
            continue
        line = "Плінтус ТІС ПВХ 48 мм (економ)" if economy else "Плінтус ТІС ПВХ 55 мм"
        out.append({"line": line, "colour": colour, "price": price, "code": code, "scope": "all"})
    return out


def arbiton(ws, line, name_col, price_col, strip):
    out = []
    for r in rows(ws):
        name, price = clean(r[name_col]), num(r[price_col])
        if not price or "Плінтус" not in name:
            continue
        colour = re.sub(strip, "", name).strip()
        out.append({"line": line, "colour": colour or name, "price": price, "code": clean(r[name_col - 1]), "scope": "brand:Arbiton"})
    return out


def arbiton_profiles(ws):
    out = []
    for r in rows(ws):
        if not isinstance(r[0], (int, float)) or not clean(r[1]).startswith("Плінтус"):
            continue
        price = num(r[6])
        if not price:
            continue
        out.append({"line": f"{clean(r[1])} (під фарбування)", "colour": f"{clean(r[2])}, {clean(r[3])}", "price": price,
                    "code": clean(r[2]), "scope": "brand:Arbiton"})
    return out


def main():
    book = openpyxl.load_workbook(sys.argv[1], read_only=True, data_only=True)
    items = []
    for ws in book.worksheets:
        t = ws.title
        if t.startswith("Плінтус Классен"):
            items += classen(ws)
        elif t.startswith("ТИС Плінт"):
            items += tis(ws)
        elif t.startswith("Indo"):
            items += arbiton(ws, "Плінтус Arbiton Indo 70 мм", 2, 6, r"^Плінтус\s+")
        elif t.startswith("LM55"):
            items += arbiton(ws, "Плінтус Arbiton LM55", 2, 6, r"^\d+\s*Плінтус LM55 Arbiton\s+")
        elif t.startswith("INTEGRA"):
            items += arbiton_profiles(ws)
    for i in items:
        i["price"] = round(i["price"])
        i["name"] = f"{i['line']}, {i['colour']}"
    json.dump(items, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
    by = {}
    for i in items:
        by[(i["line"], i["scope"].split(":")[0])] = by.get((i["line"], i["scope"].split(":")[0]), 0) + 1
    for k, v in sorted(by.items()):
        print(v, k)
    print("total", len(items))


if __name__ == "__main__":
    main()
