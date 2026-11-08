import type { ProductVariation, ProductAddon } from "@/types/product";
import type CartItemType from "@/types/cart";
import { addonTotal, configuredCartId } from "./addons";
import { attributeLabel } from "./variations";

/**
 * `size`: a non-standard size, priced by the caller (see sizing.ts) into `variation.price`.
 * `packArea`: floor sold by packs; `variation.price` is per m², the cart line is one pack.
 */
export function configuredItem(variation: ProductVariation, name: string, addons: ProductAddon[], size?: { width: number; height: number }, packArea?: number | null): Omit<CartItemType, "qty"> {
  const unitPrice = packArea ? Math.round(variation.price * packArea * 100) / 100 : variation.price;
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
  const sizeLabel = size ? `Нестандартний розмір: ${size.width}×${size.height} мм` : null;
  return {
    id: configuredCartId(variation.slug, addons) + (size ? `|${size.width}x${size.height}` : ""),
    variationSlug: variation.slug,
    ...(size ? { size } : {}),
    name,
    basePrice: unitPrice,
    addons: addons.map((addon) => ({ ...addon })),
    mods: [...mods.filter((mod) => !(size && /^(Ширина|Висота)/.test(mod))), ...(sizeLabel ? [sizeLabel] : []),
      ...(packArea ? [`Упаковка: ${packArea} м² (${variation.price.toLocaleString("uk-UA")} грн/м²)`] : []), ...addons.map((addon) =>
      `${addon.group ? `${addon.group}: ` : ""}${addon.name} (${addon.price > 0 ? "+" : ""}${addon.price.toLocaleString("uk-UA")} грн)`) ],
    price: Math.round((unitPrice + addonTotal(addons)) * 100) / 100,
    image: variation.image,
  };
}
