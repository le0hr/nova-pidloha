import type { ProductAddon } from "@/types/product";

export type RawAddon = {
  documentId: string;
  name: string;
  group?: string | null;
  price?: number | string | null;
  additionalCost?: number | string | null;
};
export function normalizeAddon(addon: RawAddon): ProductAddon {
  // A surcharge is authoritative; standalone add-on price is the fallback.
  const price = Number(addon.additionalCost ?? addon.price ?? 0);
  if (!Number.isFinite(price)) throw new Error(`Invalid add-on price: ${addon.documentId}`);
  return { id: addon.documentId, name: addon.name, group: addon.group?.trim() || null, price };
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
export const selectedAddons = (addons: ProductAddon[], selection: Record<string, string>) =>
  addons.filter((addon) => selection[addonGroup(addon)] === addon.id);
export const addonTotal = (addons: ProductAddon[]) =>
  addons.reduce((sum, addon) => sum + addon.price, 0);
export const configuredCartId = (slug: string, addons: ProductAddon[]) =>
  addons.length ? `${slug}:addons:${JSON.stringify(addons.map((addon) => addon.id).sort())}` : slug;
