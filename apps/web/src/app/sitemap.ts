import type { MetadataRoute } from "next";
import { graphqlFetch } from "@/lib/client";
import { categoryHref, categoryScope } from "@/lib/catalog/categories";
import { getCategories } from "@/lib/services/category.service";
import { absoluteUrl, mediaUrlOrUndefined } from "@/lib/seo";

// Built from the live CMS on request (the image build has no CMS); CMS responses are cached for an hour.
export const dynamic = "force-dynamic";

type SitemapProduct = { slug: string | null; updatedAt: string | null; category: { slug: string | null } | null; image: { url: string } | null };

/** Every published, active product with at least one active variation (others answer 404). */
async function products(): Promise<SitemapProduct[]> {
  const rows: SitemapProduct[] = [];
  for (let page = 1; ; page += 1) {
    const data = await graphqlFetch<{ products: SitemapProduct[]; products_connection: { pageInfo: { pageCount: number } } }>(`
      query SitemapProducts($page: Int!) {
        products(status: PUBLISHED, pagination: {page: $page, pageSize: 100}, sort: ["documentId:asc"],
          filters: {or: [{active: {eq: true}}, {active: {null: true}}], product_variations: {active: {ne: false}}}) {
          slug updatedAt category { slug } image { url }
        }
        products_connection(status: PUBLISHED, pagination: {page: $page, pageSize: 100},
          filters: {or: [{active: {eq: true}}, {active: {null: true}}], product_variations: {active: {ne: false}}}) {
          pageInfo { pageCount }
        }
      }`, { page }, { revalidate: 3600, tags: ["sitemap"] });
    rows.push(...data.products);
    if (page >= data.products_connection.pageInfo.pageCount) return rows;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, items] = await Promise.all([getCategories(), products()]);
  const visible = new Set(categories.map(category => category.slug));
  // A category is listed when it or one of its subcategories has products (empty pages are thin content).
  const listed = categories.filter(category =>
    categoryScope(categories, category).some(item => (item.productCount ?? 1) > 0));
  return [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/catalog"), changeFrequency: "weekly", priority: 0.9 },
    ...listed.map(category => ({
      url: absoluteUrl(categoryHref(category.slug)),
      changeFrequency: "daily" as const,
      priority: category.parent ? 0.7 : 0.8,
    })),
    ...items
      .filter(item => item.slug && item.category?.slug && visible.has(item.category.slug))
      .map(item => {
        const image = mediaUrlOrUndefined(item.image?.url);
        return {
          url: absoluteUrl(`/product/${encodeURIComponent(item.slug!)}`),
          ...(item.updatedAt ? { lastModified: new Date(item.updatedAt) } : {}),
          changeFrequency: "weekly" as const,
          priority: 0.6,
          ...(image ? { images: [image] } : {}),
        };
      }),
  ];
}
