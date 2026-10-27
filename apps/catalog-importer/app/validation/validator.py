import json
from dataclasses import dataclass

from app.models.catalog import Addon, Characteristic, Source
from app.validation.errors import Issue, ValidationResult


@dataclass
class Related:
    target: str
    source: Source
    item: Characteristic | Addon | str
    description_field: str = "description"
    target_type: str | None = None


def validate_catalog(result: ValidationResult, related: list[Related]) -> None:
    catalog = result.catalog
    products = {p.external_id: p for p in catalog.products}
    variations = {v.external_id: v for v in catalog.variations}
    for entities, label in ((catalog.products, "product"), (catalog.variations, "variation")):
        seen: dict[str, Source] = {}
        for entity in entities:
            if entity.external_id in seen:
                result.error(
                    entity.source,
                    f"{label}_id",
                    f'Duplicate {label} ID "{entity.external_id}". First defined on sheet '
                    f'"{seen[entity.external_id].sheet}", row {seen[entity.external_id].row}. '
                    "IDs must be unique across all sheets. Keep one definition or assign a unique ID and update its references.",
                    entity.external_id,
                )
            seen.setdefault(entity.external_id, entity.source)
    if not products:
        result.error(
            Source(sheet="(workbook)", row=1),
            "product",
            "No products found. Supply at least one product with ID and Name.",
        )

    def reference(target: str, source: Source, label: str) -> bool:
        if target not in products:
            local = ", ".join(
                sorted(p.external_id for p in products.values() if p.source.sheet == source.sheet)
            )
            result.error(
                source,
                "product_id",
                f'{label} references product "{target}", which was not found. Products on this sheet: {local or "none"}. Check for IDs copied from another category.',
                target,
            )
            return False
        if products[target].source.sheet != source.sheet:
            result.error(
                source,
                "product_id",
                f'{label} references product "{target}" on sheet "{products[target].source.sheet}". Keep related sections on the same category sheet.',
                target,
            )
            return False
        return True

    combinations: dict[tuple[str, str], Source] = {}
    for variation in catalog.variations:
        if reference(
            variation.product_external_id, variation.source, f'Variation "{variation.external_id}"'
        ):
            products[variation.product_external_id].variations.append(variation)
        if variation.attributes:
            combination = (
                variation.product_external_id,
                json.dumps(variation.attributes, sort_keys=True, ensure_ascii=False),
            )
            if combination in combinations:
                result.issues.append(
                    Issue(
                        severity="WARNING",
                        source=variation.source,
                        field="attributes",
                        message=(
                            f"Same attributes as variation on row {combinations[combination].row}. "
                            "Both variations are retained using their distinct variation IDs."
                        ),
                        value=str(variation.attributes),
                    )
                )
            combinations.setdefault(combination, variation.source)
    for record in related:
        if record.target_type == "variation" and isinstance(record.item, Addon):
            addon_variation = variations.get(record.target)
            if addon_variation is None or addon_variation.source.sheet != record.source.sheet:
                result.error(
                    record.source,
                    "variation_id",
                    "Add-on references a missing variation on this sheet.",
                    record.target,
                )
            elif any(
                (a.external_id or a.name) == (record.item.external_id or record.item.name)
                for a in addon_variation.addons
            ):
                result.error(
                    record.source, "addon", "Duplicate add-on for this variation.", record.item.name
                )
            else:
                addon_variation.addons.append(record.item)
            continue
        if not reference(record.target, record.source, "Side section"):
            continue
        product = products[record.target]
        if isinstance(record.item, Characteristic):
            if any(
                c.name.casefold() == record.item.name.casefold() for c in product.characteristics
            ):
                result.error(
                    record.source,
                    "characteristic",
                    "Duplicate characteristic name for this product.",
                    record.item.name,
                )
            product.characteristics.append(record.item)
        elif isinstance(record.item, Addon):
            if any(
                (a.external_id or a.name) == (record.item.external_id or record.item.name)
                for a in product.addons
            ):
                result.error(
                    record.source, "addon", "Duplicate add-on for this product.", record.item.name
                )
            product.addons.append(record.item)
        else:
            if getattr(product, record.description_field) is not None:
                result.error(
                    record.source,
                    "description",
                    "Multiple descriptions for this product. Keep one definition.",
                )
            setattr(product, record.description_field, record.item)
    seen_filters: set[tuple[str, str, str | None]] = set()
    for f in catalog.filters:
        target = f.target_external_id
        key = (target, f.name, f.target_type)
        if key in seen_filters:
            result.error(f.source, "filter", "Duplicate filter for this target.", target)
        seen_filters.add(key)
        if f.target_type not in {None, "product", "variation"}:
            result.error(f.source, "target_type", "Use product or variation.", f.target_type)
            continue
        candidates = []
        if target in products and f.target_type != "variation":
            candidates.append(products[target].source)
        if target in variations and f.target_type != "product":
            candidates.append(variations[target].source)
        if len(candidates) != 1:
            message = "Filter target is missing or ambiguous. Check its ID and specify target_type when needed."
            if (
                f.target_type == "variation"
                and target not in variations
                and target in products
                and products[target].source.sheet == f.source.sheet
            ):
                message = (
                    f'Filter ID "{target}" refers to a product on this sheet, but the filter '
                    'header selects variations. Change "ID варіації" to "ID товару" '
                    'if this table contains product filters, or set target_type to "product" '
                    "for this row."
                )
            result.error(
                f.source,
                "target_id",
                message,
                target,
            )
        elif candidates[0].sheet != f.source.sheet:
            result.error(
                f.source, "target_id", "Filter target belongs to another sheet/category.", target
            )
        else:
            f.target_type = (
                "product" if target in products and f.target_type != "variation" else "variation"
            )
