import type { ProductVariation, ProductAddon } from "@/types/product";
import type CartItemType from "@/types/cart";
import { addonLineTotal, addonTotal, addonQtyNote, configuredCartId } from "./addons";

/**
 * `size`: the chosen door size; a non-standard one is priced by the caller (see sizing.ts) into `variation.price`.
 * `packArea`: floor sold by packs; `variation.price` is per m², the cart line is one pack.
 */
export function configuredItem(variation: ProductVariation, name: string, addons: ProductAddon[], size?: { width: number; height: number; custom?: boolean; percent?: number }, packArea?: number | null): Omit<CartItemType, "qty"> {
  const unitPrice = packArea ? Math.round(variation.price * packArea * 100) / 100 : variation.price;
  const mods = [
    variation.decor && `Декор: ${variation.decor.name}`,
    variation.decor_color && `Колір: ${variation.decor_color.name}`,
    variation.decor_glass && `Скло: ${variation.decor_glass.name}`,
    ...(variation.options ?? []).filter((option) => option.value.trim()).map((option) => `${option.name}: ${option.value}`),
    !size && variation.width && variation.height && `Розмір: ${variation.width}×${variation.height} мм`,
  ].filter((value): value is string => Boolean(value));
  const sizeLabel = !size ? null : size.custom
    ? `Нестандартний розмір: ${size.width}×${size.height} мм${size.percent ? ` (+${size.percent}%)` : ""}`
    : `Розмір: ${size.width}×${size.height} мм`;
  return {
    id: configuredCartId(variation.slug, addons) + (size ? `|${size.width}x${size.height}` : ""),
    variationSlug: variation.slug,
    ...(size ? { size: { width: size.width, height: size.height, ...(size.custom ? { custom: true, percent: size.percent ?? 0 } : {}) } } : {}),
    name,
    basePrice: unitPrice,
    addons: addons.map((addon) => ({ ...addon })),
    mods: [...mods, ...(sizeLabel ? [sizeLabel] : []),
      ...(packArea ? [`Упаковка: ${packArea} м² (${variation.price.toLocaleString("uk-UA")} грн/м²)`] : []), ...addons.map((addon) =>
      `${addon.group ? `${addon.group}: ` : ""}${addon.name}${addonQtyNote(addon)} (${addon.price > 0 ? "+" : ""}${addonLineTotal(addon).toLocaleString("uk-UA")} грн)`) ],
    price: Math.round((unitPrice + addonTotal(addons)) * 100) / 100,
    image: variation.image,
  };
}
