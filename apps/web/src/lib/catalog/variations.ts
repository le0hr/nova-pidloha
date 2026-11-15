import type { ProductVariation } from "@/types/product";

export function tableFields(variations: ProductVariation[]) {
  const fields = new Map<string, { key: string; display_name: string }>();
  for (const variation of variations) {
    for (const field of variation.attribute_definitions ?? []) fields.set(field.key, field);
    for (const key of Object.keys(variation.catalog_attributes ?? {})) {
      if (!fields.has(key)) fields.set(key, { key, display_name: key });
    }
  }
  return [...fields.values()];
}

export const attributeValue = (variation: ProductVariation, key: string) =>
  String(variation.catalog_attributes?.[key] ?? "").trim();

// Preserve earlier choices and reset later choices to an actual workbook row.
export function compatibleRows(
  variations: ProductVariation[], selected: ProductVariation, key: string,
) {
  const fields = tableFields(variations);
  const earlier = fields.slice(0, fields.findIndex((field) => field.key === key));
  return variations.filter((variation) => earlier.every((field) =>
    attributeValue(variation, field.key) === attributeValue(selected, field.key)));
}

const mappedLabels = new Set([
  "тип покриття", "декор", "decor", "покриття", "колір", "color", "скло", "glass",
]);
// Width/height are chosen in the "Розмір" step (see sizing.ts), not in the attribute table.
const isSizeLabel = (label: string) => /^(ширина|висота)/.test(label);
export function extraFields(variations: ProductVariation[]) {
  return tableFields(variations).filter((field) => {
    const label = field.display_name.trim().toLocaleLowerCase("uk");
    return !mappedLabels.has(label) && !isSizeLabel(label);
  });
}
export function sameDecor(left: ProductVariation, right: ProductVariation) {
  return ["decor", "decor_color", "decor_glass"].every((key) => {
    const field = key as "decor" | "decor_color" | "decor_glass";
    return (left[field]?.name ?? "") === (right[field]?.name ?? "");
  });
}
export function extraRows(variations: ProductVariation[], selected: ProductVariation, key: string) {
  const fields = extraFields(variations);
  const earlier = fields.slice(0, fields.findIndex((field) => field.key === key));
  return variations.filter((row) => sameDecor(row, selected) && earlier.every((field) =>
    attributeValue(row, field.key) === attributeValue(selected, field.key)));
}

export function visibleExtraFields(variations: ProductVariation[], selected: ProductVariation) {
  return extraFields(variations).filter((field) =>
    extraRows(variations, selected, field.key).some((row) => attributeValue(row, field.key) !== ""));
}
export function attributeLabel(label: string) {
  return label.replace(/\s*\((?:extra variable|додаткова змінна|додаткова варіація|або назва додаткового параметру)\)/gi, "").trim();
}

// Attributes that are not visible on the photo: edge, size, opening side, lock preparation.
const INVISIBLE = /^(кромка|ширина|висота|сторона|підготовка під замок)/;

/** One look = decor + colour + glass + visible extra attributes (e.g. construction); never the edge or size. */
export function lookKey(variation: ProductVariation) {
  const visible = (variation.attribute_definitions ?? [])
    .filter((field) => !mappedLabels.has(field.display_name.trim().toLocaleLowerCase("uk")) &&
      !INVISIBLE.test(field.display_name.trim().toLocaleLowerCase("uk")))
    .map((field) => [field.key, attributeValue(variation, field.key)]);
  return JSON.stringify([variation.decor?.name ?? "", variation.decor_color?.name ?? "", variation.decor_glass?.name ?? "", visible]);
}

/** The one photo of a look: the most used photo among its variations, so choosing another edge never changes it. */
export function lookImage(variations: ProductVariation[], variation: ProductVariation): string {
  const counts = new Map<string, number>();
  for (const row of variations) {
    if (row.image && lookKey(row) === lookKey(variation)) counts.set(row.image, (counts.get(row.image) ?? 0) + 1);
  }
  let best = "";
  for (const [image, count] of counts) if (!best || count > (counts.get(best) ?? 0)) best = image;
  return best;
}

/**
 * Gallery: one entry per look (not per edge/width/side), each with its look photo.
 * `select` maps a gallery entry back to a variation of that look that keeps the current extra choices.
 */
export function galleryLooks(variations: ProductVariation[], selected: ProductVariation) {
  const extras = extraFields(variations);
  const byLook = new Map<string, ProductVariation[]>();
  for (const row of variations) byLook.set(lookKey(row), [...(byLook.get(lookKey(row)) ?? []), row]);
  const items = [...byLook.values()].map((rows) => ({ ...rows[0], image: lookImage(variations, rows[0]) }));
  const activeIndex = Math.max(0, items.findIndex((item) => lookKey(item) === lookKey(selected)));
  const select = (item: ProductVariation) => {
    const rows = byLook.get(lookKey(item)) ?? [item];
    const same = (row: ProductVariation, keys: string[]) => keys.every((key) => attributeValue(row, key) === attributeValue(selected, key));
    const keys = [...new Set([...extras.map((field) => field.key), ...tableFields(variations).map((field) => field.key)])]
      .filter((key) => !["тип_покриття", "покриття", "glass", "декор", "колір", "скло"].includes(key));
    return rows.find((row) => same(row, keys)) ?? rows.find((row) => same(row, extras.map((field) => field.key))) ?? rows[0];
  };
  return { items, activeIndex, select };
}
