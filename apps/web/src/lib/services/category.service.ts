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
    if (page >= data.categories_connection.pageInfo.pageCount) return categories;
    page += 1;
  }
});
