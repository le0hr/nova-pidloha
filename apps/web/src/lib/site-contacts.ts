import { cache } from "react";
import { graphqlFetch } from "@/lib/client";
import { getShopLocations } from "@/lib/services/shop.service";
import type { ShopLocation } from "@/lib/catalog/shop-locations";

export type SiteContacts = {
  /** Main phone: CMS Global → phone, else the first showroom phone. */
  phone?: string;
  email?: string;
  shops: ShopLocation[];
};

/** Contacts from CMS Global (phone, email, showrooms); empty fields are simply not shown. */
export const getSiteContacts = cache(async (): Promise<SiteContacts> => {
  const [shops, global] = await Promise.all([
    getShopLocations(),
    graphqlFetch<{ global: { phone?: string | null; email?: string | null } | null }>(
      `query SiteContacts { global(status: PUBLISHED) { phone email } }`, undefined, { revalidate: 300 },
    ).then(data => data.global).catch(() => null),
  ]);
  return {
    phone: global?.phone?.trim() || shops.find(shop => shop.phone)?.phone,
    email: global?.email?.trim() || undefined,
    shops,
  };
});

export const telHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;

/**
 * Online checkout switch (web env CHECKOUT_ENABLED=true). Off until payments are connected: the cart works,
 * the checkout pages and API answer "скоро", and the cart offers to order by phone.
 */
export const checkoutEnabled = () => process.env.CHECKOUT_ENABLED === "true";
