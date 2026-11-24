/**
 * Server copy of the storefront pricing rules for doors and floor (apps/web/src/lib/catalog/sizing.ts, floor.ts).
 * Keep both in sync: the order total is computed here, the page only shows it.
 *
 * Doors: standard sizes are free; a non-standard size is allowed only on the grid of the CMS size rules
 * (product rules override the brand's; a rule may be limited to decors/colours) and costs the rule's percent;
 * width and height percents add up; a single-value rule (min = max) is a priced option even for a standard value.
 * Floor: price is per m², the cart line is one pack of packArea m².
 */
import { ensure } from './domain';

export type Dimension = 'width' | 'height';
export interface SizeRule { dimension: Dimension; min: number; max: number; step: number; percent: number; decors?: string | null }
export interface ChosenSize { width: number; height: number }

const label = (value: string) => String(value || '').trim().toLocaleLowerCase('uk');
const sorted = (values: number[]) => [...new Set(values)].sort((a, b) => a - b);
const normalized = (value: string) => label(value).replace(/\s+/g, ' ');
const DEFAULT_STANDARD: Record<Dimension, number[]> = { width: [600, 700, 800, 900], height: [2000] };

/** Pack area in m² (variation field packArea); null when the item is not sold by packs. */
export function packArea(variation: any): number | null {
  const area = Number(variation?.packArea);
  return Number.isFinite(area) && area > 0 ? area : null;
}

/** Standard width/height of a sized door variation. */
function variationSize(variation: any): Partial<Record<Dimension, number>> {
  const out: Partial<Record<Dimension, number>> = {};
  for (const dim of ['width', 'height'] as Dimension[]) {
    const value = Number(variation?.[dim]);
    if (variation?.[dim] != null && Number.isFinite(value) && value > 0) out[dim] = value;
  }
  return out;
}

function fromCharacteristics(characteristics: { name: string; value: string }[] = []): Record<Dimension, number[]> {
  const read = (prefix: string) => sorted(characteristics.filter((c) => label(c.name).startsWith(prefix))
    .flatMap((c) => String(c.value).match(/\d{3,4}/g)?.map(Number) ?? []));
  const width = read('стандартна ширина'), height = read('стандартна висота');
  return { width: width.length ? width : DEFAULT_STANDARD.width, height: height.length ? height : DEFAULT_STANDARD.height };
}

function rulesFor(rules: SizeRule[], dimension: Dimension, decor: string, color: string) {
  return rules.filter((rule) => {
    if (rule.dimension !== dimension) return false;
    const only = String(rule.decors ?? '').split(',').map(normalized).filter(Boolean);
    return !only.length || only.includes(normalized(decor)) || only.includes(normalized(color));
  });
}
const grid = (rule: SizeRule) => {
  const step = Math.max(1, Number(rule.step) || 1), values: number[] = [];
  for (let value = Number(rule.min); value < Number(rule.max); value += step) values.push(value);
  return [...values, Number(rule.max)];
};
function percentFor(value: number, standards: number[], rules: SizeRule[]): number | null {
  const single = rules.find((rule) => Number(rule.min) === Number(rule.max) && Number(rule.min) === value);
  if (single) return Number(single.percent) || 0;
  if (standards.includes(value)) return 0;
  const range = rules.find((rule) => grid(rule).includes(value));
  return range ? Number(range.percent) || 0 : null;           // null: not an allowed size
}

/**
 * Surcharge in percent for the chosen door size, or an error when the size is not allowed.
 * `variation` is the standard variation the price is based on (the nearest standard size).
 */
export function sizePercent(product: any, variation: any, size: ChosenSize): number {
  const rules: SizeRule[] = product?.size_rules?.length ? product.size_rules : product?.brand?.size_rules ?? [];
  const own = variationSize(variation);
  const fallback = fromCharacteristics(product?.characteristics);
  let total = 0;
  for (const dimension of ['width', 'height'] as Dimension[]) {
    const value = Number(size?.[dimension]);
    ensure(Number.isInteger(value) && value > 0 && value <= 5000, 'Некоректний розмір');
    // Sized variations: the base row's own value is the standard; otherwise the standard list of the product.
    const standards = own[dimension] !== undefined ? [own[dimension] as number] : fallback[dimension];
    const percent = percentFor(value, standards, rulesFor(rules, dimension, variation?.decor?.name ?? '', variation?.decor_color?.name ?? ''));
    ensure(percent !== null, 'Такий розмір для цього товару недоступний. Оберіть розмір ще раз.');
    total += percent;
  }
  return total;
}
