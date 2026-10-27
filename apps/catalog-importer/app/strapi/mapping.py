"""Adapter for cms/src/api schemas (Strapi 5).

Symbolic references keep the whole plan reviewable before new documentIds exist.
Only this module knows how domain attributes become CMS relations or components.
"""

import hashlib
import json
import re
from typing import Any

from app.models.catalog import Catalog, Product, Variation
from app.models.import_plan import MediaAsset
from app.parser.headers import normalize

ORDER = (
    "media",
    "categories",
    "brands",
    "decors",
    "decor-colors",
    "decor-glasses",
    "filter-groups",
    "filter-codes",
    "architrave-types",
    "products",
    "product-variations",
)
# Target collection and cardinality of importer-owned relation fields.
RELATIONS: dict[str, dict[str, tuple[str, bool]]] = {
    "categories": {"parent": ("categories", False)},
    "decor-colors": {"decor": ("decors", False)},
    "filter-groups": {"categories": ("categories", True)},
    "filter-codes": {"filter_group": ("filter-groups", False)},
    "products": {
        "category": ("categories", False),
        "brand": ("brands", False),
        "filter_values": ("filter-codes", True),
        "addons": ("architrave-types", True),
        "image": ("media", False),
    },
    "product-variations": {
        "products": ("products", True),
        "decor": ("decors", False),
        "decor_color": ("decor-colors", False),
        "decor_glass": ("decor-glasses", False),
        "architrave_types": ("architrave-types", True),
        "addons": ("architrave-types", True),
        "filter_values": ("filter-codes", True),
        "image": ("media", False),
    },
}


def stable_id(kind: str, *parts: str) -> str:
    material = json.dumps([normalize(p) for p in parts], ensure_ascii=False)
    return kind + "-" + hashlib.sha256(material.encode()).hexdigest()[:24]


def reference(entity: str, external_id: str) -> dict[str, str]:
    return {"$entity": entity, "$id": external_id}


def slug(entity: str, external_id: str) -> str:
    readable = re.sub("[^a-z0-9-]+", "-", external_id.casefold()).strip("-")
    return f"{entity}-{readable or stable_id(entity, external_id)}"


# Preserve the storefront's established category URLs.
CATEGORY_SLUGS = {
    "міжкімнатні": "mizhkimnatni",
    "міжкімнатні двері": "mizhkimnatni",
    "двері міжкімнатні": "mizhkimnatni",
    "вхідні": "vhidni",
    "вхідні двері": "vhidni",
    "двері вхідні": "vhidni",
    "підлога": "pidloha",
    "фурнітура": "furnitura",
}
TRANSLITERATION = dict(
    zip(
        "абвгґдеєжзиіїйклмнопрстуфхцчшщьюя",
        [
            "a",
            "b",
            "v",
            "h",
            "g",
            "d",
            "e",
            "ye",
            "zh",
            "z",
            "y",
            "i",
            "yi",
            "y",
            "k",
            "l",
            "m",
            "n",
            "o",
            "p",
            "r",
            "s",
            "t",
            "u",
            "f",
            "kh",
            "ts",
            "ch",
            "sh",
            "shch",
            "",
            "yu",
            "ya",
        ],
    )
)


def category_slug(name: str, *scope: str) -> str:
    def readable(value: str) -> str:
        value = normalize(value)
        if value in CATEGORY_SLUGS:
            return CATEGORY_SLUGS[value]
        value = "".join(TRANSLITERATION.get(c, c) for c in value if c not in "'’ʼ")
        return re.sub("[^a-z0-9]+", "-", value).strip("-")

    # Include parent names so equally named subclasses have distinct URLs.
    result = "-".join(filter(None, (readable(p) for p in (*scope, name))))
    if not result:
        raise ValueError(f"Category {name!r} needs a readable name for its URL.")
    return result


def filter_slug(name: str, *scope: str) -> str:
    """Keep Cyrillic names readable; scope values by their filter group."""
    parts = []
    for part in (*scope, name):
        value = normalize(part)
        value = "".join(c for c in value if c not in "'’ʼ")
        readable = re.sub(r"[\W_]+", "-", value).strip("-")
        if not readable and value:
            readable = stable_id("symbol", value)
        parts.append(readable)
    result = "-".join(filter(None, parts))
    if not result:
        raise ValueError(f"Filter {name!r} needs a readable name for its URL.")
    return result


