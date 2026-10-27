import { normalizeHero } from "@/lib/catalog/hero";
import { graphqlFetch } from "@/lib/client";
import type { HomeProduct } from "@/types/home";

type FeaturedProduct = {
  name: string;
  slug: string;
  isFeatured: boolean;
  isNew: boolean;
  product_variations: { price: string | number | null; image: { url: string } | null }[];
};

export async function getHomeProducts(): Promise<HomeProduct[]> {
  try {
    const data = await graphqlFetch<{ products: FeaturedProduct[] }>(`
      query GetHomeProducts {
        products(pagination: { limit: 12 }, sort: ["isFeatured:desc", "createdAt:desc"]) {
          name
          slug
          isFeatured
          isNew
          product_variations {
            price
            image { url }
          }
        }
      }
    `, undefined, { revalidate: 60 });

    return data.products.filter((product) => product.slug && product.name).map((product) => {
      const variations = product.product_variations ?? [];
      const prices = variations.map((variation) => Number(variation.price)).filter((price) => Number.isFinite(price) && price > 0);
      const image = variations.find((variation) => variation.image?.url)?.image?.url;

      return {
        name: product.name,
        href: `/product/${product.slug}`,
        image: image ? new URL(image, process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337").toString() : "/images/home/doors.png",
        price: prices.length ? Math.min(...prices) : null,
        badge: product.isNew ? "Новинка" : product.isFeatured ? "Хіт" : undefined,
      };
    });
  } catch (error) {
    console.error("Unable to load homepage products:", error instanceof Error ? error.message : error);
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
