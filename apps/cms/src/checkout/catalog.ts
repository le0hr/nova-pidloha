import { ensure, Item, money } from './domain';

export async function snapshot(strapi: any, input: any): Promise<Item[]> {
  ensure(Array.isArray(input) && input.length > 0 && input.length <= 100, 'Кошик порожній або завеликий');
  const ids = new Set<string>();
  const result: Item[] = [];
  for (const line of input) {
    ensure(typeof line.id === 'string' && line.id.length <= 1000 && !ids.has(line.id), 'Некоректна позиція'); ids.add(line.id);
    ensure(Number.isInteger(line.qty) && line.qty > 0 && line.qty <= 10000, 'Некоректна кількість');
    const slug = line.variationSlug || line.id;
    const variation = await strapi.documents('api::product-variation.product-variation').findFirst({
      status: 'published', filters: { slug, active: { $ne: false } },
      populate: { addons: true, architrave_types: true, products: { populate: { addons: true } }, decor: true, decor_color: true, decor_glass: true },
    });
    ensure(variation, 'Варіант товару більше недоступний');
    const product = variation.products?.find((p: any) => p.active !== false && p.publishedAt);
    ensure(product, 'Товар більше недоступний');
    const available = [...(variation.addons || []), ...(product.addons || []), ...(variation.architrave_types || [])];
    ensure(Array.isArray(line.addons || []) && (line.addons || []).length <= 30, 'Некоректна комплектація');
    const groups = new Set(); const selected = new Set();
    const addons = (line.addons || []).map((choice: any) => {
      const addon = available.find((a: any) => a.documentId === choice.id);
      ensure(addon && !selected.has(choice.id), 'Доповнення недоступне'); selected.add(choice.id);
      if (addon.group) { ensure(!groups.has(addon.group), 'Оберіть одне доповнення з групи'); groups.add(addon.group); }
      return { id: addon.documentId, name: addon.name, price: money(addon.additionalCost ?? addon.price ?? 0) };
    });
    const unit = money(variation.price) + addons.reduce((sum: number, a: any) => sum + a.price, 0);
    ensure(unit > 0, 'Ціну товару потрібно уточнити');
    const mods = Object.entries(variation.catalog_attributes || {}).map(([key, value]) => `${key}: ${String(value)}`);
    for (const key of ['decor', 'decor_color', 'decor_glass']) if (variation[key]?.name) mods.push(variation[key].name);
    result.push({ id: line.id, variationSlug: variation.slug, name: product.name, qty: line.qty, unit, addons, mods });
  }
  ensure(result.reduce((s, i) => s + i.unit * i.qty, 0) <= 1000000000, 'Сума замовлення завелика');
  return result;
}
export async function shops(strapi: any) {
  const global = await strapi.documents('api::global.global').findFirst({ status: 'published', populate: { shopLocations: true } });
  return (global?.shopLocations || []).map((s: any) => ({ id: String(s.id), name: s.name, address: s.address }));
}
export async function delivery(strapi: any, input: any) {
  ensure(input && ['pickup', 'nova', 'courier', 'address'].includes(input.method), 'Оберіть доставку');
  if (input.method === 'pickup') {
    const shop = (await shops(strapi)).find((s: any) => s.id === input.shopId);
    ensure(shop, 'Оберіть магазин'); return { method: 'pickup', shopId: shop.id, shop };
  }
  if (input.method === 'nova') {
    ensure(typeof input.city?.ref === 'string' && typeof input.warehouse?.ref === 'string', 'Оберіть місто та відділення');
    const list = await strapi.service('api::nova-poshta.nova-poshta').getWarehouses(input.city.ref);
    const warehouse = list.find((w: any) => w.Ref === input.warehouse.ref && w.CityRef === input.city.ref);
    ensure(warehouse, 'Відділення не належить місту');
    return { method: 'nova', city: { ref: warehouse.CityRef, name: warehouse.CityDescription }, warehouse: { ref: warehouse.Ref, cityRef: warehouse.CityRef, description: warehouse.Description } };
  }
  const address: Record<string, string> = {};
  for (const key of ['city', 'street', 'house', 'apartment']) address[key] = typeof input.address?.[key] === 'string' ? input.address[key].trim().slice(0, 200) : '';
  ensure(address.city && address.street && address.house, 'Заповніть місто, вулицю та будинок');
  return { method: input.method, address };
}