def desired_records(
    catalog: Catalog, assets: dict[str, MediaAsset]
) -> dict[str, dict[str, dict[str, Any]]]:
    records: dict[str, dict[str, dict[str, Any]]] = {entity: {} for entity in ORDER}

    def named(entity: str, name: str, *scope: str, **fields: Any) -> dict[str, str]:
        key = stable_id(entity, *scope, name)
        data = {"external_id": key, "name": name, **fields}
        if entity in {"categories", "brands", "filter-groups", "filter-codes"}:
            data["slug"] = (
                category_slug(name, *scope)
                if entity == "categories"
                else filter_slug(name, *scope)
                if entity in {"filter-groups", "filter-codes"}
                else slug(entity, key)
            )
        records[entity].setdefault(key, data)
        return reference(entity, key)

    def image_ref(name: str | None) -> dict[str, str] | None:
        if name is None:
            return None
        if name.startswith("/uploads/"):
            records["media"].setdefault(name, {"url": name})
            return reference("media", name)
        asset = assets[name]
        records["media"][asset.sha256] = {"name": asset.name, "sha256": asset.sha256}
        return reference("media", asset.sha256)

    categories: dict[str, dict[str, str]] = {}
    for p in sorted(catalog.products, key=lambda p: p.external_id):
        path = p.category or p.source.sheet
        if normalize(path.split("/")[0]) != normalize(p.source.sheet):
            path = p.source.sheet + "/" + path
        parts = [part.strip() for part in path.split("/") if part.strip()]
        parent = None
        for index, part in enumerate(parts):
            parent = named("categories", part, *parts[:index], parent=parent)
        if parent is not None:
            categories[p.external_id] = parent

    product_filters: dict[str, list[dict[str, str]]] = {p.external_id: [] for p in catalog.products}
    variation_filters: dict[str, list[dict[str, str]]] = {
        v.external_id: [] for v in catalog.variations
    }
    variations = {v.external_id: v for v in catalog.variations}
    for f in catalog.filters:
        pid = (
            f.target_external_id
            if f.target_type == "product"
            else variations[f.target_external_id].product_external_id
        )
        group = named("filter-groups", f.name, type="select", categories=[])
        group_data = records["filter-groups"][group["$id"]]
        category_ref = categories[pid]
        if category_ref not in group_data["categories"]:
            group_data["categories"].append(category_ref)
        value = named("filter-codes", f.value, f.name, filter_group=group)
        if value not in product_filters[pid]:
            product_filters[pid].append(value)
        if f.target_type == "variation":
            variation_filters[f.target_external_id].append(value)

    extras: dict[str, list[dict[str, str]]] = {}
    for p in sorted(catalog.products, key=lambda p: p.external_id):
        extras[p.external_id] = []
        for a in p.addons:
            key = (
                stable_id("addon", p.external_id, a.external_id)
                if a.external_id
                else stable_id("addon", p.external_id, a.group or "", a.name)
            )
            records["architrave-types"][key] = {
                "external_id": key,
                "name": a.name,
                "group": a.group,
                "price": str(a.price) if a.price is not None else None,
                "additionalCost": str(a.price_delta) if a.price_delta is not None else None,
            }
            extras[p.external_id].append(reference("architrave-types", key))
        prices = [v.price for v in p.variations if v.active]
        price = p.price if p.price is not None else min(prices) if prices else None
        records["products"][p.external_id] = {
            "external_id": p.external_id,
            "name": p.name,
            "slug": slug("product", p.external_id),
            "description": p.description,
            "shortDescription": p.short_description,
            "price": str(price) if price is not None else None,
            "category": categories[p.external_id],
            "brand": named("brands", p.brand) if p.brand else None,
            "active": p.active and (not p.variations or any(v.active for v in p.variations)),
            "catalog_attributes": p.attributes,
            "attribute_definitions": definitions(p),
            "characteristics": [
                c.model_dump(mode="json") for c in sorted(p.characteristics, key=lambda c: c.name)
            ],
            "addons": extras[p.external_id],
            "filter_values": product_filters[p.external_id],
        }
        # Combined tables attach the photo to variations; preserve a hand-managed product image.
        if p.image:
            records["products"][p.external_id]["image"] = image_ref(p.image)

    for v in sorted(catalog.variations, key=lambda v: v.external_id):
        variation_extras = list(extras[v.product_external_id])
        for a in v.addons:
            key = stable_id(
                "variation-addon", v.external_id, a.external_id or "", a.group or "", a.name
            )
            records["architrave-types"][key] = {
                "external_id": key,
                "name": a.name,
                "group": a.group,
                "price": str(a.price) if a.price is not None else None,
                "additionalCost": str(a.price_delta) if a.price_delta is not None else None,
            }
            variation_extras.append(reference("architrave-types", key))
        labels = {
            normalize(a.display_name): v.attributes.get(a.key) for a in v.attribute_definitions
        }

        decor = attribute(v.external_id, labels, "тип покриття", "декор", "decor")
        color = attribute(v.external_id, labels, "покриття", "колір", "color")
        glass = attribute(v.external_id, labels, "скло", "glass")
        # Workbook edge headings may include explanatory text in parentheses.
        edge_names = tuple(name for name in labels if re.fullmatch(r"кромка(?:\s*\(.*\))?", name))
        edge = attribute(v.external_id, labels, "edge", "architrave_types", *edge_names)
        decor_ref = named("decors", decor) if decor else None
        records["product-variations"][v.external_id] = {
            "external_id": v.external_id,
            "slug": slug("variation", v.external_id),
            "products": [reference("products", v.product_external_id)],
            "price": str(v.price),
            "active": v.active,
            "sku": v.sku,
            "note": v.note,
            "supplier_code": v.supplier_code,
            "catalog_attributes": v.attributes,
            "attribute_definitions": definitions(v),
            "decor": decor_ref,
            "decor_color": named("decor-colors", color, decor or "", decor=decor_ref)
            if color
            else None,
            "decor_glass": named("decor-glasses", glass) if glass else None,
            "architrave_types": [named("architrave-types", edge)] if edge else [],
            "addons": variation_extras,
            "filter_values": variation_filters[v.external_id],
        }
        if v.image:
            records["product-variations"][v.external_id]["image"] = image_ref(v.image)
    return records


