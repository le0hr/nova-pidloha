import { graphqlFetch, mediaUrl } from '@/lib/client';
import type { CatalogProduct } from '@/types/catalog';
import { isFloorCategory, priceUnit } from '@/lib/catalog/floor';
import { buildProductFilters, pageNumber, type CatalogParams, type FilterGroup } from '@/lib/catalog/state';

type PageInfo = { page: number; pageSize: number; pageCount: number; total: number };
/** Divisible by 2, 3 and 4 so every catalog grid layout ends with a full row. */
export const CATALOG_PAGE_SIZE = 24;
/** Must equal graphql maxLimit in apps/cms/config/plugins.ts: a shorter batch means the last one. */
const VARIATION_PAGE = 100;
type ProductItem = { name: string; slug: string; price: string | number | null; image: { url: string } | null;
  category?: { slug: string | null } | null;
  shortDescription?: string | null;
  isNew?: boolean | null;
  product_variations: { active: boolean | null; price: string | number | null; image: { url: string } | null }[] };

export function catalogProduct(product: ProductItem): CatalogProduct {
  const variations = (product.product_variations ?? []).filter(v => v.active !== false);
  const price = product.price == null ? null : Number(product.price);
  const prices = variations.filter(v => v.price != null).map(v => Number(v.price)).filter(p => Number.isFinite(p) && p >= 0);
  const images = [product.image?.url, ...variations.map(v => v.image?.url)].filter((url): url is string => !!url);
  return { name: product.name, slug: product.slug,
    price: price !== null && Number.isFinite(price) ? price : prices.length ? Math.min(...prices) : 0,
    images: [...new Set(images)].map(mediaUrl), unit: priceUnit(product.category?.slug),
    square: isFloorCategory(product.category?.slug),
    description: product.shortDescription?.trim() || undefined,
    isNew: product.isNew === true };
}

/** CMS sort for the catalog URL `sort`; price uses product.price (= minimum active variation price). */
function catalogSort(sort: CatalogParams[string]): string[] {
  if (sort === 'newest') return ['createdAt:desc', 'documentId:asc'];
  if (sort === 'price_asc') return ['price:asc', 'documentId:asc'];
  if (sort === 'price_desc') return ['price:desc', 'documentId:asc'];
  return ['name:asc', 'documentId:asc'];
}

export async function getProducts(params: CatalogParams, groups: FilterGroup[], categorySlugs: string[]): Promise<{ products: CatalogProduct[]; pagination: PageInfo }> {
  const filters = buildProductFilters(params, groups, categorySlugs);
  const page = pageNumber(params.page);
  const sort = catalogSort(params.sort);
  const data = await graphqlFetch<{ products: ProductItem[]; products_connection: { pageInfo: PageInfo } }>(`
    query GetProducts($filters: ProductFiltersInput, $pagination: PaginationArg, $sort: [String]) {
      products(status: PUBLISHED, filters: $filters, pagination: $pagination, sort: $sort) {
        name slug price shortDescription isNew image { url } category { slug }
        product_variations(filters: {active: {ne: false}}, pagination: {start: 0, limit: 100}, sort: ["documentId:asc"]) { active price image { url } }
      }
      products_connection(status: PUBLISHED, filters: $filters, pagination: $pagination) {
        pageInfo { page pageSize pageCount total }
      }
    }`, { filters, pagination: { page, pageSize: CATALOG_PAGE_SIZE }, sort });
  // Fetch further variation pages only when a page came back full (100); smaller means it was the last one.
  await Promise.all(data.products.map(async (product) => {
    let batch = product.product_variations;
    while (batch.length === VARIATION_PAGE) {
      const next = await graphqlFetch<{ products: Pick<ProductItem, 'product_variations'>[] }>(`
        query CatalogVariations($slug: String!, $start: Int!) {
          products(status: PUBLISHED, filters: {slug: {eq: $slug}}) {
            product_variations(filters: {active: {ne: false}}, pagination: {start: $start, limit: 100}, sort: ["documentId:asc"]) {
              active price image { url }
            }
          }
        }`, { slug: product.slug, start: product.product_variations.length });
      batch = next.products[0]?.product_variations ?? [];
      product.product_variations.push(...batch);
    }
  }));
  return { products: data.products.map(catalogProduct), pagination: data.products_connection.pageInfo };
}

