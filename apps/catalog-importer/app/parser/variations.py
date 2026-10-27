from typing import Any

from app.models.catalog import Source, Variation
from app.parser.values import boolean, identifier, money, optional_text


def parse_variation(values: dict[str, Any], source: Source) -> Variation:
    return Variation(
        external_id=identifier(values.get("variation_id")),
        product_external_id=identifier(values.get("product_id")),
        price=money(values.get("price")),
        image=optional_text(values.get("image")),
        sku=optional_text(values.get("sku")),
        note=optional_text(values.get("note")),
        supplier_code=optional_text(values.get("supplier_code")),
        active=boolean(values.get("active")),
        source=source,
    )
