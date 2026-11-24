import type { ProductVariation } from "@/types/product";

/** Area of one pack in m²; null when the item is not sold by packs. */
export function packArea(variation: ProductVariation | undefined): number | null {
  const area = Number(variation?.packArea);
  return variation?.packArea != null && Number.isFinite(area) && area > 0 ? area : null;
}

/** Board size label, e.g. "1285×192×8". */
export function boardSize(variation: ProductVariation | undefined): string | undefined {
  return variation?.boardSize?.trim() || undefined;
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
