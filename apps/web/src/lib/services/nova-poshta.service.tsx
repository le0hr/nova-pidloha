export type DeliveryCity = { ref: string; name: string; area: string; settlementType: string };
export type DeliveryWarehouse = { ref: string; description: string; cityRef: string };

async function request<T>(path: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> {
  const base = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
  const url = new URL(`/api/nova-poshta/${path}`, base);
  url.search = new URLSearchParams(params).toString();
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Не вдалося завантажити дані Нової Пошти. Спробуйте ще раз.");
  return response.json() as Promise<T>;
}

export function searchCities(query: string, signal?: AbortSignal) {
  if (query.trim().length < 2) return Promise.resolve<DeliveryCity[]>([]);
  return request<DeliveryCity[]>("cities", { q: query.trim(), limit: "20" }, signal);
}

export function getWarehouses(cityRef: string, signal?: AbortSignal) {
  return request<DeliveryWarehouse[]>("warehouses", { cityRef, limit: "1000" }, signal);
}
