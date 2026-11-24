import type { ProductVariation } from "@/types/product";
import { attributeValue, extraFields } from "./variations";

/**
 * Door sizes. Standard sizes come from the supplier file (variations with their own price) or, for doors priced the
 * same in every width, from the "Стандартна ширина/висота полотна" characteristics.
 * A non-standard size is allowed only where the CMS has size rules (product rules override the brand's): the value
 * is rounded up to the rule's step and the price of the nearest standard size gets the rule's surcharge.
 * Width and height surcharges add up. Keep in sync with server-side checkout pricing if one is added.
 */
export type Size = { width: number; height: number };
export type Dimension = keyof Size;

export interface SizeRule {
  dimension: Dimension;
  min: number;
  max: number;
  step: number;
  percent: number;
  /** Only for these decors or colours (comma-separated names); empty = all of them. */
  decors?: string | null;
}

const label = (value: string) => value.trim().toLocaleLowerCase("uk");
/** Which dimensions the variations carry (sized doors: every standard size is its own variation). */
export function sizeKeys(variations: ProductVariation[]): { width: boolean; height: boolean } {
  return { width: variations.some((row) => sizeOf(row).width), height: variations.some((row) => sizeOf(row).height) };
}

export function sizeOf(variation: ProductVariation): Partial<Size> {
  const read = (value?: number | null) => (value != null && Number.isFinite(value) && value > 0 ? value : undefined);
  return { width: read(variation.width), height: read(variation.height) };
}

/** Catalog note shown when this size is chosen (e.g. width 400: made without glass). */
export interface SizeNote {
  dimension: Dimension;
  value: number;
  text: string;
}

export const sizedPrice = (price: number, multiplier: number) => Math.round(price * multiplier);

const sorted = (values: Iterable<number>) => [...new Set(values)].sort((a, b) => a - b);

/**
 * Standard sizes available for the current choice: rows that match the selected variation on every
 * attribute except width/height (decor, colour, glass, side…).
 */
export function standardSizes(variations: ProductVariation[], selected: ProductVariation) {
  const keys = sizeKeys(variations);
  const others = extraFields(variations);
  const same = (row: ProductVariation) =>
    (["decor", "decor_color", "decor_glass"] as const).every((field) => (row[field]?.name ?? "") === (selected[field]?.name ?? "")) &&
    others.every((field) => attributeValue(row, field.key) === attributeValue(selected, field.key));
  const rows = variations.filter(same);
  const current = sizeOf(selected);
  return {
    keys,
    rows,
    widths: sorted(rows.flatMap((row) => sizeOf(row).width ?? [])),
    heights: sorted(rows.filter((row) => current.width === undefined || sizeOf(row).width === current.width)
      .flatMap((row) => sizeOf(row).height ?? [])),
  };
}

/** The variation with this standard size for the current choice (closest height if needed). */
export function variationForSize(variations: ProductVariation[], selected: ProductVariation, size: Partial<Size>) {
  const { rows } = standardSizes(variations, selected);
  const current = sizeOf(selected);
  const want = { width: size.width ?? current.width, height: size.height ?? current.height };
  const exact = rows.find((row) => {
    const s = sizeOf(row);
    return s.width === want.width && s.height === want.height;
  });
  return exact ?? rows.find((row) => sizeOf(row).width === want.width) ?? selected;
}

/** Interior doors without size data in the catalog. */
const DEFAULT_STANDARD: Record<Dimension, number[]> = { width: [600, 700, 800, 900], height: [2000] };

/** Standard sizes from the "Стандартна ширина/висота полотна" characteristics (defaults when missing). */
export function standardFromCharacteristics(characteristics: { name: string; value: string }[]): Record<Dimension, number[]> {
  const read = (prefix: string) => sorted(characteristics
    .filter((item) => label(item.name).startsWith(prefix))
    .flatMap((item) => item.value.match(/\d{3,4}/g)?.map(Number) ?? []));
  const width = read("стандартна ширина");
  const height = read("стандартна висота");
  return { width: width.length ? width : DEFAULT_STANDARD.width, height: height.length ? height : DEFAULT_STANDARD.height };
}

const normalized = (value: string) => value.trim().toLocaleLowerCase("uk").replace(/\s+/g, " ");

/** Rules of one dimension that apply to the chosen decor and colour ("лише в декорах …" lists either). */
export function rulesFor(rules: SizeRule[], dimension: Dimension, decor: string, color: string): SizeRule[] {
  return rules.filter((rule) => {
    if (rule.dimension !== dimension) return false;
    const only = (rule.decors ?? "").split(",").map(normalized).filter(Boolean);
    return !only.length || only.includes(normalized(decor)) || only.includes(normalized(color));
  });
}

const grid = (rule: SizeRule) => {
  const step = Math.max(1, rule.step || 1);
  const values: number[] = [];
  for (let value = rule.min; value < rule.max; value += step) values.push(value);
  return [...values, rule.max];
};

/** Every value a customer may get: standard sizes and each rule's steps. */
export const allowedValues = (standards: number[], rules: SizeRule[]) => sorted([...standards, ...rules.flatMap(grid)]);

/** Rounds up to the next allowed value (the largest one when the value is above every range). */
export function snapSize(value: number, allowed: number[]): number {
  if (!allowed.length) return value;
  return allowed.find((candidate) => candidate >= value) ?? allowed[allowed.length - 1];
}

/**
 * Surcharge in percent for one dimension. A single-value rule (min = max, e.g. width 900: +10%) is a priced option and
 * wins over the standard list; otherwise standard sizes are free and a value on a range's grid takes its surcharge.
 */
export function sizePercent(value: number, standards: number[], rules: SizeRule[]): number {
  const single = rules.find((rule) => rule.min === rule.max && rule.min === value);
  if (single) return Number(single.percent) || 0;
  if (standards.includes(value)) return 0;
  const range = rules.find((rule) => grid(rule).includes(value));
  return Number(range?.percent) || 0;
}

/** The standard value the price is based on: the nearest one (the larger on a tie). */
export function nearestStandard(value: number, standards: number[]): number | undefined {
  return standards.reduce<number | undefined>((best, candidate) =>
    best === undefined || Math.abs(candidate - value) < Math.abs(best - value) ||
      (Math.abs(candidate - value) === Math.abs(best - value) && candidate > best) ? candidate : best, undefined);
}

export function describeRules(standards: number[], rules: SizeRule[]): string {
  const parts = rules.map((rule) => (rule.min === rule.max ? `${rule.min} мм` : `${rule.min}–${rule.max} мм, крок ${rule.step} мм`) +
    (Number(rule.percent) ? `: +${Number(rule.percent)}%` : ": без націнки"));
  return [standards.length ? `стандарт ${standards.join(", ")} мм` : "", ...parts].filter(Boolean).join("; ");
}