def definitions(entity: Product | Variation) -> list[dict[str, str]]:
    return [a.model_dump() for a in sorted(entity.attribute_definitions, key=lambda a: a.key)]


def resolve(value: Any, identifiers: dict[tuple[str, str], str], *, pending: bool = False) -> Any:
    if isinstance(value, dict):
        if set(value) == {"$entity", "$id"}:
            key = (value["$entity"], value["$id"])
            if pending:
                return identifiers.get(key, f"pending:{key}")
            return identifiers[key]
        return {key: resolve(item, identifiers, pending=pending) for key, item in value.items()}
    if isinstance(value, list):
        return [resolve(item, identifiers, pending=pending) for item in value]
    return value


def relation_id(value: Any, media: bool = False) -> str | None:
    if value is None:
        return None
    if not isinstance(value, dict) or value.get("id" if media else "documentId") is None:
        raise ValueError(
            "A populated Strapi relation is missing its ID. Check token read permissions."
        )
    return str(value["id" if media else "documentId"])


def project_remote(entity: str, data: dict[str, Any], fields: dict[str, Any]) -> dict[str, Any]:
    result = {key: data.get(key) for key in fields}
    for key, (target, many) in RELATIONS.get(entity, {}).items():
        if key not in fields:
            continue
        if key not in data:
            raise ValueError(
                f"{entity}.{key} missing from populated response; check permissions/schema."
            )
        value = data[key]
        if many:
            if not isinstance(value, list):
                raise ValueError(f"{entity}.{key} must be a populated array.")
            result[key] = sorted(relation_id(item, target == "media") for item in value)
        else:
            result[key] = relation_id(value, target == "media")
    if "characteristics" in result:
        result["characteristics"] = [
            {k: c.get(k) for k in ("name", "value", "unit")}
            for c in data.get("characteristics", [])
        ]
    return result


def attribute(external_id: str, labels: dict[str, Any], *names: str) -> str | None:
    values = {str(labels[n]) for n in names if labels.get(n) is not None}
    if len(values) > 1:
        raise ValueError(f"Variation {external_id}: conflicting CMS aliases {names}.")
    return next(iter(values), None)
