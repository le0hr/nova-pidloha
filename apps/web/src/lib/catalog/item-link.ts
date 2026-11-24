import type CartItemType from "@/types/cart";
import { addonQuantityKind, unitsPerSet } from "./addons";

/** Configuration in the product URL: ?v=variation&w=800&h=2000&q=packs&a=addonId*choice (sides or pieces) &line=cart line being edited. */
export type ProductConfig = { variation: string; width?: number; height?: number; packs?: number; addons: { id: string; choice: number }[]; line?: string };
type Query = Record<string, string | string[] | undefined>;

/** Short key of a cart line for the URL (line ids are long). */
export function lineKey(id: string): string {
  let hash = 5381;
  for (let i = 0; i < id.length; i++) hash = (Math.imul(hash, 33) ^ id.charCodeAt(i)) >>> 0;
  return hash.toString(36);
}

/** Link to the product page with the configuration of a cart line; null for carts saved without the product address. */
export function cartItemHref(item: CartItemType, items: CartItemType[]): string | null {
  if (!item.productSlug) return null;
  const path = `/product/${encodeURIComponent(item.productSlug)}`;
  if (!item.variationSlug) return path;
  const query = new URLSearchParams({ v: item.variationSlug });
  // Floor add-ons are cart lines of their own: the link opens the floor together with them.
  const lines = items.filter((line) => line.addonId && line.variationSlug === item.variationSlug);
  const main = item.addonId ? items.find((line) => !line.addonId && line.variationSlug === item.variationSlug) : item;
  if (main?.size) {
    query.set("w", String(main.size.width));
    query.set("h", String(main.size.height));
  }
  if (main && main.qty > 1) query.set("q", String(main.qty));
  for (const addon of main?.addons ?? []) {
    const units = addon.qty ?? 1;
    const kind = addonQuantityKind(addon);
    query.append("a", `${addon.id}*${kind === "sides" ? units / unitsPerSet(addon) : kind === "count" ? units : 1}`);
  }
  for (const line of lines) query.append("a", `${line.addonId}*${line.qty}`);
  if (main) query.set("line", lineKey(main.id));
  return `${path}?${query}`;
}

const first = (value: Query[string]) => (Array.isArray(value) ? value[0] : value);
const whole = (value: Query[string]) => {
  const number = Number(first(value));
  return Number.isInteger(number) && number > 0 && number <= 10000 ? number : undefined;
};

export function parseProductConfig(query: Query): ProductConfig | undefined {
  const variation = first(query.v);
  if (!variation) return undefined;
  return {
    variation, width: whole(query.w), height: whole(query.h), packs: whole(query.q), line: first(query.line),
    addons: [query.a ?? []].flat().slice(0, 30).map((entry) => {
      const at = entry.lastIndexOf("*");
      return { id: at < 0 ? entry : entry.slice(0, at), choice: at < 0 ? 1 : Number(entry.slice(at + 1)) };
    }),
  };
}
