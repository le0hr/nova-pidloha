import { graphqlFetch, mediaUrl } from '@/lib/client';
import type { CatalogProduct } from '@/types/catalog';
import { buildProductFilters, pageNumber, type CatalogParams, type FilterGroup } from '@/lib/catalog/state';

type PageInfo = { page: number; pageSize: number; pageCount: number; total: number };
type ProductItem = { name: string; slug: string; price: string | number | null; image: { url: string } | null;
  product_variations: { active: boolean | null; price: string | number | null; image: { url: string } | null }[] };

export function catalogProduct(product: ProductItem): CatalogProduct {
  const variations = (product.product_variations ?? []).filter(v => v.active !== false);
  const price = product.price == null ? null : Number(product.price);
  const prices = variations.filter(v => v.price != null).map(v => Number(v.price)).filter(p => Number.isFinite(p) && p >= 0);
  const images = [product.image?.url, ...variations.map(v => v.image?.url)].filter((url): url is string => !!url);
  return { name: product.name, slug: product.slug,
    price: price !== null && Number.isFinite(price) ? price : prices.length ? Math.min(...prices) : 0,
    images: [...new Set(images)].map(mediaUrl) };
}

export async function getProducts(params: CatalogParams, groups: FilterGroup[], categorySlugs: string[], collectAll = false): Promise<{ products: CatalogProduct[]; pagination: PageInfo }> {
  const priceGroups = groups.filter(group => group.type === 'price');
  const bounds = priceGroups.length ? priceGroups : [{ slug: 'price' }];
  const readNumber = (value: CatalogParams[string]) => {
    const raw = Array.isArray(value) ? value[0] : value;
    if (raw == null || raw.trim() === '') return undefined;
    const number = Number(raw);
    return Number.isFinite(number) && number >= 0 ? number : undefined;
  };
  const ranges = bounds.map(group => [readNumber(params[`${group.slug}_min`]), readNumber(params[`${group.slug}_max`])]);
  const priceSort = params.sort === 'price_asc' || params.sort === 'price_desc';
  if (collectAll || priceSort || ranges.some(range => range.some(value => value !== undefined))) {
    // Compare the same effective price shown on cards, including variant-only products,
    // before pagination. CMS sorting cannot coalesce product and variation prices.
    const clean = { ...params };
    for (const group of bounds) {
      delete clean[`${group.slug}_min`];
      delete clean[`${group.slug}_max`];
    }
    delete clean.price_min;
    delete clean.price_max;
    if (priceSort) delete clean.sort;
    const products: CatalogProduct[] = [];
    let page = 1;
    let pageCount = 1;
    do {
      const result = await getProducts({ ...clean, page: String(page) }, groups, categorySlugs);
      products.push(...result.products);
      pageCount = result.pagination.pageCount;
      page += 1;
    } while (page <= pageCount);
    const filtered = products.filter(product => ranges.every(([min, max]) => {
      const lower = min !== undefined && max !== undefined ? Math.min(min, max) : min;
      const upper = min !== undefined && max !== undefined ? Math.max(min, max) : max;
      return (lower === undefined || product.price >= lower) && (upper === undefined || product.price <= upper);
    }));
    if (priceSort) filtered.sort((a, b) => params.sort === 'price_desc' ? b.price - a.price : a.price - b.price);
    const currentPage = pageNumber(params.page);
    return { products: collectAll ? filtered : filtered.slice((currentPage - 1) * 20, currentPage * 20),
      pagination: { page: currentPage, pageSize: 20, pageCount: Math.ceil(filtered.length / 20), total: filtered.length } };
  }
  const filters = buildProductFilters(params, groups, categorySlugs);
  const page = pageNumber(params.page);
  const sort = params.sort === "newest" ? ["createdAt:desc", "documentId:asc"] : ["name:asc", "documentId:asc"];
  const data = await graphqlFetch<{ products: ProductItem[]; products_connection: { pageInfo: PageInfo } }>(`
    query GetProducts($filters: ProductFiltersInput, $pagination: PaginationArg, $sort: [String]) {
      products(status: PUBLISHED, filters: $filters, pagination: $pagination, sort: $sort) {
        name slug price image { url }
        product_variations(filters: {active: {ne: false}}, pagination: {start: 0, limit: 100}, sort: ["documentId:asc"]) { active price image { url } }
      }
      products_connection(status: PUBLISHED, filters: $filters, pagination: $pagination) {
        pageInfo { page pageSize pageCount total }
      }
    }`, { filters, pagination: { page, pageSize: 20 }, sort });
  await Promise.all(data.products.map(async (product) => {
    let batch = product.product_variations;
    while (batch.length > 0) {
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

export async function getFilters(categorySlugs: string[], productCategorySlugs: string[] = categorySlugs): Promise<FilterGroup[]> {
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
    const { products } = await getProducts({}, [], productCategorySlugs, true);
    const prices = products.map(product => product.price);
    const min = prices.length ? Math.floor(prices.reduce((min, price) => Math.min(min, price), Infinity)) : 0;
    const max = prices.length ? Math.ceil(prices.reduce((max, price) => Math.max(max, price), 0)) : 0;
    for (const group of priceGroups) Object.assign(group, { min, max });
  }
  return groups.map(group => ({
    ...group,
    filter_values: [...group.filter_values].sort((a, b) => (counts.get(b.slug) ?? 0) - (counts.get(a.slug) ?? 0)),
  }));
}
