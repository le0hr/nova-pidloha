import type { ProductVariation, ProductAddon } from "@/types/product";
import type CartItemType from "@/types/cart";
import { addonTotal, configuredCartId } from "./addons";
import { attributeLabel } from "./variations";

export function configuredItem(variation: ProductVariation, name: string, addons: ProductAddon[]): Omit<CartItemType, "qty"> {
  const mods = variation.attribute_definitions?.length
    ? variation.attribute_definitions.flatMap(({ key, display_name }) => {
        const value = variation.catalog_attributes?.[key];
        return value == null || String(value).trim() === "" ? [] : [`${attributeLabel(display_name)}: ${value}`];
      })
    : [
        variation.decor && `Декор: ${variation.decor.name}`,
        variation.decor_color && `Колір: ${variation.decor_color.name}`,
        variation.decor_glass && `Скло: ${variation.decor_glass.name}`,
      ].filter((value): value is string => Boolean(value));
  return {
    id: configuredCartId(variation.slug, addons),
    variationSlug: variation.slug,
    name,
    basePrice: variation.price,
    addons: addons.map((addon) => ({ ...addon })),
    mods: [...mods, ...addons.map((addon) =>
      `${addon.group ? `${addon.group}: ` : ""}${addon.name} (${addon.price > 0 ? "+" : ""}${addon.price.toLocaleString("uk-UA")} грн)`) ],
    price: Math.round((variation.price + addonTotal(addons)) * 100) / 100,
    image: variation.image,
  };
}
