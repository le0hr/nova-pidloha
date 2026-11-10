import { cache } from 'react';
import { graphqlFetch } from '@/lib/client';
import type { Category } from '@/lib/catalog/categories';

export const getCategories = cache(async (): Promise<Category[]> => {
  const categories: Category[] = [];
  let page = 1;
  while (true) {
    const data = await graphqlFetch<{
      categories: Category[];
      categories_connection: { pageInfo: { pageCount: number } };
    }>(`query CatalogCategories($page: Int!) {
      categories(status: PUBLISHED, pagination: {page: $page, pageSize: 100}, sort: ["name:asc", "documentId:asc"]) {
        documentId name slug description image { url } parent { documentId }
      }
      categories_connection(status: PUBLISHED, pagination: {page: $page, pageSize: 100}) { pageInfo { pageCount } }
    }`, { page }, { cache: "no-store" });
    categories.push(...data.categories.filter(c => c.slug && c.name));
    if (page >= data.categories_connection.pageInfo.pageCount) break;
    page += 1;
  }
  const visible = withoutTechnical(categories);
  await addProductCounts(visible);
  return visible;
});

/**
 * Technical branches never shown on the site: moulding sold only together with doors (door add-ons).
 * Their products stay in the CMS for the importer; customers pick them in the door configurator.
 */
const TECHNICAL_ROOTS = new Set(["komplektuiuchi"]);

function withoutTechnical(categories: Category[]): Category[] {
  const byId = new Map(categories.map(category => [category.documentId, category]));
  const hidden = (category: Category): boolean => {
    const seen = new Set<string>();
    for (let item: Category | undefined = category; item && !seen.has(item.documentId); item = item.parent ? byId.get(item.parent.documentId) : undefined) {
      if (TECHNICAL_ROOTS.has(item.slug)) return true;
      seen.add(item.documentId);
    }
    return false;
  };
  return categories.filter(category => !hidden(category));
}

/** Own product counts for ordering subcategories; one aliased query per 40 categories, cached for 5 minutes. */
async function addProductCounts(categories: Category[]): Promise<void> {
  for (let start = 0; start < categories.length; start += 40) {
    const batch = categories.slice(start, start + 40);
    const variables: Record<string, string> = {};
    const fields = batch.map((category, index) => {
      variables[`id${index}`] = category.documentId;
      return `c${index}: products_connection(status: PUBLISHED, filters: {
        category: {documentId: {eq: $id${index}}},
        or: [{active: {eq: true}}, {active: {null: true}}]
      }) { pageInfo { total } }`;
    });
    try {
      const data = await graphqlFetch<Record<string, { pageInfo: { total: number } }>>(`
        query CategoryCounts(${batch.map((_, index) => `$id${index}: ID!`).join(', ')}) {
          ${fields.join('\n')}
        }`, variables, { revalidate: 300 });
      batch.forEach((category, index) => { category.productCount = data[`c${index}`]?.pageInfo.total ?? 0; });
    } catch (error) {
      // Counts only affect ordering; the menu still works alphabetically without them.
      console.error('Unable to count category products:', error instanceof Error ? error.message : error);
    }
  }
}
