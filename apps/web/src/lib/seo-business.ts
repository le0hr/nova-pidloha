import { graphqlFetch } from "@/lib/client";
import { getShopLocations } from "@/lib/services/shop.service";
import { SITE_CITY, SITE_NAME, absoluteUrl, siteUrl } from "@/lib/seo";

/**
 * Organization, website and every showroom (from CMS Global → shopLocations) as schema.org data for the home page.
 * Showrooms with address, phone and coordinates feed Google's local results ("ламінат Черкаси").
 */
export async function organizationLd(): Promise<object[]> {
  const [shops, contacts] = await Promise.all([
    getShopLocations(),
    graphqlFetch<{ global: { phone?: string | null; email?: string | null } | null }>(
      `query SiteContacts { global(status: PUBLISHED) { phone email } }`, undefined, { revalidate: 300 },
    ).then(data => data.global).catch(() => null),
  ]);
  const url = siteUrl();
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: SITE_NAME,
    url,
    logo: absoluteUrl("/nova-pidloha.png"),
    ...(contacts?.phone ? { telephone: contacts.phone } : {}),
    ...(contacts?.email ? { email: contacts.email } : {}),
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name: SITE_NAME,
    url,
    inLanguage: "uk",
    publisher: { "@id": `${url}/#organization` },
  };
  const stores = shops.filter(shop => shop.address).map((shop, index) => ({
    "@context": "https://schema.org",
    "@type": "HomeGoodsStore",
    "@id": `${url}/#store-${index + 1}`,
    name: shop.name,
    url,
    image: shop.image ?? absoluteUrl("/nova-pidloha.png"),
    parentOrganization: { "@id": `${url}/#organization` },
    address: { "@type": "PostalAddress", streetAddress: shop.address, addressLocality: SITE_CITY, addressCountry: "UA" },
    geo: { "@type": "GeoCoordinates", latitude: shop.lat, longitude: shop.lng },
    ...(shop.phone ?? contacts?.phone ? { telephone: shop.phone ?? contacts?.phone } : {}),
    ...(shop.placeId ? { hasMap: `https://www.google.com/maps/place/?q=place_id:${shop.placeId}` } : {}),
    priceRange: "₴₴",
  }));
  return [organization, website, ...stores];
}
