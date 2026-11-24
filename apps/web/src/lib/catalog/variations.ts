import type { ProductVariation } from "@/types/product";

export type OptionField = { key: string; display_name: string };

type Named = { name: string } | null | undefined;
/** Step order on the page; other options follow in the order the variations list them. */
const STEPS = ["Конструкція", "Кромка", "Сторона відкривання"];

/** Door parameters and the rare options of a CMS variation as one list of selection steps. */
export function stepOptions({ construction, edge, opening_side, options }: { construction?: Named; edge?: Named; opening_side?: Named;
  options?: ProductVariation["options"] }): NonNullable<ProductVariation["options"]> {
  const fields = [
    { name: STEPS[0], value: construction?.name ?? "", changesLook: false },
    { name: STEPS[1], value: edge?.name ?? "", changesLook: false },
    { name: STEPS[2], value: opening_side?.name ?? "", changesLook: false },
  ].filter((step) => step.value);
  return [...fields, ...(options ?? []).filter((option) => !fields.some((step) => step.name === option.name))];
}

/** Selection steps of the product. */
export function extraFields(variations: ProductVariation[]): OptionField[] {
  const names: string[] = [];
  for (const variation of variations) {
    for (const option of variation.options ?? []) if (!names.includes(option.name)) names.push(option.name);
  }
  const rank = (name: string) => (STEPS.includes(name) ? STEPS.indexOf(name) : STEPS.length);
  return names.sort((a, b) => rank(a) - rank(b)).map((name) => ({ key: name, display_name: name }));
}

export const attributeValue = (variation: ProductVariation, key: string) =>
  (variation.options ?? []).find((option) => option.name === key)?.value.trim() ?? "";

/** Button of the variations without a value, shown next to the ones that have it. */
export const NO_VALUE = "Не вказано";

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

/** One look = decor + colour + glass + rare options marked as seen on the photo; never the construction, edge, side or size. */
export function lookKey(variation: ProductVariation) {
  const visible = (variation.options ?? []).filter((option) => option.changesLook).map((option) => [option.name, option.value]);
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
    const keys = extras.map((field) => field.key);
    const same = (row: ProductVariation) => keys.every((key) => attributeValue(row, key) === attributeValue(selected, key));
    return rows.find((row) => same(row) && row.width === selected.width && row.height === selected.height) ?? rows.find(same) ?? rows[0];
  };
  return { items, activeIndex, select };
}
