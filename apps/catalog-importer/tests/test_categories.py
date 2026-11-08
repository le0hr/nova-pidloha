"""Storefront category structure built on top of workbook classes."""

from app.models.catalog import Catalog, Product, Source
from app.strapi.mapping import category_path, category_slug, desired_records, stable_id


def product(external_id: str, category: str, sheet: str = "Двері", **fields) -> Product:
    return Product(
        external_id=external_id,
        name=f"P{external_id}",
        category=category,
        source=Source(sheet=sheet, row=2),
        **fields,
    )


def test_door_subclass_becomes_subcategory() -> None:
    assert category_path(product("1", "Міжкімнатні", attributes={"підклас": "Каркасно-щитові"})) == [
        "Двері",
        "Міжкімнатні",
        "Каркасно-щитові",
    ]
    # Synonyms from different suppliers land in one subcategory.
    for subclass in ("Збірні", "Збірної конструкції", "Розсувні, збірні", "Двостороннє полотно"):
        path = category_path(product("1", "Міжкімнатні", attributes={"підклас": subclass}))
        assert path == ["Двері", "Міжкімнатні", "Збірні"], subclass
    for subclass in (
        "Прихований монтаж, внутрішнє відкривання",
        "Дверний блок прихованого монтажу, зовнішнє відкривання",
    ):
        path = category_path(product("1", "Міжкімнатні", attributes={"підклас": subclass}))
        assert path == ["Двері", "Міжкімнатні", "Приховані"], subclass


def test_door_without_known_subclass() -> None:
    # City Line rows have no subclass; their doors are frame-and-panel.
    assert category_path(product("1", "Міжкімнатні", brand="City Line"))[-1] == "Збірні"
    # Unknown subclass or brand: stays in the class itself.
    assert category_path(product("1", "Міжкімнатні", attributes={"підклас": "Нове"})) == ["Двері", "Міжкімнатні"]
    assert category_path(product("1", "Міжкімнатні", brand="Korfad")) == ["Двері", "Міжкімнатні"]
    # Subclasses only split interior doors.
    assert category_path(
        product("1", "Накладки на вхідні двері", attributes={"підклас": "Збірні"})
    ) == ["Двері", "Накладки на вхідні двері"]


def test_class_alias_and_hidden_services() -> None:
    assert category_path(product("1", "Профіль", sheet="Фурнітура")) == [
        "Фурнітура",
        "З’єднувальний профіль",
    ]
    for hidden in ("Послуга", "Акційний комплект", "Наповнення", "Випрямляч"):
        assert category_path(product("1", hidden, sheet="Фурнітура")) is None


def test_records_reuse_existing_category_ids_and_hide_services() -> None:
    catalog = Catalog(
        products=[
            product("door", "Міжкімнатні", attributes={"підклас": "Каркасно-щитові"}),
            product("service", "Послуга", sheet="Фурнітура"),
        ]
    )
    records = desired_records(catalog, {})
    leaf = stable_id("categories", "Двері", "Міжкімнатні", "Каркасно-щитові")
    # Same external_id/slug the storefront migration created, so imports reuse it.
    assert records["categories"][leaf]["slug"] == category_slug("Каркасно-щитові", "Двері", "Міжкімнатні")
    assert records["categories"][leaf]["slug"] == "dveri-mizhkimnatni-karkasno-shchytovi"
    assert records["products"]["door"]["category"] == {"$entity": "categories", "$id": leaf}
    assert records["products"]["door"]["active"] is True
    assert records["products"]["service"]["category"] is None
    assert records["products"]["service"]["active"] is False
    assert not any(c["name"] == "Послуга" for c in records["categories"].values())
