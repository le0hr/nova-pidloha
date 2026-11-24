import { normalizeHero } from "@/lib/catalog/hero";
import { categoryHref, categoryImage, categoryRoot, flatSubcategories, type Category } from "@/lib/catalog/categories";
import { getCategories } from "@/lib/services/category.service";
import { priceUnit } from "@/lib/catalog/floor";
import { graphqlFetch, mediaUrl } from "@/lib/client";
import { clip } from "@/lib/seo";
import type { HomeCategory, HomeProduct } from "@/types/home";

type FeaturedProduct = {
  name: string;
  slug: string;
  shortDescription: string | null;
  price: string | number | null;
  image: Media | null;
  category: { name: string | null; slug: string | null } | null;
  isNew: boolean;
  isPromo: boolean | null;
  isSale: boolean | null;
  product_variations: { price: string | number | null; image: Media | null }[];
};
type Media = { url: string; width: number | null; height: number | null };

/** Grouped by category (doors: their subcategory, e.g. «Каркасно-щитові»). */
function productGroup(product: FeaturedProduct): string {
  return product.category?.name?.trim() || "Інше";
}

function cardCaption(description: string | null | undefined): string {
  const first = plainText(String(description ?? "").split(/\n\s*\n/)[0]) ?? "";
  return clip(first.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? first, 90);
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
            name slug shortDescription price isNew isPromo isSale image { url width height } category { name slug }
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
        unit: priceUnit(product.category?.slug),
        group: productGroup(product),
        description: product.shortDescription?.trim() || undefined,
        badge: product.isNew ? "Новинка" : product.isPromo ? "Акція" : product.isSale ? "Розпродаж" : "Рекомендуємо",
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
 * Categories grouped by class: a featured class shows all of its subcategories as one flat list
 * (largest first, no nesting), a featured subcategory is shown inside its class.
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
    const byId = new Map(valid.map(category => [category.documentId, category]));
    const tree = await getCategories(); // same categories with product counts, for ordering
    const selected = new Map<string, Item>();
    for (const category of valid.filter(item => item.isFeatured)) {
      const node = tree.find(item => item.documentId === category.documentId);
      if (!node) continue; // technical branch, not shown on the site
      const subcategories = node ? flatSubcategories(tree, node).map(item => byId.get(item.documentId)).filter((item): item is Item => !!item) : [];
      for (const item of subcategories.length ? subcategories : [category]) selected.set(item.documentId, item);
    }
    return [...selected.values()].map(category => {
      const node = tree.find(item => item.documentId === category.documentId);
      const root = node ? categoryRoot(tree, node) : null;
      const className = root && root.documentId !== category.documentId ? byId.get(root.documentId)?.name ?? root.name : undefined;
      return {
        name: category.name,
        href: categoryHref(category.slug),
        image: categoryImage(category, valid),
        parentName: className,
        // The card shows a caption: the first sentence of the category text (the full text is on the category page).
        description: cardCaption(category.description),
        group: className ?? category.name,
      };
    });
  } catch (error) {
    console.error("Unable to load homepage categories:", error instanceof Error ? error.message : error);
    return [];
  }
}

/** Promo ticker from CMS Global; null when switched off or not filled in (or the CMS is older than the field). */
export async function getPromoTicker(): Promise<import("@/components/home/Promotion").PromoTicker | null> {
  try {
    const data = await graphqlFetch<{ global: { promoTicker: ({ enabled?: boolean | null } & Record<string, string | boolean | null | undefined>) | null } | null }>(`
      query PromoTicker { global(status: PUBLISHED) { promoTicker { enabled label highlight text note url } } }`, undefined, { revalidate: 60 });
    const promo = data.global?.promoTicker;
    if (!promo?.enabled) return null;
    const value = (key: string) => (typeof promo[key] === "string" ? (promo[key] as string).trim() : "") || undefined;
    return { label: value("label"), highlight: value("highlight"), text: value("text"), note: value("note"), url: value("url") };
  } catch {
    return null;
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
    `, undefined, { revalidate: 60 });
    return normalizeHero(data.global);
  } catch (error) {
    console.error("Unable to load homepage hero:", error instanceof Error ? error.message : error);
    return normalizeHero(null);
  }
}
