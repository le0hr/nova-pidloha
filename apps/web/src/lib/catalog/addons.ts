import type { ProductAddon } from "@/types/product";

export type RawAddon = {
  documentId: string;
  name: string;
  group?: string | null;
  price?: number | string | null;
  additionalCost?: number | string | null;
};
/** Price-list names end with ", 1 шт." (the unit of the price): the page shows the quantity separately. */
export const cleanAddonName = (name: string) =>
  name.replace(/,\s*1\s*шт\.?(\s*)/i, (_match, rest: string, offset: number, full: string) =>
    offset + _match.length < full.length && rest ? ". " : "").trim();

export function normalizeAddon(addon: RawAddon): ProductAddon {
  // A surcharge is authoritative; standalone add-on price is the fallback.
  const price = Number(addon.additionalCost ?? addon.price ?? 0);
  if (!Number.isFinite(price)) throw new Error(`Invalid add-on price: ${addon.documentId}`);
  return { id: addon.documentId, name: cleanAddonName(addon.name), group: addon.group?.trim() || null, price };
}
export const addonGroup = (addon: ProductAddon) =>
  JSON.stringify(addon.group ? ["group", addon.group] : ["addon", addon.id]);

export function groupAddons(addons: ProductAddon[]) {
  const groups = new Map<string, { id: string; title: string; addons: ProductAddon[] }>();
  for (const addon of addons) {
    const id = addonGroup(addon);
    if (!groups.has(id)) groups.set(id, { id, title: addon.group ?? addon.name, addons: [] });
    groups.get(id)!.addons.push(addon);
  }
  return [...groups.values()];
}
/**
 * How many pieces of an add-on can be ordered: door frame, casing, extension board and stop strip come in
 * 1, 2.5 or 5 pieces; skirting in any whole number; everything else is one piece. Keep in sync with
 * apps/cms/src/checkout/catalog.ts.
 */
export const ADDON_PRESETS = [1, 2.5, 5];
export const SKIRTING_MAX = 100;
export function addonQuantityKind(addon: Pick<ProductAddon, "group" | "name">): "preset" | "count" | "single" {
  const text = `${addon.group ?? ""} ${addon.name}`.toLowerCase();
  if (/плінтус/.test(text)) return "count";
  if (/коробк|лиштв|добір|добірн|притворн/.test(text)) return "preset";
  return "single";
}
export function validAddonQty(addon: Pick<ProductAddon, "group" | "name">, qty: unknown): number {
  const kind = addonQuantityKind(addon);
  const value = Number(qty);
  if (kind === "preset") return ADDON_PRESETS.includes(value) ? value : 1;
  if (kind === "count") return Number.isInteger(value) && value >= 1 && value <= SKIRTING_MAX ? value : 1;
  return 1;
}
/** "2,5 шт" */
export const formatQty = (qty: number) => `${qty.toLocaleString("uk-UA")} шт`;

export const selectedAddons = (addons: ProductAddon[], selection: Record<string, string>, quantities: Record<string, number> = {}) =>
  addons.filter((addon) => selection[addonGroup(addon)] === addon.id)
    .map((addon) => ({ ...addon, qty: validAddonQty(addon, quantities[addonGroup(addon)] ?? 1) }));
export const addonLineTotal = (addon: ProductAddon) => Math.round(addon.price * (addon.qty ?? 1) * 100) / 100;
export const addonTotal = (addons: ProductAddon[]) =>
  Math.round(addons.reduce((sum, addon) => sum + addonLineTotal(addon), 0) * 100) / 100;
export const configuredCartId = (slug: string, addons: ProductAddon[]) =>
  addons.length ? `${slug}:addons:${JSON.stringify(addons.map((addon) => `${addon.id}${(addon.qty ?? 1) !== 1 ? `x${addon.qty}` : ""}`).sort())}` : slug;
