"""Domain objects are independent of both Excel and Strapi schemas."""

from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

Money = Annotated[Decimal, Field(ge=0, allow_inf_nan=False)]
Scalar = str | int | float | bool


class DomainModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class Source(DomainModel):
    sheet: str
    row: int
    column: str | None = None


class Attribute(DomainModel):
    display_name: str
    key: str


class Characteristic(DomainModel):
    name: str = Field(min_length=1)
    value: str = Field(min_length=1)
    unit: str | None = None


class Addon(DomainModel):
    external_id: str | None = None
    name: str = Field(min_length=1)
    group: str | None = None
    price: Money | None = None
    price_delta: Decimal | None = Field(default=None, allow_inf_nan=False)


class Filter(DomainModel):
    target_external_id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    value: str = Field(min_length=1)
    target_type: str | None = None
    source: Source


class Variation(DomainModel):
    addons: list[Addon] = Field(default_factory=list)
    external_id: str = Field(min_length=1)
    product_external_id: str = Field(min_length=1)
    price: Money
    attributes: dict[str, Scalar] = Field(default_factory=dict)
    attribute_definitions: list[Attribute] = Field(default_factory=list)
    image: str | None = None
    sku: str | None = None
    note: str | None = None
    supplier_code: str | None = None
    active: bool = True
    source: Source


class Product(DomainModel):
    external_id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    category: str | None = None
    brand: str | None = None
    description: str | None = None
    short_description: str | None = None
    price: Money | None = None
    image: str | None = None
    attributes: dict[str, Scalar] = Field(default_factory=dict)
    attribute_definitions: list[Attribute] = Field(default_factory=list)
    characteristics: list[Characteristic] = Field(default_factory=list)
    addons: list[Addon] = Field(default_factory=list)
    variations: list[Variation] = Field(default_factory=list)
    active: bool = True
    source: Source


class Catalog(DomainModel):
    products: list[Product] = Field(default_factory=list)
    variations: list[Variation] = Field(default_factory=list)
    filters: list[Filter] = Field(default_factory=list)
