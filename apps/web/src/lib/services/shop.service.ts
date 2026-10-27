import { graphqlFetch, mediaUrl } from "@/lib/client";
import { normalizeShopLocations, SHOP_LOCATIONS, type ShopLocation } from "@/lib/catalog/shop-locations";

export async function getShopLocations(): Promise<ShopLocation[]> {
  try {
    const data = await graphqlFetch<{ global: { shopLocations: unknown } | null }>(`
      query ShopLocations {
        global(status: PUBLISHED) {
          shopLocations { name address lat lng placeId phone hours image { url } }
        }
      }`, undefined, { cache: "no-store" });
    return normalizeShopLocations(data.global?.shopLocations).map(shop => ({
      ...shop, image: shop.image ? mediaUrl(shop.image) : undefined,
    }));
  } catch {
    // Supports rolling deployments while the new CMS component is not yet available.
    return SHOP_LOCATIONS;
  }
}
