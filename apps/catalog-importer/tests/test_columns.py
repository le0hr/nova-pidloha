from app.models.catalog import Attribute, Catalog, Product, Source, Variation
from app.strapi.columns import classify
from app.strapi.mapping import desired_records


def variation(columns: dict[str, object]) -> Variation:
    keys = {name: f"k{i}" for i, name in enumerate(columns)}
    return Variation(
        external_id="v1", product_external_id="p1", price=100,
        attributes={keys[name]: value for name, value in columns.items() if value is not None},
        attribute_definitions=[Attribute(display_name=name, key=key) for name, key in keys.items()],
        source=Source(sheet="s", row=2),
    )


def test_door_columns() -> None:
    fields, unknown = classify(variation({
        "Тип покриття": "Sincrolam", "Покриття": "Дуб латте", "Скло": "Сатин",
        "Сторона відкривання": "Ліве", "Конструкція": "Каркасно-щитові",
        "Кромка (якщо немає вибору, залишити пустою)": "Чорна", "Ширина, мм": "800", "Висота, мм": 2000,
    }))
    assert unknown == []
    assert (fields["width"], fields["height"]) == (800, 2000)
    assert fields["options"] == []
    assert (fields["construction"], fields["edge"], fields["opening_side"]) == ("Каркасно-щитові", "Чорна", "Ліве")


def test_floor_columns() -> None:
    fields, unknown = classify(variation({
        "Площа в пачці, м2": "2,2204", "Розмір дошки, мм": "1285×192×8", "Наявність": "під замовлення",
        "Клас зносостійкості": "32", "Ширина рулону": "2 м, 4 м", "Фаска": "4V",
    }))
    assert unknown == []
    assert fields["packArea"] == 2.2204 and fields["boardSize"] == "1285×192×8"
    assert fields["availability"] == "on_order" and fields["width"] is None and fields["options"] == []
    assert fields["characteristics"] == [
        {"name": "Клас зносостійкості", "value": "32", "unit": None},
        {"name": "Фаска", "value": "4V", "unit": None},
        {"name": "Ширина рулону", "value": "2 м, 4 м", "unit": None},
    ]


def test_unknown_columns_are_reported_not_guessed() -> None:
    fields, unknown = classify(variation({"М² в упаковці": "1.44", "Склування": "Матове", "Наявність": "скоро"}))
    assert fields["packArea"] == 1.44
    assert unknown == ["Склування", "Наявність = скоро"]
    assert fields["options"] == [] and fields["availability"] is None


def test_product_marks_and_subclass() -> None:
    source = Source(sheet="Двері", row=2)
    product = Product(external_id="p1", name="Door", category="Міжкімнатні", source=source,
                      attributes={"позначка": "Новинка, Під замовлення", "підклас": "Розсувні, збірні"})
    v = variation({"Тип покриття": "PP"})
    catalog = Catalog(products=[product], variations=[v])
    records = desired_records(catalog, {})
    p = records["products"]["p1"]
    assert p["isNew"] is True and "isPromo" not in p and "isSale" not in p
    assert {"name": "Конструкція", "value": "Розсувні, збірні", "unit": None} in p["characteristics"]
    assert "catalog_attributes" not in p and "attribute_definitions" not in p
    row = records["product-variations"]["v1"]
    assert row["availability"] == "on_order" and "catalog_attributes" not in row
