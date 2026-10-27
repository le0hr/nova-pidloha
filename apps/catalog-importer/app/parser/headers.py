"""Header identity and user-configurable aliases; no column positions."""

import re
from difflib import get_close_matches

from app.config import Settings

ALIASES: dict[str, list[str]] = {
    "product_id": ["ID товару", "ID продукту", "product_id", "product id"],
    "variation_id": ["ID Варіації", "variation_id", "variant_id"],
    "price": ["Ціна", "price", "Ціна пачки", "Вартість"],
    "name": ["Назва", "name"],
    "image": ["Фото", "Зображення", "image", "image_url"],
    "brand": ["Бренд", "brand"],
    "category": ["Категорія", "category", "Клас"],
    "active": ["Активний", "active"],
    "sku": ["sku", "артикул"],
    "note": ["note", "примітка"],
    "supplier_code": ["supplier code", "supplier_code", "код постачальника"],
    "description": ["description", "опис"],
    "short_description": ["short_description", "Короткий опис товару"],
    "characteristic": [
        "characteristic",
        "характеристика",
        "характеристики",
        "Назва характеристики",
    ],
    "addon": ["addon", "add-on", "доповнення", "додатки"],
    "filter": ["filter", "фільтр", "фільтри"],
    "value": ["value", "значення"],
    "unit": ["unit", "одиниця"],
    "group": ["group", "група"],
    "addon_id": ["addon_id", "id доповнення"],
    "price_delta": ["price_delta", "доплата", "Збільшення ціни"],
    "target_id": ["target_id", "id цілі"],
    "target_type": ["target_type", "тип цілі"],
}


def normalize(value: object) -> str:
    return " ".join(
        str(value or "").strip().casefold().translate(str.maketrans("’ʼ`", "'''")).split()
    )


class Headers:
    def __init__(self, settings: Settings) -> None:
        self.aliases: dict[str, str] = {}
        for key, defaults in ALIASES.items():
            for alias in defaults + settings.header_aliases.get(key, []):
                normalized = normalize(alias)
                if normalized in self.aliases and self.aliases[normalized] != key:
                    raise ValueError(f"Ambiguous configured header alias: {alias}")
                self.aliases[normalized] = key
        unknown = settings.header_aliases.keys() - ALIASES.keys()
        if unknown:
            raise ValueError(f"Unknown system fields in HEADER_ALIASES: {sorted(unknown)}")
        if settings.sku_is_variation_id:
            self.aliases["sku"] = "variation_id"
        self.attribute_keys = {normalize(k): v for k, v in settings.attribute_keys.items()}

    def resolve(self, value: object) -> str | None:
        return self.aliases.get(normalize(value))

    def suggestion(self, value: object) -> str | None:
        matches = get_close_matches(normalize(value), list(self.aliases), n=1, cutoff=0.82)
        return matches[0] if matches else None

    def attribute_key(self, value: object) -> str:
        normalized = normalize(value)
        return self.attribute_keys.get(normalized, re.sub(r"\W+", "_", normalized).strip("_"))
