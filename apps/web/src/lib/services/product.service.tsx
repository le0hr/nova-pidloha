import { cache } from 'react';
import { plainText } from '@/lib/seo';

const plainParagraphs = (markdown?: string | null) =>
  String(markdown ?? '').split(/\n\s*\n/).map(plainText).filter(Boolean).join('\n\n');
import { normalizeAddon, type RawAddon } from '@/lib/catalog/addons';
import { graphqlFetch } from '@/lib/client';
import type { ProductReturnData, ProductVariation } from '@/types/product';
import type { SizeNote, SizeRule } from '@/lib/catalog/sizing';

const PRODUCT_QUERY = `
  query GetProduct($slug: String!, $variationStart: Int!, $addonStart: Int!) {
    products(
      filters: {
        slug: {
          eq: $slug
        }
      }
    ) {
      addons {
        documentId
        name
        group
        price
        additionalCost
      }
      shortDescription
      description
      updatedAt
      image { url }
      characteristics {
        name
        value
        unit
      }
      name
      size_rules { dimension min max step percent decors }
      size_notes { dimension value text }
      brand {
        name
        size_rules { dimension min max step percent decors }
      }
      category{
        name
        slug
        }
      product_variations(pagination: {start: $variationStart, limit: 100}, sort: ["documentId:asc"]) {
        addons(pagination: {start: $addonStart, limit: 100}, sort: ["documentId:asc"]) {
          documentId
          name
          group
          price
          additionalCost
        }
        active
        catalog_attributes
        attribute_definitions
        decor {
          name
        }
        decor_color {
          name
          image { url }
        }
        decor_glass {
          name
        }
        price
        slug
        note
        image {
          url
        }
      }
    }
  }
`;

type ProductGraphQLItem = {
  addons?: RawAddon[] | null;
  name: string;
  shortDescription: string | null;
  description?: string | null;
  updatedAt?: string | null;
  image?: { url?: string | null } | null;
  characteristics: ProductReturnData["characteristics"] | null;
  category: {name: string, slug: string} | null;
  size_rules?: SizeRule[] | null;
  size_notes?: SizeNote[] | null;
  brand?: { name: string; size_rules?: SizeRule[] | null } | null;
  product_variations: Array<
    Omit<ProductVariation, "image" | "price" | "addons" | "decor_color"> & {
      decor_color?: { name: string; image?: { url?: string | null } | null } | null;
      addons?: RawAddon[] | null;
      price: string | number;
      image?: { url?: string | null } | null;
    }
  >;
};

type ProductQueryResponse = {
  products: ProductGraphQLItem[];
};

/** Cached per request: generateMetadata and the page share one fetch. Null when no such product. */
export const getProductBySlug = cache(async (slug: string): Promise<ProductReturnData | null> => {
  const data = await graphqlFetch<ProductQueryResponse>(
    PRODUCT_QUERY,
    { slug, variationStart: 0, addonStart: 0 },
    {
      revalidate: 60,
      tags: [`product-${slug}`],
    }
  );
  const product = data.products[0];
  if (!product) return null;
  const variations = [...product.product_variations];
  // Advance by the returned count so a lower CMS limit cannot truncate the result.
  let batch = product.product_variations;
  while (batch.length > 0) {
    // Page add-ons independently: CMS limits must not hide available options.
    let addonPage = batch;
    let addonStart = 0;
    let addonCount = Math.max(...addonPage.map(row => row.addons?.length ?? 0));
    while (addonCount > 0) {
      addonStart += addonCount;
      const nextAddons = await graphqlFetch<ProductQueryResponse>(
        PRODUCT_QUERY,
        { slug, variationStart: variations.length - batch.length, addonStart },
        { revalidate: 60, tags: [`product-${slug}`] },
      );
      addonPage = nextAddons.products[0]?.product_variations ?? [];
      for (const row of addonPage) {
        const variation = batch.find(item => item.slug === row.slug);
        if (variation) variation.addons = [...(variation.addons ?? []), ...(row.addons ?? [])];
      }
      addonCount = Math.max(0, ...addonPage.map(row => row.addons?.length ?? 0));
    }
    const next = await graphqlFetch<ProductQueryResponse>(
      PRODUCT_QUERY,
      { slug, variationStart: variations.length, addonStart: 0 },
      { revalidate: 60, tags: [`product-${slug}`] },
    );
    batch = next.products[0]?.product_variations ?? [];
    variations.push(...batch);
  }


  return {
    addons: (product.addons ?? []).map(normalizeAddon),
    // The full (markdown) text on the page; the short one when there is no full text.
    description: plainParagraphs(product.description) || product.shortDescription?.trim() || "",
    summary: product.shortDescription?.trim() || plainParagraphs(product.description),
    characteristics: product.characteristics ?? [],
    name: product.name,
    slug,
    brand: product.brand?.name ?? undefined,
    updatedAt: product.updatedAt ?? undefined,
    image: product.image?.url ? `${process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"}${product.image.url}` : undefined,
    category: product.category,
    // Product rules override the brand's (see sizing.ts).
    sizeRules: product.size_rules?.length ? product.size_rules : product.brand?.size_rules ?? [],
    sizeNotes: product.size_notes ?? [],
    variations: variations.filter((variation) => variation.active !== false).map(({ image, price, addons, decor_color, ...variation }) => ({
      ...variation,
      decor_color: decor_color ? {
        name: decor_color.name,
        image: decor_color.image?.url ? `${process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"}${decor_color.image.url}` : null,
      } : null,
      addons: (addons ?? []).map(normalizeAddon),
      price: Number(price) || 0,
      image: image?.url
        ? `${process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"}${image.url}`
        : "",
    })),
  };
});
