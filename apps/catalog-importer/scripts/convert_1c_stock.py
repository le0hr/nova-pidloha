"""Convert 1C "Вартісна оцінка складу" door exports (.xls) into an importer workbook (.xlsx).

Each 1C row is one sellable SKU (model + colour + glass + width + height + side). Rows are grouped
into products (model) and variations; price is the file's "Оптовая макс" column as is (retail).
Only doors are converted: mouldings (погонаж), hardware and accessories are skipped and reported.

Usage:
    .venv/bin/python scripts/convert_1c_stock.py OUT.xlsx REPORT.json FILE.xls [FILE.xls ...]
Optional env PHOTOS=matches.json: approved photos per look (brand, category, model, colour, glass -> "file",
a path relative to OUT's folder); written into the "Фото" column of every variation of that look.
Needs xlrd (reading legacy .xls) next to openpyxl.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from collections import defaultdict
from dataclasses import asdict, dataclass, field
from pathlib import Path

import openpyxl
import xlrd

# ---------------------------------------------------------------- 1C export structure

SKIP_GROUPS = ("погонаж", "фурнитура", "фурнітура", "kedr", "все до дверей")
SKIP_NAMES = re.compile(
    r"замок|ексцентрик|ущільнювач|молдінг чорний|циліндр|к-т фурнітури|зразок|викрас|накладка до|регулятор|"
    r"стенд|втулк|заглушк|коробка дверна",
    re.I,
)


@dataclass
class Row:
    file: str
    path: list[str]
    sku: str
    name: str
    price: float | None


def read_rows(file: Path) -> list[Row]:
    book = xlrd.open_workbook(str(file), formatting_info=True)
    sheet = book.sheet_by_index(0)
    raw = []
    for r in range(9, sheet.nrows):
        cells = [str(v).strip() for v in sheet.row_values(r)]
        if cells[1] == "Підсумок":
            continue
        level = sheet.rowinfo_map[r].outline_level if r in sheet.rowinfo_map else 0
        raw.append((level, cells))
    rows, stack = [], []
    for i, (level, cells) in enumerate(raw):
        while stack and stack[-1][0] >= level:
            stack.pop()
        nxt = raw[i + 1][0] if i + 1 < len(raw) else -1
        if nxt > level:
            stack.append((level, cells[2]))
            continue
        price = float(cells[4]) if cells[4] else None
        # 1C exports some article numbers as "=19629"/"7305="; without "=" Excel would read them as formulas.
        sku = re.sub(r"\.0$", "", cells[1].strip("= "))
        rows.append(Row(file.name, [s[1] for s in stack[2:]], sku, cells[2], price))
    return rows


# ---------------------------------------------------------------- normalisation helpers

SIDE = re.compile(r"(?<![\w-])(ЛІВ|Лів|ЛіВ|лів|ліва|ліве|ЛІВА|ЛЕВАЯ|ПР|Пр|права|праве|ПРАВА)(?![\w-])")
FLAGS = [
    (re.compile(r"!?\s*ВИВОДИТЬСЯ з асортим\w+!?|!\s*Виводиться з асортим\w+\s*!", re.I), "Розпродаж"),
    (re.compile(r"!\s*НОВИНКА\s*!|\(\s*новинка!*\s*\)|НОВИНКА!*", re.I), "Новинка"),
    (re.compile(r"\(\s*ЦІНОВА АКЦІЯ\s*\)|ЦІНА Еліта АКЦІЯ\s*!*|!\s*Акція\s*!", re.I), "Акція"),
]


def flags(name: str) -> tuple[str, list[str]]:
    found = []
    for pattern, label in FLAGS:
        if pattern.search(name):
            found.append(label)
            name = pattern.sub(" ", name)
    return name, found


def side_of(text: str) -> str:
    m = SIDE.search(text)
    if not m:
        return ""
    return "Ліве" if m.group(1).lower().startswith(("л",)) else "Праве"


CAPS_KEEP = {"RAL", "РАЛ", "МДФ", "ПВХ", "ДСП", "NEW", "BLK", "KALE"}


def clean(text: str) -> str:
    # SHOUTED words from 1C become normal case; codes (RAL, МДФ, Б-262) stay as they are.
    text = " ".join(w.lower() if w.isupper() and len(w) > 3 and w not in CAPS_KEEP and not re.search(r"\d", w) else w
                    for w in text.split())
    text = re.sub(r"\s+", " ", text).strip(" ,;-–/+")
    if text.startswith("(") and text.count("(") > text.count(")"):
        text = text[1:]
    return text[:1].upper() + text[1:] if text else text


def title(text: str) -> str:
    keep = {"RAL", "РАЛ", "МДФ", "ПВХ", "ДСП", "NEW", "BLK"}
    return " ".join(w if w in keep or not w.isupper() or len(w) <= 2 else w.capitalize() for w in text.split())


def stable(*parts: str) -> str:
    return hashlib.sha256("|".join(parts).encode()).hexdigest()[:10]


@dataclass
class Item:
    brand: str
    category: str  # importer class path under the "Двері" sheet
    subclass: str  # interior door construction, see DOOR_SUBCATEGORIES in mapping.py
    model: str
    decor: str = ""
    color: str = ""
    glass: str = ""
    width: str = ""
    height: str = ""
    side: str = ""
    lock: str = ""
    price: float | None = None
    sku: str = ""
    marks: list[str] = field(default_factory=list)
    source: str = ""


# ---------------------------------------------------------------- interior: Гранд (Rodos)

GRAND_GLASS = {"blk": "Чорне скло", "сатин2": "Сатин", "сатин": "Сатин", "глухе": "Глухе"}


def grand(row: Row) -> Item | None:
    name, marks = flags(row.name)
    lock = "Під замок" if re.search(r"під замок", name, re.I) else ""
    name = re.sub(r",?\s*під замок", "", name, flags=re.I)
    m = re.match(r"ДП Lux-(\d)\s+(BLK|сатин2|глухе),?\s*([^,]+),\s*(\d{3})/(\d{4})/38", name.strip())
    if m:
        color = m[3].strip()
        decor = "ПВХ" if color.lower().startswith("пвх") else "Екошпон"
        color = clean(re.sub(r"^ПВХ\s+", "", color, flags=re.I))
        return Item("Гранд", "Міжкімнатні", "Каркасно-щитові", f"Гранд Lux-{m[1]}", decor, color,
                    GRAND_GLASS[m[2].lower()], m[4], m[5], "", lock, row.price, row.sku, marks)
    m = re.match(r"(?:ДП\s+)?Paint-(\d)\s*(глухе)?,?\s*(.+?),?\s*(\d{2,3})(?:/(\d{4})/38)?\s*$", name.strip())
    if m and "/Paint" not in name:
        rest = m[3]
        color = "RAL 7037" if "7037" in rest else "Білий мат"
        extra = re.sub(r"білий мат АКР|RAL 7037( K)?|^,|\bK\b", "", rest, flags=re.I)
        extra = extra.replace("вст V Чорн.глянець", "Вставка V чорний глянець").replace("вст V Чорн.гля", "Вставка V чорний глянець")
        extra = re.sub(r"(мол(динг)?)\s*1G\s*(N74|анод)", lambda x: "Молдинг 1G " + ("N74" if x[3] == "N74" else "анодований"), extra)
        extra = re.sub(r"^\s*1G N74", "Молдинг 1G N74", extra.strip(" ,"))
        width = m[4] if len(m[4]) == 3 else m[4] + "0"
        return Item("Гранд", "Міжкімнатні", "Каркасно-щитові", f"Гранд Paint-{m[1]}", "Акрилова фарба", color,
                    clean(extra) or "Глухе", width, m[5] or "2000", "", lock, row.price, row.sku, marks)
    return None


# ---------------------------------------------------------------- interior: Новий Стиль (translated)

NS_WORDS = {
    "Премьера": "Прем’єра", "Линнея": "Лінея", "Пиана": "Піана", "Валенсия": "Валенсія", "Антре": "Антре",
    "Рока": "Рока", "Рада": "Рада", "Диана": "Діана", "Леона": "Леона", "Лилия": "Лілія", "Делла": "Делла",
    "Мира": "Міра", "Стандарт": "Стандарт", "Лилу": "Лілу",
}
NS_COLORS = [
    ("зол. ольха", "золота вільха"), ("зол.ольха", "золота вільха"), ("зол ольха", "золота вільха"),
    ("серая пастель", "сіра пастель"), ("бук пепельный", "бук попелястий"), ("ясень", "ясен"),
    ("дуб молочный", "дуб молочний"), ("дуб дымчастый", "дуб димчастий"), ("дуб жемчужный", "дуб перлинний"),
    ("орех 3Д", "горіх 3D"), ("ольха 3Д", "вільха 3D"), ("белый мат", "білий мат"), ("экошпон кедр", "кедр"),
    ("grey new", "grey NEW"), ("ясен new", "ясен NEW"), ("дуб медовый", "дуб медовий"), ("патина серая", "патина сіра"),
    ("зол. дуб", "золотий дуб"), ("зол.дуб", "золотий дуб"),
]


def novyi_styl(row: Row) -> Item | None:
    name, marks = flags(row.name)
    side = "Ліве" if re.match(r"\s*ЛЕВАЯ", name) else ""
    name = re.sub(r"^\s*ЛЕВАЯ\s+", "", name).replace("termopack UM", "").strip()
    m = re.match(r"(\S+)\s+(.+?)\s+(40|60)\s*(.*)$", name)
    if not m:
        return None
    model = NS_WORDS.get(m[1], m[1])
    color = m[2]
    for ru, uk in NS_COLORS:
        color = re.sub(re.escape(ru), uk, color, flags=re.I)
    tail = m[4].strip()
    if re.search(r"BLK", tail, re.I):
        glass = "Чорне скло"
    elif re.search(r"стекло", tail, re.I):
        glass = "Сатин"
    elif re.search(r"ПГ", tail):
        glass = "Глухе"
    elif (r := re.search(r"Р\s*(\d)", tail)):
        glass = f"Скло з малюнком Р{r[1]}"
    else:
        glass = ""
    width = "600" if m[3] == "60" else ""
    decor = "Екошпон" if "экошпон" in row.name.lower() else ""
    subclass = "" if model == "Стандарт" else "Збірні"
    return Item("Новий Стиль", "Міжкімнатні", subclass, model, decor, clean(color), glass, width, "2000", side, "",
                row.price, row.sku, marks)


# ---------------------------------------------------------------- interior: wood, MODUS


def wood(row: Row) -> Item | None:
    m = re.match(r'"(.+?)"\s+(ПО|ПГ)\s+(\d{2})', row.name)
    if not m:
        return None
    model = {"Волна": "Хвиля", "Пирамида": "Піраміда"}.get(m[1], m[1])
    return Item("", "Міжкімнатні", "Соснові", f"Соснові двері «{model}» без сучка", "Масив сосни", "Без покриття",
                "Під скло" if m[2] == "ПО" else "Глухе", m[3] + "0", "2000", "", "", row.price, row.sku)


def modus(row: Row) -> Item | None:
    m = re.match(r"Полотно на 2 завіси (\d{4})\*(\d{3})\*40 мм з торц.профілем чорним \(білий грунт\)\s*(.*)", row.name)
    if not m:
        return None
    side = side_of(m[3])
    if "внутр" in m[3]:
        side = f"{side}, внутрішнє" if side else "Внутрішнє"
    return Item("MODUS", "Міжкімнатні", "Прихований монтаж", "MODUS прихована під фарбування", "Ґрунт під фарбування",
                "Білий ґрунт, чорний торцевий профіль", "Глухе", m[2], m[1], side, "", row.price, row.sku)


# ---------------------------------------------------------------- entrance doors

ENTRANCE_MODELS = [
    r"Еллісон", r"Хілтон", r"Афіна", r"Геліос", r"Лучія", r"Мілан", r"Монако", r"Нортон", r"Свея", r"СТЕЛС",
    r"Марсель", r"МІШЕЛЬ", r"Еліт\s+(?:\d{3}|ГРАЦІЯ|МОНАКО|ОРІОН|Комбі 13)", r"Моноліт", r"ЛАМПРЕ", r"Магнат",
    r"Престиж", r"Титан Плюс", r"КВАРТАЛ ПЛЮС", r"Економ", r"Рубікон", r"Техно \d", r"ФОРЕСТ\s+\d{3}",
    r"Х’юстон\s+\d{3}", r"ТОРОНТО", r"ДСП", r"МЕГА", r"ОПТИМА", r"ПОРТА", r"РУБІЖ", r"СТАНДАРТ", r"ТИТАН", r"Лайт",
]
MODEL = re.compile(r"^\s*(" + "|".join(ENTRANCE_MODELS) + r")", re.I)
SIZE = re.compile(r"(?<![\w-])(\d{2,3})\s*\*\s*(\d{3,4})(?!\d)")
WIDTH = re.compile(r"(?<![\w/-])(85|86|95|96|120|860|960)(?=\s|$|\*)")
CODE_BEFORE_NUMBER = re.compile(r"(Ескада|Б-|ПВХ-?|RAL|РАЛ|Еліт|Комбі|Лампре|Оріон|МОЛД[ИІ]НГ|Б-\d+\s*\(|Модус|[Тт]ип)\s*$", re.I)
BRANDS = {"SARMAK": "SARMAK", "SUN DOORS": "Sun Doors", "Артіз": "Артіз", "Бастіон": "Бастіон", "ГЕРМЕС": "Гермес",
          "Наші двері": "Наші двері", "Китайські двері": ""}


def entrance(row: Row) -> Item | None:
    if SKIP_NAMES.search(row.name):
        return None
    name, marks = flags(row.name)
    if "СПЕЦЗАМОВЛЕННЯ" in name:
        marks.append("Під замовлення")
        name = name.replace("СПЕЦЗАМОВЛЕННЯ", " ")
    short = "(коротиш)" in name
    name = name.replace("(коротиш)", " ")
    group = " ".join(row.path).lower()
    brand = next((b for k, b in BRANDS.items() if row.path and row.path[1].startswith(k)), "")
    construction = next((c for c in ("метал/метал", "метал/мдф", "мдф/мдф") if c in group or c in name.lower()), "")
    if not construction and "м/дсп" in group:
        construction = "метал/ДСП"
    kind = "Квартирні" if re.search(r"кв(а|ат)ртирн|кватрирн", group) else "Вуличні"
    m = MODEL.match(name)
    if not m:
        return None
    model = re.sub(r"\s+", " ", m[1]).strip()
    if model.upper() == "ДСП":
        model = "Метал/ДСП"
    rest = name[m.end():]
    if "KALE" in rest:
        model += " (замки KALE)"
        rest = rest.replace("KALE", " ")
    elif brand == "Артіз" and model.lower().startswith("еліт"):
        model += " (замки Securemme)"
    width = height = ""
    if (s := SIZE.search(rest)):
        width, height = s[1], s[2]
        rest = rest[: s.start()] + " " + rest[s.end():]
    else:
        for w in WIDTH.finditer(rest):
            if not CODE_BEFORE_NUMBER.search(rest[: w.start()]):
                width = w[1]
                rest = rest[: w.start()] + " " + rest[w.end():]
                break
    width = {"85": "850", "86": "860", "95": "950", "96": "960", "120": "1200"}.get(width, width)
    default_height = "2040" if brand == "Наші двері" else "2050"
    height = {"190": "1900"}.get(height, height) or ("1900" if short else default_height)
    side = side_of(rest)
    rest = SIDE.sub(" ", rest)
    rest = re.sub(r"\((?:метал|мдф|МЕТАЛ|МДФ)[^)]*\)", " ", rest)
    rest = re.sub(r"зі склопакетом та ручкою скобою", " ", rest, flags=re.I)
    rest = re.sub(r"\bвуличн\w*", " ", rest, flags=re.I)
    glass = "Склопакет" if re.search(r"склопакет", rest, re.I) else ""
    rest = re.sub(r"\+?\s*СКЛОПАКЕТ\s*", " ", rest, flags=re.I)
    # " - " separates parts; a hyphen inside a code (Б-262, ПВХ-02) stays.
    color = clean(re.sub(r"\s*/\s*", " / ", re.sub(r"\s+-\s*|\s*-\s+", " ", rest)))
    if re.fullmatch(r"\d{2,3}", color):
        color = f"Дизайн {color}"
    color = re.sub(r"\bРАЛ\b", "RAL", color)
    if "8019" in color and "RAL" not in color:
        color = color.replace("8019", "RAL 8019")
    return Item(brand, f"Вхідні/{kind}", "", title(model), construction.replace("мдф", "МДФ"), color or "Стандартне",
                glass, width, height, side, "", row.price, row.sku, marks)



# ---------------------------------------------------------------- interior: SUN DOORS, Релікт, Оміс

RU_UK = [
    ("белый", "білий"), ("белая", "біла"), ("светлый", "світлий"), ("светло-серый", "світло-сірий"), ("серый", "сірий"),
    ("ольха европейская", "вільха європейська"), ("ольха", "вільха"), ("европейский", "європейський"),
    ("европейская", "європейська"), ("орех", "горіх"), ("сосна сицилия", "сосна Сицилія"), ("гладкий", "гладкий"),
    ("дуб беленый", "дуб білений"), ("черн", "чорн"), ("дуб медовый", "дуб медовий"), ("свiтлий", "світлий"),
    ("Сицилия", "Сицилія"), ("Пьемонт", "П'ємонт"), ("європейский", "європейський"), ("европейськ", "європейськ"),
    ("Остин", "Остін"), ("Саванна", "Савана"), ("Cицилія", "Сицилія"), ("классика", "класика"), ("глухое", "глухе"),
]


def ru_to_uk(text: str) -> str:
    for ru, uk in RU_UK:
        text = re.sub(re.escape(ru), uk, text, flags=re.I)
    return text


def glass_of(text: str) -> str:
    t = text.lower()
    if re.search(r"малюнк", t):
        return "Скло з малюнком"
    if re.search(r"\bblk\b|black|чорн|черн|\bbg\b|вg|triplex", t):
        return "Чорне скло"
    if re.search(r"бронза|\bcdb\b", t):
        return "Скло бронза"
    if re.search(r"без стекла", t):
        return "Під скло"
    if re.search(r"\bпг\b|глух|\(в\)|\bв \(", t):
        return "Глухе"
    if re.search(r"скло|стекло|сатин|сатін|\bg\b|\bпо\b|сс\+кр|\bзс\b|\b3с\b|\bcds\b", t):
        return "Сатин"
    return ""


def width_of(text: str) -> str:
    for pattern in (r"2000[хx*](\d{3})", r"(\d{3})\s*мм", r"(\d{3})\*2000", r"(?<![\d.])(\d{3})(?=\s*[+*]|\s|$)",
                    r"(?<![\d.])([4-9]0)(?=\s*\+|\s|$)"):
        for m in re.finditer(pattern, text):  # skip model numbers such as "С 017"
            if 400 <= int(m[1].ljust(3, "0")) <= 1000:
                return m[1] if len(m[1]) == 3 else m[1] + "0"
    return ""


def interior(row: Row, brand: str, model: str, decor: str, color: str, subclass: str = "", marks=None) -> Item:
    name = row.name
    side = "Ліве" if re.search(r"\bЛІВЕ\b|\bЛЕВАЯ\b|\bліва\b", name) else ""
    m = re.search(r"2000[хx*]\d{3}|\d{3}\*(\d{4})", name)
    height = m[1] if m and m.lastindex and m[1] else "2000"
    return Item(brand, "Міжкімнатні", subclass, model, decor, clean(ru_to_uk(color)) or "Стандартне",
                glass_of(name), width_of(name), height, side, "", row.price, row.sku, marks or [])


def sun_doors(row: Row) -> Item | None:
    group = row.path[-1]
    if re.search(r"заказн|нестандарт", group, re.I):
        return None
    group, marks = flags(group)
    if "виводиться з асортименту" in group.lower():
        marks.append("Розпродаж")
    model = clean(re.sub(r"\(.*?\)|!", " ", group)).replace("Cицилія", "Сицилія").replace("Ліннея", "Лінея")
    row = Row(row.file, row.path, row.sku, row.name.replace("Cицилія", "Сицилія"), row.price)
    model = " ".join(w if w == "NEW" else w.capitalize() for w in model.split())
    stem = model.split()[0].lower()[:4]
    color = re.sub(r'(?i)полотно|пвх|"|\bnew"|\d{2,4}\*\d{4}\*\d{2}|\d+\*|\(.*?\)|\+.*$|\bblk\b|сатин|сатін|скло', " ", row.name)
    color = re.sub(r"(?<![\w])(\d{2,3})(?![\w])", " ", color)
    words = [w for w in color.split() if not w.lower().startswith(stem) and w.upper() != "NEW" and w not in ("СИЦИЛІЯ", "ЛІНЕЯ", "Ліннея")]
    words = [w for w in words if w.lower() not in ("new",)] if len(words) > 1 else words
    color = " ".join(words)
    if re.search(r"\bnew\b", row.name.split('"')[-1] if '"' in row.name else row.name[len(model):], re.I) and "new" not in color.lower():
        pass
    return interior(row, "Sun Doors", model, "ПВХ", color, "", marks)


def relikt(row: Row) -> Item | None:
    m = re.match(r"(Корт|Лайн \d+|Твінс|Трес)\s+(.+?)\s+(\d{2})\s*\+", row.name)
    if not m:
        return None
    return interior(row, "Релікт", m[1], "", m[2])


OMIS_MODEL = re.compile(r"\b(С \d{3}|TRENTO \d{2}|BIT \d{2}|deco \d{2}|Dora \d{2}|FLAT \d{2}\w*|Lego \d{2}|Rino \d{2}|"
                        r"Т0\d|Бергамо|Вероніка|вероника|Класика|класика|Комфорт|комфорт|Пальма|парус|Парус|Прима|"
                        r"фиеста|Фієста|Валенсия|gloss|СИТИ|Сіті|Глухе|глухе|глухое)", re.I)
OMIS_NAMES = {"вероника": "Вероніка", "класика": "Класика", "комфорт": "Комфорт", "парус": "Парус", "прима": "Пріма",
              "фиеста": "Фієста", "фієста": "Фієста", "валенсия": "Валенсія", "сити": "Сіті", "сіті": "Сіті",
              "глухе": "Гладке глухе", "глухое": "Гладке глухе", "gloss": "Gloss"}


def omis(row: Row) -> Item | None:
    if "заказн" in " ".join(row.path).lower() or re.search(r"брошур|образц|зразок", row.name, re.I):
        return None
    brand = "DOORS" if "DOORS" in row.path else "ОМіС"
    group = row.path[-1]
    m = OMIS_MODEL.search(ru_to_uk(row.name))
    if brand == "DOORS" and m and not re.match(r"(С \d{3}|TRENTO)", m[1]):
        return None  # DOORS lines are the С-xxx / TRENTO designs only
    if not m:
        return None
    model = OMIS_NAMES.get(m[1].lower(), m[1])
    model = re.sub(r"^deco", "Deco", model)
    if group == "Під фарбування":
        model = "Класика під фарбування"
    # the model in the name must belong to its 1C group (e.g. "Тріумф" listed under "Пальма" is skipped)
    if brand == "ОМіС" and group not in ("Гладке глухе", "Під фарбування", "LEGO", "Т1") and \
            model.split()[0].lower()[:4] not in ru_to_uk(group).lower() + group.lower():
        return None
    parens = re.findall(r"\(([^()]*)\)", row.name)
    parens = [p for p in parens if not re.fullmatch(r"(чорне|сатин|глухе|бронза|CDs|В|з фрез.*|стекло.*|шт\.?)", p.strip(), re.I)]
    color = ru_to_uk(parens[-1]) if parens else ""
    color = re.sub(r"(?i)^(пвх|nl|еко)\s+|,?\s*кромка.*$|\s*пвх$", "", color.strip())
    t = row.name.lower()
    decor = "Cortex" if "cortex" in t else "Екошпон" if re.search(r"\bеко\b|eкo|еко ", t) else "NL" if "nl " in t else "ПВХ" if "пвх" in t else ""
    if "чорна кромка" in t:
        color += ", чорна кромка"
    item = interior(row, brand, model, decor, color)
    if "з фрез" in t:
        item.lock = "Під замок"
    return item

# ---------------------------------------------------------------- dispatch + workbook

def convert(row: Row) -> Item | None:
    group = " ".join(row.path).lower()
    if any(k in group for k in SKIP_GROUPS):
        return None
    if row.path[:1] == ["Вхідні металеві двері"]:
        return entrance(row)
    if "ГРАНД" in row.path:
        return grand(row)
    if "MODUS" in row.path:
        return modus(row)
    if "Новый Стиль" in row.path:
        return novyi_styl(row)
    if "Дерево" in row.path:
        return wood(row)
    if "SUN DOORS" in row.path:
        return sun_doors(row)
    if "РЕЛІКТ" in row.path:
        return relikt(row)
    if "Оміс" in row.path:
        return omis(row)
    return None


def main() -> None:
    out, report_file, *files = sys.argv[1:]
    photos = {}
    if os.environ.get("PHOTOS"):
        for m in json.loads(Path(os.environ["PHOTOS"]).read_text()):
            if m.get("file"):
                photos[(m["brand"], m["category"], m["model"], m["color"], m["glass"])] = m["file"]
    items, skipped = [], []
    for file in files:
        for row in read_rows(Path(file)):
            item = None if row.price is None or row.price < 1 else convert(row)
            if item is None:
                skipped.append({"file": row.file, "group": " / ".join(row.path), "name": row.name, "price": row.price})
            else:
                item.source = row.name
                items.append(item)

    products: dict[tuple[str, str, str], list[Item]] = defaultdict(list)
    for item in items:
        products[(item.category, item.brand, item.model)].append(item)

    book = openpyxl.Workbook()
    sheet = book.active
    sheet.title = "Двері"
    sheet.append(["ID товару", "Назва", "Клас", "Підклас", "Бренд", "Позначка", "ID Варіації", "Тип покриття",
                  "Покриття", "Скло", "Ширина, мм", "Висота, мм", "Сторона відкривання", "Підготовка під замок",
                  "Ціна", "Фото", "Активний", "артикул"])
    seen: set[str] = set()
    def photo_of(item: Item) -> str | None:
        return photos.get((item.brand or "—", item.category, item.model, item.color, item.glass))

    for (category, brand, model), group in sorted(products.items()):
        pid = "1c-" + stable(category, brand, model)
        # products without any photo stay hidden on the site (active=false) until a photo is added
        visible = not photos or any(photo_of(i) for i in group)
        marks = sorted({m for i in group for m in i.marks})
        for index, item in enumerate(group):
            vid = "1c-" + re.sub(r"\D", "", item.sku) if re.sub(r"\D", "", item.sku) else ""
            if not vid or vid in seen:
                vid = "1c-v" + stable(pid, item.source, str(index))
            seen.add(vid)
            first = index == 0
            sheet.append([pid, model if first else None, category if first else None,
                          (item.subclass or None) if first else None, (brand or None) if first else None,
                          (", ".join(marks) or None) if first else None, vid, item.decor or None, item.color or None,
                          item.glass or None, item.width or None, item.height or None, item.side or None,
                          item.lock or None, item.price, photo_of(item), "так" if visible else "ні",
                          item.sku or None])
    for cell in sheet[1]:
        cell.font = openpyxl.styles.Font(bold=True)
    for row in sheet.iter_rows(min_row=2):
        for cell in (row[0], row[6], row[17]):
            cell.number_format = "@"
    book.save(out)

    report = {
        "products": len(products),
        "variations": len(items),
        "skipped": skipped,
        "by_category": {c: sum(1 for k in products if k[0] == c) for c in sorted({k[0] for k in products})},
        "items": [asdict(i) for i in items],
    }
    Path(report_file).write_text(json.dumps(report, ensure_ascii=False, indent=1))
    print(f"products {len(products)}, variations {len(items)}, skipped {len(skipped)}; {out}")


if __name__ == "__main__":
    main()
