import type CartItemType from "@/types/cart";
import type { ProductAddon } from "@/types/product";
import { addonLineTotal, addonQuantityKind, addonTotal, formatUnits, sidesLabel, unitsPerSet } from "./addons";

export const money = (value: number) => `${value.toLocaleString("uk-UA")} грн`;
const round = (value: number) => Math.round(value * 100) / 100;

/** "1 шт × 47 грн", "На дві сторони: 5 шт × 450 грн" */
export function addonDetail(addon: ProductAddon, qty = 1): string {
  const units = addon.qty ?? 1;
  const count = `${qty > 1 ? `${qty} × ` : ""}${formatUnits(addon, units)} × ${money(addon.price)}`;
  const kind = addonQuantityKind(addon);
  if (kind === "sides") return `${sidesLabel(units / unitsPerSet(addon))}: ${count}`;
  return kind === "perDoor" ? `На одні двері: ${count}` : count;
}

export type ReceiptRow = { title: string; details: string[]; price: number };

/** Cart item as receipt rows (the product, then every add-on) for `qty` items. The rows sum up to price × qty. */
export function itemReceipt(item: CartItemType, qty = 1): ReceiptRow[] {
  const addons = item.addons ?? [];
  // configuredItem puts one text per add-on at the end of mods; here they are rows of their own.
  const own = (item.mods ?? []).slice(0, Math.max(0, (item.mods?.length ?? 0) - addons.length));
  const base = item.basePrice ?? round(item.price - addonTotal(addons));
  return [
    { title: item.name, details: qty > 1 ? [...own, `${qty} × ${money(base)}`] : own, price: round(base * qty) },
    ...addons.map((addon) => ({ title: addon.name, details: [addonDetail(addon, qty)], price: round(addonLineTotal(addon) * qty) })),
  ];
}
