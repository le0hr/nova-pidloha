/** Query inputs for category product listings. */
export type FilterGroup = {
  name: string;
  slug: string;
  type: 'select' | 'color' | 'price';
  filter_values: { name: string; slug: string; hex?: string }[];
  min?: number;
  max?: number;
};
export type CatalogParams = Record<string, string | string[] | undefined>;
export function pageNumber(value: string | string[] | null | undefined): number {
  const number = Number(Array.isArray(value) ? value[0] : value);
  return Number.isSafeInteger(number) && number > 0 ? number : 1;
}
function numberValue(value: string | null | undefined): number | undefined {
  if (value == null || value.trim() === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}
export function buildProductFilters(params: CatalogParams, groups: FilterGroup[], categorySlugs: string[]) {
  const and: Record<string, unknown>[] = [
    { category: { slug: { in: categorySlugs } } },
    { or: [{ active: { eq: true } }, { active: { null: true } }] },
  ];
  for (const group of groups) {
    if (group.type === 'price') continue;
    const raw = params[group.slug];
    const allowed = new Set(group.filter_values.map(v => v.slug));
    const values = (Array.isArray(raw) ? raw : [raw ?? '']).flatMap(v => v.split(',')).filter(v => allowed.has(v));
    if (values.length) and.push({ filter_values: { slug: { in: values }, filter_group: { slug: { eq: group.slug } } } });
  }
  const first = (value: CatalogParams[string]) => Array.isArray(value) ? value[0] : value;
  const min = numberValue(first(params.price_min));
  const max = numberValue(first(params.price_max));
  if (min !== undefined || max !== undefined) {
    and.push({ price: { ...(min !== undefined ? { gte: max === undefined ? min : Math.min(min, max) } : {}), ...(max !== undefined ? { lte: min === undefined ? max : Math.max(min, max) } : {}) } });
  }
  return { and };
}
