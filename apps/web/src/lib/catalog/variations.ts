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
export function extraFields(variations: ProductVariation[]) {
  return tableFields(variations).filter((field) =>
    !mappedLabels.has(field.display_name.trim().toLocaleLowerCase("uk")));
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
