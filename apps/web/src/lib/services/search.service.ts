import { graphqlFetch } from "@/lib/client";
import { categoryAncestors, categoryHref, categoryTotal } from "@/lib/catalog/categories";
import { getCategories } from "@/lib/services/category.service";
import { catalogProduct, CATALOG_PAGE_SIZE } from "@/lib/services/catalog.service";
import type { CatalogProduct } from "@/types/catalog";

type PageInfo = { page: number; pageSize: number; pageCount: number; total: number };
type Item = Omit<Parameters<typeof catalogProduct>[0], "product_variations"> & {
  category?: { slug: string | null; name?: string | null } | null;
  brand?: { name: string | null } | null;
  product_variations: Parameters<typeof catalogProduct>[0]["product_variations"];
};
type Entry = { product: CatalogProduct; category?: string; name: string; text: string };

/** Lower case, unified apostrophes, single spaces: the same for the query and the index. */
const normalize = (value: string) => value.replace(/[’ʼ`]/g, "'").toLowerCase().replace(/\s+/g, " ").trim();

/** Words of the query (2+ letters), at most 6. */
export function searchWords(query: string): string[] {
  return normalize(query).split(/[\s,.;:!?()"«»/]+/).filter(word => word.length >= 2).slice(0, 6);
}

/**
 * Search runs in memory over a compact index of the visible catalog (a few hundred active products; name, brand,
 * category, short description; the first 4 variations only for the card photo and price), rebuilt at most every 5 minutes. Database "contains" filters across brand/category/variation joins took tens of seconds on SQLite
 * and ignore letter case only for Latin there; this is instant and identical on SQLite and PostgreSQL.
 */
let index: { at: number; entries: Promise<Entry[]> } | null = null;
const TTL = 5 * 60 * 1000;

async function buildIndex(): Promise<Entry[]> {
  const categories = await getCategories();
  const visible = new Set(categories.map(category => category.slug));
  // Full category path ("Двері Вхідні Квартирні"), so "вхідні двері" finds products of every subcategory.
  const path = (slug?: string | null) => {
    const category = categories.find(item => item.slug === slug);
    return category ? [...categoryAncestors(categories, category), category].map(item => item.name).join(" ") : "";
  };
  const items: Item[] = [];
  for (let page = 1; ; page += 1) {
    const data = await graphqlFetch<{ products: Item[]; products_connection: { pageInfo: PageInfo } }>(`
      query SearchIndex($page: Int!) {
        products(status: PUBLISHED, pagination: {page: $page, pageSize: 100}, sort: ["name:asc"],
          filters: {or: [{active: {eq: true}}, {active: {null: true}}]}) {
          name slug price shortDescription isNew image { url } category { slug name } brand { name }
          product_variations(filters: {active: {ne: false}}, pagination: {start: 0, limit: 4}) { active price image { url } }
        }
        products_connection(status: PUBLISHED, pagination: {page: $page, pageSize: 100},
          filters: {or: [{active: {eq: true}}, {active: {null: true}}]}) { pageInfo { pageCount } }
      }`, { page }, { revalidate: 300, tags: ["search-index"] });
    items.push(...data.products);
    if (page >= data.products_connection.pageInfo.pageCount) break;
  }
  return items
    .filter(item => item.category?.slug && visible.has(item.category.slug))
    .map(item => ({
      product: catalogProduct(item),
      category: item.category?.name ?? undefined,
      name: normalize(item.name),
      text: normalize([item.name, item.brand?.name, path(item.category?.slug), item.shortDescription].filter(Boolean).join(" ")),
    }));
}

function getIndex(): Promise<Entry[]> {
  if (!index || Date.now() - index.at > TTL) {
    const entries = buildIndex();
    index = { at: Date.now(), entries };
    entries.catch(() => { index = null; }); // a failed build is retried on the next search
  }
  return index.entries;
}

/** Every word must occur; products whose name holds the words (or starts with the first one) come first. */
async function find(query: string): Promise<Entry[]> {
  const words = searchWords(query);
  if (!words.length) return [];
  const entries = await getIndex();
  return entries
    .filter(entry => words.every(word => entry.text.includes(word)))
    .map(entry => ({ entry, score: words.filter(word => entry.name.includes(word)).length * 2 + (entry.name.startsWith(words[0]) ? 1 : 0) }))
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name, "uk"))
    .map(({ entry }) => entry);
}

export async function searchProducts(query: string, page = 1): Promise<{ products: CatalogProduct[]; pagination: PageInfo }> {
  const found = await find(query);
  const pageCount = Math.ceil(found.length / CATALOG_PAGE_SIZE);
  const current = Math.min(Math.max(1, page), Math.max(1, pageCount));
  return {
    products: found.slice((current - 1) * CATALOG_PAGE_SIZE, current * CATALOG_PAGE_SIZE).map(entry => entry.product),
    pagination: { page: current, pageSize: CATALOG_PAGE_SIZE, pageCount, total: found.length },
  };
}

export type Suggestion = {
  categories: { name: string; href: string }[];
  products: { name: string; href: string; image?: string; price: number; unit?: string; category?: string }[];
  total: number;
};

/** Live suggestions under the header search: matching categories and the first products. */
export async function searchSuggestions(query: string): Promise<Suggestion> {
  const words = searchWords(query);
  if (!words.length) return { categories: [], products: [], total: 0 };
  const [categories, found] = await Promise.all([getCategories(), find(query)]);
  return {
    categories: categories
      .filter(category => categoryTotal(categories, category) > 0 && words.every(word =>
        normalize([...categoryAncestors(categories, category), category].map(item => item.name).join(" ")).includes(word)))
      .slice(0, 4)
      .map(category => ({ name: category.name, href: categoryHref(category.slug) })),
    products: found.slice(0, 6).map(({ product, category }) => ({
      name: product.name, href: `/product/${product.slug}`, image: product.images[0], price: product.price, unit: product.unit, category,
    })),
    total: found.length,
  };
}
