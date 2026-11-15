import { ensure, Item, money } from './domain';
import { packArea, sizePercent } from './sizing';

export async function snapshot(strapi: any, input: any): Promise<Item[]> {
  ensure(Array.isArray(input) && input.length > 0 && input.length <= 100, 'Кошик порожній або завеликий');
  const ids = new Set<string>();
  const result: Item[] = [];
  for (const line of input) {
    ensure(typeof line.id === 'string' && line.id.length <= 1000 && !ids.has(line.id), 'Некоректна позиція'); ids.add(line.id);
    ensure(Number.isInteger(line.qty) && line.qty > 0 && line.qty <= 10000, 'Некоректна кількість');
    const slug = line.variationSlug || line.id;
    ensure(typeof slug === 'string' && slug.length <= 500, 'Некоректний товар');
    const variation = await strapi.documents('api::product-variation.product-variation').findFirst({
      status: 'published', filters: { slug, active: { $ne: false } },
      populate: { addons: true, architrave_types: true, decor: true, decor_color: true, decor_glass: true,
        products: { populate: { addons: true, size_rules: true, characteristics: true, brand: { populate: { size_rules: true } } } } },
    });
    ensure(variation, 'Варіант товару більше недоступний');
    const product = variation.products?.find((p: any) => p.active !== false && p.publishedAt);
    ensure(product, 'Товар більше недоступний');
    const available = [...(variation.addons || []), ...(product.addons || []), ...(variation.architrave_types || [])];
    ensure(Array.isArray(line.addons || []) && (line.addons || []).length <= 30, 'Некоректна комплектація');
    const groups = new Set(); const selected = new Set();
    const addons = (line.addons || []).map((choice: any) => {
      const addon = available.find((a: any) => a.documentId === choice.id && a.publishedAt);
      ensure(addon && !selected.has(choice.id), 'Доповнення недоступне'); selected.add(choice.id);
      if (addon.group) { ensure(!groups.has(addon.group), 'Оберіть одне доповнення з групи'); groups.add(addon.group); }
      return { id: addon.documentId, name: addon.name, price: money(addon.additionalCost ?? addon.price ?? 0) };
    });
    // Same rules as the product page: floor = price per m² × pack area; door = standard price + size surcharge.
    const area = packArea(variation);
    const hasSize = !area && line.size && typeof line.size === 'object';
    const percent = hasSize ? sizePercent(product, variation, line.size) : 0;
    const base = area ? Math.round(Number(variation.price) * area * 100)
      : percent ? Math.round(Number(variation.price) * (1 + percent / 100)) * 100
      : money(variation.price);
    ensure(Number.isFinite(base) && base > 0, 'Ціну товару потрібно уточнити');
    const unit = base + addons.reduce((sum: number, a: any) => sum + a.price, 0);
    const labels = new Map<string, string>((variation.attribute_definitions || []).map((d: any) => [d.key, d.display_name]));
    const mods = Object.entries(variation.catalog_attributes || {})
      .filter(([key]) => !(hasSize && /^(ширина|висота)/i.test(labels.get(key) || key)))
      .map(([key, value]) => `${(labels.get(key) || key).replace(/\s*\([^)]*\)\s*$/, '')}: ${String(value)}`);
    for (const key of ['decor', 'decor_color', 'decor_glass']) if (variation[key]?.name) mods.push(variation[key].name);
    const size = hasSize ? { width: Number(line.size.width), height: Number(line.size.height), percent } : undefined;
    if (size) mods.push(percent ? `Нестандартний розмір: ${size.width}×${size.height} мм (+${percent}%)` : `Розмір: ${size.width}×${size.height} мм`);
    if (area) mods.push(`Упаковка: ${area} м² (${Number(variation.price).toLocaleString('uk-UA')} грн/м²)`);
    result.push({ id: line.id, variationSlug: variation.slug, name: product.name, sku: variation.sku || product.sku || '', productId: product.documentId, variationId: variation.documentId, qty: line.qty, unit, addons, mods,
      ...(size ? { size } : {}), ...(area ? { packArea: area } : {}) });
  }
  ensure(result.reduce((s, i) => s + i.unit * i.qty, 0) <= 1000000000, 'Сума замовлення завелика');
  return result;
}
export async function delivery(strapi: any, input: any) {
  ensure(input && ['pickup', 'nova', 'courier', 'address'].includes(input.method), 'Оберіть доставку');
  if (input.method === 'pickup') {
    const global = await strapi.documents('api::global.global').findFirst({ status: 'published', populate: { shopLocations: true } });
    const fallback = [
      { name: 'Нова Підлога та Двері — магазин 1', lat: 49.438958423807314, lng: 32.05061177492442 },
      { name: 'Нова Підлога та Двері — магазин 2', lat: 49.42909246799387, lng: 32.00709050070083 },
    ];
    const locations = global?.shopLocations?.length ? global.shopLocations : fallback;
    const shop = locations.find((s: any) => Number(s.lat) === input.pickupShop?.lat && Number(s.lng) === input.pickupShop?.lng);
    ensure(shop, 'Оберіть магазин');
    return { method: 'pickup', pickupShop: {name: shop.name, address: shop.address || '', lat: Number(shop.lat), lng: Number(shop.lng)} };
  }
  if (input.method === 'nova') {
    ensure(typeof input.city?.ref === 'string' && typeof input.warehouse?.ref === 'string', 'Оберіть місто та відділення');
    const list = await strapi.service('api::nova-poshta.nova-poshta').getWarehouses(input.city.ref, 1000);
    const warehouse = list.find((w: any) => w.Ref === input.warehouse.ref && w.CityRef === input.city.ref);
    ensure(warehouse, 'Відділення не належить місту');
    return { method: 'nova', city: { ref: warehouse.CityRef, name: warehouse.CityDescription }, warehouse: { ref: warehouse.Ref, cityRef: warehouse.CityRef, description: warehouse.Description } };
  }
  ensure(typeof input.address === 'string' && input.address.trim().length >= 5 && input.address.length <= 1000, 'Вкажіть повну адресу доставки');
  return { method: input.method, address: input.address.trim() };
}
