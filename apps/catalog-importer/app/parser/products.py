from typing import Any

from app.models.catalog import Product, Source
from app.parser.values import boolean, identifier, money, optional_text


def parse_product(values: dict[str, Any], source: Source, category: str) -> Product:
    return Product(
        external_id=identifier(values.get("product_id")),
        name=optional_text(values.get("name")) or "",
        category=optional_text(values.get("category")) or category,
        brand=optional_text(values.get("brand")),
        description=optional_text(values.get("description")),
        short_description=optional_text(values.get("short_description")),
        price=money(values["price"]) if values.get("price") is not None else None,
        image=optional_text(values.get("image")),
        active=boolean(values.get("active")),
        source=source,
    )
