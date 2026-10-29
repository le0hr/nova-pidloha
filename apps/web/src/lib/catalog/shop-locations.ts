export type ShopLocation = {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
  phone?: string;
  hours?: string;
  image?: string;
};

// Existing verified coordinates remain available until locations are published in CMS.
export const SHOP_LOCATIONS: ShopLocation[] = [
  { name: "Нова Підлога та Двері — магазин 1", lat: 49.438958423807314, lng: 32.05061177492442 },
  { name: "Нова Підлога та Двері — магазин 2", lat: 49.42909246799387, lng: 32.00709050070083 },
];

export function shopMapEmbedUrl(shop: ShopLocation): string {
  const params = new URLSearchParams({
    q: `${shop.lat},${shop.lng}`, z: "16", hl: "uk", output: "embed",
  });
  return `https://www.google.com/maps?${params}`;
}

export function shopsMapEmbedUrl(shops: ShopLocation[]): string {
  const locations = shops.length ? shops : SHOP_LOCATIONS;
  if (locations.length === 1) return shopMapEmbedUrl(locations[0]);
  const lat = locations.reduce((sum, shop) => sum + shop.lat, 0) / locations.length;
  const lng = locations.reduce((sum, shop) => sum + shop.lng, 0) / locations.length;
  const params = new URLSearchParams({
    q: "Нова Підлога та Двері Черкаси", ll: `${lat},${lng}`, z: "13", hl: "uk", output: "embed",
  });
  return `https://www.google.com/maps?${params}`;
}

export function shopDirectionsUrl(shop: ShopLocation): string {
  const params = new URLSearchParams({ api: "1", destination: `${shop.lat},${shop.lng}` });
  if (shop.placeId) params.set("destination_place_id", shop.placeId);
  return `https://www.google.com/maps/dir/?${params}`;
}

export function normalizeShopLocations(rows: unknown): ShopLocation[] {
  if (!Array.isArray(rows)) return SHOP_LOCATIONS;
  const text = (value: unknown) => typeof value === "string" ? value.trim() || undefined : undefined;
  const shops = rows.flatMap(row => {
    if (!row || typeof row !== "object") return [];
    const name = text(row.name);
    if (!name || row.lat == null || row.lng == null || row.lat === '' || row.lng === '') return [];
    const lat = Number(row.lat), lng = Number(row.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return [];
    return [{ name, lat, lng, address: text(row.address), placeId: text(row.placeId),
      phone: text(row.phone), hours: text(row.hours), image: text(row.image?.url) }];
  });
  return shops.length ? shops : SHOP_LOCATIONS;
}
