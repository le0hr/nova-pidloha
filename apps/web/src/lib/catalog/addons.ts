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
type AddonLabel = Pick<ProductAddon, "group" | "name">;
/**
 * How an add-on is counted: casing by door sides, frame and extension board per door, skirting in any whole number, the rest one piece.
 * A side of casing, a frame or an extension = 2.5 pieces, or one set when the price is per set ("1 комплект (2,5 шт.)", "2,5 шт.").
 * Keep in sync with apps/cms/src/checkout/catalog.ts.
 */
export const SIDES = [1, 2];
export const SKIRTING_MAX = 100;
export function addonQuantityKind(addon: AddonLabel): "sides" | "perDoor" | "count" | "single" {
  if (/плінтус/i.test(`${addon.group ?? ""} ${addon.name}`)) return "count";
  const label = addon.group || addon.name;
  return /^\s*лиштв/i.test(label) ? "sides" : /^\s*(коробк|добір)/i.test(label) ? "perDoor" : "single";
}
/** The price already covers 2.5 pieces. */
export const isSet = (addon: AddonLabel) => /2[.,]5\s*шт/i.test(addon.name);
/** Priced units (pieces or sets) for one side of casing, one frame or one extension. */
export const unitsPerSet = (addon: AddonLabel) => (isSet(addon) ? 1 : 2.5);
/** The chosen value: sides for casing, pieces for skirting; the first option (1) by default. */
export function validAddonChoice(addon: AddonLabel, choice: unknown): number {
  const kind = addonQuantityKind(addon);
  const value = Number(choice);
  if (kind === "sides") return SIDES.includes(value) ? value : SIDES[0];
  if (kind === "count") return Number.isInteger(value) && value >= 1 && value <= SKIRTING_MAX ? value : 1;
  return 1;
}
/** Priced units of a choice. */
export const addonUnits = (addon: AddonLabel, choice: unknown) =>
  validAddonChoice(addon, choice) * (["sides", "perDoor"].includes(addonQuantityKind(addon)) ? unitsPerSet(addon) : 1);
export const sidesLabel = (sides: number) => (sides === 2 ? "На дві сторони" : "На одну сторону");
/** "2,5 шт", "1 комплект", "2 комплекти" */
export const formatUnits = (addon: AddonLabel, units: number) =>
  isSet(addon) ? `${units} ${units === 1 ? "комплект" : "комплекти"}` : `${units.toLocaleString("uk-UA")} шт`;
/** Cart line: " — на одну сторону (2,5 шт)" for casing, " × 3 шт" for several pieces. */
export function addonQtyNote(addon: ProductAddon): string {
  const units = addon.qty ?? 1;
  if (addonQuantityKind(addon) === "perDoor") return ` — на одні двері (${formatUnits(addon, units)})`;
  if (addonQuantityKind(addon) === "sides") return ` — ${sidesLabel(units / unitsPerSet(addon)).toLowerCase()} (${formatUnits(addon, units)})`;
  return units !== 1 ? ` × ${formatUnits(addon, units)}` : "";
}

/** `choices`: sides or pieces by add-on group; `qty` of the result is priced units. */
export const selectedAddons = (addons: ProductAddon[], selection: Record<string, string>, choices: Record<string, number> = {}) =>
  addons.filter((addon) => selection[addonGroup(addon)] === addon.id)
    .map((addon) => ({ ...addon, qty: addonUnits(addon, choices[addonGroup(addon)]) }));
export const addonLineTotal = (addon: ProductAddon) => Math.round(addon.price * (addon.qty ?? 1) * 100) / 100;
export const addonTotal = (addons: ProductAddon[]) =>
  Math.round(addons.reduce((sum, addon) => sum + addonLineTotal(addon), 0) * 100) / 100;
export const configuredCartId = (slug: string, addons: ProductAddon[]) =>
  addons.length ? `${slug}:addons:${JSON.stringify(addons.map((addon) => `${addon.id}${(addon.qty ?? 1) !== 1 ? `x${addon.qty}` : ""}`).sort())}` : slug;
