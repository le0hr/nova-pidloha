"""Price-list columns of a variation -> typed CMS fields.

The one place that knows what a column means. Relation columns (decor, colour, glass, construction, edge, side) become dictionary records in mapping.py; descriptive specs become variation characteristics.
"""

import re
from typing import Any

from app.models.catalog import Variation

RELATION = re.compile(r"^(тип покриття|декор|decor|покриття|колір|color|скло|glass)$")
# (pattern, variation field)
PARAMETERS = (
    (re.compile(r"^конструкція$"), "construction"),
    (re.compile(r"^кромка$"), "edge"),
    (re.compile(r"^сторона( відкривання)?$"), "opening_side"),
)
# Rare steps without a field: (pattern, option name on the site, visible on the photo)
OPTIONS = (
    (re.compile(r"^підготовка під замок$"), "Підготовка під замок", False),
)
# Descriptive specs -> variation characteristics: (pattern, name, unit), in table order.
SPECS = (
    (re.compile(r"^декор №"), "Декор №", None),
    (re.compile(r"^клас зносостійкості"), "Клас зносостійкості", None),
    (re.compile(r"^клас / товщина"), "Клас / товщина", None),
    (re.compile(r"^товщина"), "Товщина", "мм"),
    (re.compile(r"^розмір мм"), "Розмір", "мм"),
    (re.compile(r"^замок"), "Замок", None),
    (re.compile(r"^фаска"), "Фаска", None),
    (re.compile(r"^захисний шар"), "Захисний шар", None),
    (re.compile(r"^матеріал"), "Матеріал", None),
    (re.compile(r"^основа"), "Основа", None),
    (re.compile(r"^вологостійкий"), "Вологостійкий", None),
    (re.compile(r"^(планок|дощок) (у|в) пачці"), "Планок у пачці", None),
    (re.compile(r"^довжина рулону"), "Довжина рулону", None),
    (re.compile(r"^ширина рулону"), "Ширина рулону", None),
    (re.compile(r"^виконання"), "Виконання", None),
)


def label(name: Any) -> str:
    """'Кромка (якщо немає вибору, залишити пустою)' -> 'кромка'; 'Висота, мм' -> 'висота мм'."""
    text = re.sub(r"\s*\(.*\)\s*$", "", str(name or "")).replace("_", " ").replace(",", "")
    return re.sub(r"\s+", " ", text).strip().casefold()


def number(value: Any) -> float | None:
    try:
        result = float(str(value).strip().replace(",", "."))
    except ValueError:
        return None
    return result if result > 0 else None


def availability(value: Any) -> str | None:
    text = label(value)
    if re.match(r"^(склад|в наявн|є( |$)|так( |$))", text):
        return "in_stock"
    if "замовл" in text:
        return "on_order"
    raise ValueError(f"unknown availability {value!r}")


def classify(variation: Variation) -> tuple[dict[str, Any], list[str]]:
    """Typed fields of the variation and the names of columns nothing knows (stay in the raw JSON only)."""
    names = {a.key: a.display_name for a in variation.attribute_definitions}
    fields: dict[str, Any] = {
        "width": None, "height": None, "packArea": None, "boardSize": None, "availability": None, "options": [],
        "construction": None, "edge": None, "opening_side": None,
        "characteristics": [],
    }
    unknown: list[str] = []
    for key, raw in variation.attributes.items():
        name = label(names.get(key, key))
        value = str(raw).strip()
        if not value or RELATION.match(name):
            continue
        if re.match(r"^(площа|м2|м²) в (пачці|упаковці)", name):
            fields["packArea"] = number(value)
        elif name.startswith("розмір дошки"):
            fields["boardSize"] = value
        elif name.startswith("наявність"):
            try:
                fields["availability"] = availability(value)
            except ValueError:
                unknown.append(f"{names.get(key, key)} = {value}")
        elif re.match(r"^(ширина|висота)( мм)?$", name):
            size = number(value)
            fields["width" if name.startswith("ширина") else "height"] = round(size) if size else None
        elif name in ("підклас", "позначка"):  # product columns (category, flags)
            continue
        elif spec := next((x for x in SPECS if x[0].match(name)), None):
            unit = spec[2]
            text = re.sub(rf"\s*{unit}$", "", value, flags=re.I) if unit else value
            fields["characteristics"].append({"name": spec[1], "value": text, "unit": unit})
        elif parameter := next((x for x in PARAMETERS if x[0].match(name)), None):
            fields[parameter[1]] = value
        elif option := next((o for o in OPTIONS if o[0].match(name)), None):
            fields["options"].append({"name": option[1], "value": value, "changesLook": option[2]})
        else:
            unknown.append(str(names.get(key, key)))
    order = [o[1] for o in OPTIONS]
    fields["options"].sort(key=lambda o: order.index(o["name"]))
    specs = [x[1] for x in SPECS]
    fields["characteristics"].sort(key=lambda c: specs.index(c["name"]))
    return fields, unknown


def marks(attributes: dict[str, Any]) -> str:
    """Product «позначка», e.g. 'новинка, розпродаж'."""
    return str(attributes.get("позначка") or "").casefold()
