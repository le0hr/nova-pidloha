import { normalizeAddon, type RawAddon } from '@/lib/catalog/addons';
import { graphqlFetch } from '@/lib/client';
import type { ProductReturnData, ProductVariation } from '@/types/product';

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
      characteristics {
        name
        value
        unit
      }
      name
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
        }
        decor_glass {
          name
        }
        price
        slug
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
  characteristics: ProductReturnData["characteristics"] | null;
  category: {name: string, slug: string};
  product_variations: Array<
    Omit<ProductVariation, "image" | "price" | "addons"> & {
      addons?: RawAddon[] | null;
      price: string | number;
      image?: { url?: string | null } | null;
    }
  >;
};

type ProductQueryResponse = {
  products: ProductGraphQLItem[];
};

export async function getProductBySlug(slug: string): Promise<ProductReturnData> {
  const data = await graphqlFetch<ProductQueryResponse>(
    PRODUCT_QUERY,
    { slug, variationStart: 0, addonStart: 0 },
    {
      revalidate: 60,
      tags: [`product-${slug}`],
    }
  );
  const product = data.products[0];
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
    description: product.shortDescription ?? "",
    characteristics: product.characteristics ?? [],
    name: product.name,
    category: product.category,
    variations: variations.filter((variation) => variation.active !== false).map(({ image, price, addons, ...variation }) => ({
      ...variation,
      addons: (addons ?? []).map(normalizeAddon),
      price: Number(price) || 0,
      image: image?.url
        ? `${process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"}${image.url}`
        : "",
    })),
  };
}
