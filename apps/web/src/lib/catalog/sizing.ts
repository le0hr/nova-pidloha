import type { ProductVariation } from "@/types/product";
import { attributeValue, tableFields } from "./variations";

/**
 * Door sizes that come from the supplier file are variations with their own price.
 * Any other (non-standard) size costs the chosen standard variation plus a one-off surcharge:
 * +15% for a different width, +20% for a different height (both: +15% and +20%).
 * Keep in sync with server-side checkout pricing.
 */
export const SIZE_SURCHARGE = { width: 0.15, height: 0.2 } as const;

export type Size = { width: number; height: number };

const label = (value: string) => value.trim().toLocaleLowerCase("uk");
export const isWidthLabel = (value: string) => label(value).startsWith("ширина");
export const isHeightLabel = (value: string) => label(value).startsWith("висота");

/** Attribute keys holding width/height in variation catalog_attributes, if the product has them. */
export function sizeKeys(variations: ProductVariation[]): { width?: string; height?: string } {
  const fields = tableFields(variations);
  return {
    width: fields.find((field) => isWidthLabel(field.display_name))?.key,
    height: fields.find((field) => isHeightLabel(field.display_name))?.key,
  };
}

export function sizeOf(variation: ProductVariation, keys: { width?: string; height?: string }): Partial<Size> {
  const read = (key?: string) => {
    const value = key ? Number(attributeValue(variation, key)) : NaN;
    return Number.isFinite(value) && value > 0 ? value : undefined;
  };
  return { width: read(keys.width), height: read(keys.height) };
}

/** Price multiplier for a custom size compared with the standard variation it is based on. */
export function sizeSurcharge(standard: Partial<Size>, chosen: Size): number {
  let multiplier = 1;
  if (standard.width !== undefined && chosen.width !== standard.width) multiplier *= 1 + SIZE_SURCHARGE.width;
  if (standard.height !== undefined && chosen.height !== standard.height) multiplier *= 1 + SIZE_SURCHARGE.height;
  return multiplier;
}

export const sizedPrice = (price: number, multiplier: number) => Math.round(price * multiplier);

const sorted = (values: Iterable<number>) => [...new Set(values)].sort((a, b) => a - b);

/**
 * Standard sizes available for the current choice: rows that match the selected variation on every
 * attribute except width/height (decor, colour, glass, side…).
 */
export function standardSizes(variations: ProductVariation[], selected: ProductVariation) {
  const keys = sizeKeys(variations);
  const others = tableFields(variations).filter((field) => field.key !== keys.width && field.key !== keys.height);
  const same = (row: ProductVariation) =>
    (["decor", "decor_color", "decor_glass"] as const).every((field) => (row[field]?.name ?? "") === (selected[field]?.name ?? "")) &&
    others.every((field) => attributeValue(row, field.key) === attributeValue(selected, field.key));
  const rows = variations.filter(same);
  const current = sizeOf(selected, keys);
  return {
    keys,
    rows,
    widths: sorted(rows.flatMap((row) => sizeOf(row, keys).width ?? [])),
    heights: sorted(rows.filter((row) => current.width === undefined || sizeOf(row, keys).width === current.width)
      .flatMap((row) => sizeOf(row, keys).height ?? [])),
  };
}

/** The variation with this standard size for the current choice (closest height if needed). */
export function variationForSize(variations: ProductVariation[], selected: ProductVariation, size: Partial<Size>) {
  const { rows, keys } = standardSizes(variations, selected);
  const current = sizeOf(selected, keys);
  const want = { width: size.width ?? current.width, height: size.height ?? current.height };
  const exact = rows.find((row) => {
    const s = sizeOf(row, keys);
    return s.width === want.width && s.height === want.height;
  });
  return exact ?? rows.find((row) => sizeOf(row, keys).width === want.width) ?? selected;
}
