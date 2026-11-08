import type { ProductVariation } from "@/types/product";

function attribute(variation: ProductVariation | undefined, pattern: RegExp): string | undefined {
  const entry = Object.entries(variation?.catalog_attributes ?? {}).find(([key]) => pattern.test(key));
  const value = entry?.[1];
  return value == null || String(value).trim() === "" ? undefined : String(value).trim();
}

/** Area of one pack in m² from the importer attribute "Площа в пачці, м2"; null when the item is not sold by packs. */
export function packArea(variation: ProductVariation | undefined): number | null {
  const area = Number(attribute(variation, /площа.*пач/i)?.replace(",", "."));
  return Number.isFinite(area) && area > 0 ? area : null;
}

/** Board size label, e.g. "1285×192×8". */
export function boardSize(variation: ProductVariation | undefined): string | undefined {
  return attribute(variation, /розмір.*дошк/i);
}

/** Whole packs needed to cover `m2` (laminate is sold only by full packs). */
export function packsFor(m2: number, area: number): number {
  return Math.max(1, Math.ceil(m2 / area - 1e-9));
}

/** Floor categories (pidloha, pidloha-…): square card photos. */
export function isFloorCategory(categorySlug: string | null | undefined): boolean {
  const slug = categorySlug ?? "";
  return slug === "pidloha" || slug.startsWith("pidloha-");
}

/** Price unit suffix for cards: floor coverings are priced per m², underlay per piece/roll. */
export function priceUnit(categorySlug: string | null | undefined): string | undefined {
  const slug = categorySlug ?? "";
  return slug.startsWith("pidloha-") && slug !== "pidloha-pidlozhka" ? "м²" : undefined;
}

/**
 * Display-only crossed-out price: the current price is 5–30% below it. The percentage is derived from
 * the slug, so it is stable for a product (same on server and client, no hydration mismatch).
 */
export function displayOldPrice(price: number, slug: string): number | null {
  if (!(price > 0)) return null;
  return Math.round(price / (1 - displayDiscount(slug) / 100));
}

/** The display discount in whole percent (5..30), stable for a slug. */
export function displayDiscount(slug: string): number {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return 5 + (hash % 26);
}
