import { normalizeHero } from "@/lib/catalog/hero";
import { categoryHref, categoryImage, type Category } from "@/lib/catalog/categories";
import { graphqlFetch, mediaUrl } from "@/lib/client";
import type { HomeCategory, HomeProduct } from "@/types/home";

type FeaturedProduct = {
  name: string;
  slug: string;
  shortDescription: string | null;
  price: string | number | null;
  image: Media | null;
  category: { name: string | null } | null;
  catalog_attributes: Record<string, unknown> | null;
  isNew: boolean;
  product_variations: { price: string | number | null; image: Media | null }[];
};
type Media = { url: string; width: number | null; height: number | null };

/** Doors are grouped by their subclass; products without one (e.g. floors) by their category. */
function productGroup(product: FeaturedProduct): string {
  const subclass = product.catalog_attributes?.["підклас"];
  if (typeof subclass === "string" && subclass.trim()) return subclass.trim();
  return product.category?.name?.trim() || "Інше";
}

export async function getHomeProducts(): Promise<HomeProduct[]> {
  try {
    const products: FeaturedProduct[] = [];
    let page = 1;
    while (true) {
      const data = await graphqlFetch<{
        products: FeaturedProduct[];
        products_connection: { pageInfo: { pageCount: number } };
      }>(`
        query GetHomeProducts($page: Int!) {
          products(status: PUBLISHED, filters: {isFeatured: {eq: true}, active: {ne: false}},
            pagination: {page: $page, pageSize: 100}, sort: ["name:asc", "documentId:asc"]) {
            name slug shortDescription price isNew catalog_attributes image { url width height } category { name }
            # Media fields are not filterable and variation price is a string, so pick price/image in JS.
            product_variations(filters: {active: {ne: false}}, pagination: {limit: 50}, sort: ["documentId:asc"]) {
              price image { url width height }
            }
          }
          products_connection(status: PUBLISHED, filters: {isFeatured: {eq: true}, active: {ne: false}}, pagination: {page: $page, pageSize: 100}) {
            pageInfo { pageCount }
          }
        }
      `, { page }, { revalidate: 60 });
      products.push(...data.products);
      if (page >= data.products_connection.pageInfo.pageCount) break;
      page += 1;
    }
    return products.filter(product => product.slug && product.name).map(product => {
      const variations = product.product_variations ?? [];
      const variationPrices = variations
        .filter(variation => variation.price != null && variation.price !== "")
        .map(variation => Number(variation.price))
        .filter(value => Number.isFinite(value) && value >= 0);
      const price = product.price != null ? Number(product.price) : variationPrices.length ? Math.min(...variationPrices) : null;
      const image = product.image?.url ? product.image : variations.find(variation => variation.image?.url)?.image;
      return {
        name: product.name,
        href: `/product/${encodeURIComponent(product.slug)}`,
        image: image ? mediaUrl(image.url) : null,
        imagePortrait: !!image?.width && !!image.height && image.height / image.width > 1.15,
        price: price !== null && Number.isFinite(price) && price >= 0 ? price : null,
        group: productGroup(product),
        description: product.shortDescription?.trim() || undefined,
        badge: product.isNew ? "Новинка" : "Рекомендуємо",
      };
    });
  } catch (error) {
    console.error("Unable to load homepage products:", error instanceof Error ? error.message : error);
    return [];
  }
}

/** Richtext (markdown) description to a short plain line for the card. */
function plainText(markdown: string | null): string | undefined {
  const text = (markdown ?? "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s*(?:[-+]|\d+\.)\s+/gm, "")
    .replace(/[#>*_`~|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text || undefined;
}

/**
 * Categories grouped by class: a featured class shows all of its subclasses,
 * a featured subclass is shown inside its class.
 */
export async function getHomeCategories(): Promise<HomeCategory[]> {
  try {
    type Item = Category & { description: string | null; isFeatured: boolean | null; parent: { documentId: string; name: string } | null };
    const categories: Item[] = [];
    let page = 1;
    while (true) {
      const data = await graphqlFetch<{ categories: Item[]; categories_connection: { pageInfo: { pageCount: number } } }>(`
        query GetHomeCategories($page: Int!) {
          categories(status: PUBLISHED, pagination: {page: $page, pageSize: 100}, sort: ["name:asc", "documentId:asc"]) {
            documentId name slug description isFeatured image { url } parent { documentId name }
          }
          categories_connection(status: PUBLISHED, pagination: {page: $page, pageSize: 100}) { pageInfo { pageCount } }
        }
      `, { page }, { revalidate: 60 });
      categories.push(...data.categories);
      if (page >= data.categories_connection.pageInfo.pageCount) break;
      page += 1;
    }
    const valid = categories.filter(category => category.name && category.slug);
    const selected = new Map<string, Item>();
    for (const category of valid.filter(item => item.isFeatured)) {
      const subclasses = valid.filter(item => item.parent?.documentId === category.documentId);
      for (const item of subclasses.length ? subclasses : [category]) selected.set(item.documentId, item);
    }
    return [...selected.values()].map(category => ({
      name: category.name,
      href: categoryHref(category.slug),
      image: categoryImage(category, valid),
      parentName: category.parent?.name,
      description: plainText(category.description),
      group: category.parent?.name ?? category.name,
    }));
  } catch (error) {
    console.error("Unable to load homepage categories:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getHomeHero(): Promise<import("@/types/home").HeroSlide[]> {
  try {
    const data = await graphqlFetch<{ global: import("@/lib/catalog/hero").HeroSettings | null }>(`
      query GetHomeHero {
        global {
          heroEnabled
          heroSlides {
            enabled kind title eyebrow description mobileDescription body badge alignment
            mobileImage { url }
            image { url }
            imageAlt buttonLabel buttonUrl secondaryButtonLabel secondaryButtonUrl
            mapEmbedUrl mapTitle
          }
        }
      }
    `, undefined, { cache: "no-store" });
    return normalizeHero(data.global);
  } catch (error) {
    console.error("Unable to load homepage hero:", error instanceof Error ? error.message : error);
    return normalizeHero(null);
  }
}