/** Only the number of products matching the filters (filter preview "Знайдено N"). */
export async function countProducts(params: CatalogParams, groups: FilterGroup[], categorySlugs: string[]): Promise<number> {
  const data = await graphqlFetch<{ products_connection: { pageInfo: { total: number } } }>(`
    query CountProducts($filters: ProductFiltersInput) {
      products_connection(status: PUBLISHED, filters: $filters, pagination: {pageSize: 1}) { pageInfo { total } }
    }`, { filters: buildProductFilters(params, groups, categorySlugs) });
  return data.products_connection.pageInfo.total;
}

/** `details: false` skips value popularity and price bounds: enough to apply filters, much cheaper ("Показати ще"). */
export async function getFilters(categorySlugs: string[], productCategorySlugs: string[] = categorySlugs, { details = true }: { details?: boolean } = {}): Promise<FilterGroup[]> {
  const groups: FilterGroup[] = [];
  let page = 1;
  while (true) {
    const data = await graphqlFetch<{ filterGroups: (Omit<FilterGroup, 'type'> & { type: FilterGroup['type'] | 'boolean' })[]; filterGroups_connection: { pageInfo: { pageCount: number } } }>(`
      query CategoryFilters($slugs: [String], $page: Int!) {
        filterGroups(status: PUBLISHED, filters: {categories: {slug: {in: $slugs}}}, pagination: {page: $page, pageSize: 100}) {
          name slug type filter_values(pagination: {limit: 100}) { name slug }
        }
        filterGroups_connection(status: PUBLISHED, filters: {categories: {slug: {in: $slugs}}}, pagination: {page: $page, pageSize: 100}) { pageInfo { pageCount } }
      }`, { slugs: categorySlugs, page }, { cache: "no-store" });
    groups.push(...data.filterGroups.map(group => ({ ...group, type: group.type === "boolean" ? "select" as const : group.type })));
    if (page >= data.filterGroups_connection.pageInfo.pageCount) break;
    page += 1;
  }
  if (!details) return groups;

  // Rank by published, active products in the current category, independently of selected filters.
  const slugs = [...new Set(groups.flatMap(group => group.filter_values.map(value => value.slug)))];
  const counts = new Map<string, number>();
  for (let start = 0; start < slugs.length; start += 40) {
    const batch = slugs.slice(start, start + 40);
    const variables: Record<string, unknown> = { categories: productCategorySlugs };
    const fields = batch.map((slug, index) => {
      variables[`value${index}`] = slug;
      return `value${index}: products_connection(status: PUBLISHED, filters: {
        category: {slug: {in: $categories}},
        or: [{active: {eq: true}}, {active: {null: true}}],
        filter_values: {slug: {eq: $value${index}}}
      }) { pageInfo { total } }`;
    });
    const data = await graphqlFetch<Record<string, { pageInfo: { total: number } }>>(`
      query FilterPopularity($categories: [String], ${batch.map((_, index) => `$value${index}: String!`).join(', ')}) {
        ${fields.join('\n')}
      }`, variables);
    batch.forEach((slug, index) => counts.set(slug, data[`value${index}`].pageInfo.total));
  }
  const priceGroups = groups.filter(group => group.type === 'price');
  if (priceGroups.length) {
    // Cheapest and most expensive product in the category: two single-row queries instead of the whole catalog.
    const filters = { and: [...buildProductFilters({}, [], productCategorySlugs).and, { price: { notNull: true } }] };
    const bounds = await graphqlFetch<{ cheapest: { price: string | number }[]; priciest: { price: string | number }[] }>(`
      query PriceBounds($filters: ProductFiltersInput) {
        cheapest: products(status: PUBLISHED, filters: $filters, sort: ["price:asc"], pagination: {limit: 1}) { price }
        priciest: products(status: PUBLISHED, filters: $filters, sort: ["price:desc"], pagination: {limit: 1}) { price }
      }`, { filters });
    const low = Number(bounds.cheapest[0]?.price), high = Number(bounds.priciest[0]?.price);
    const min = Number.isFinite(low) ? Math.floor(low) : 0;
    const max = Number.isFinite(high) ? Math.ceil(high) : 0;
    for (const group of priceGroups) Object.assign(group, { min, max });
  }
  // Values without products in this category are hidden; a group left empty is dropped (price has no values).
  return groups.map(group => ({
    ...group,
    filter_values: group.filter_values.filter(value => (counts.get(value.slug) ?? 0) > 0)
      .sort((a, b) => (counts.get(b.slug) ?? 0) - (counts.get(a.slug) ?? 0)),
  })).filter(group => group.type === 'price' || group.filter_values.length > 0);
}
