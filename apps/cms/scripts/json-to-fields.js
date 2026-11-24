/**
 * Moves the raw price-list JSON (catalog_attributes + attribute_definitions) into typed fields, before the JSON
 * fields are dropped from the schema:
 *   variation: packArea, boardSize, availability, width, height, options (selection steps), characteristics (specs)
 *   product:   «позначка» → isNew / isPromo / isSale; «Під замовлення» → availability on_order of its variations;
 *              door «підклас» → characteristic «Конструкція» when the product has none
 * Unknown columns are listed, never guessed. Only changed documents are written. Run it while the JSON fields still
 * exist in the schema (the deploy that adds the typed fields), then deploy the one that drops them.
 *
 *   STRAPI_SCRIPT=1 node scripts/json-to-fields.js [--apply]                       local CMS
 *   STRAPI_URL=… STRAPI_TOKEN=… node scripts/json-to-fields.js --remote [--apply]  another CMS over REST
 */
const fs = require('node:fs');
const path = require('node:path');

const APPLY = process.argv.includes('--apply');
const REMOTE = process.argv.includes('--remote');
const PRODUCT = 'api::product.product';
const VARIATION = 'api::product-variation.product-variation';
const FIELDS = ['packArea', 'boardSize', 'availability', 'width', 'height'];

const clean = (s) => String(s ?? '').replace(/\s*\(.*\)\s*$/, '').replace(/_/g, ' ').trim();
const label = (s) => clean(s).toLocaleLowerCase('uk').replace(/,/g, '').replace(/\s+/g, ' ');

const RELATION = /^(тип покриття|декор|decor|покриття|колір|color|скло|glass)$/;
const OPTIONS = [
  [/^конструкція$/, 'Конструкція', true],
  [/^кромка$/, 'Кромка', false],
  [/^сторона( відкривання)?$/, 'Сторона відкривання', false],
  [/^підготовка під замок$/, 'Підготовка під замок', false],
];
// Descriptive specs → variation characteristics: [pattern, name, unit]. Order = order in the table.
const SPECS = [
  [/^декор №/, 'Декор №'], [/^клас зносостійкості/, 'Клас зносостійкості'], [/^клас \/ товщина/, 'Клас / товщина'],
  [/^товщина/, 'Товщина', 'мм'], [/^розмір мм/, 'Розмір', 'мм'], [/^замок/, 'Замок'], [/^фаска/, 'Фаска'],
  [/^захисний шар/, 'Захисний шар'], [/^матеріал/, 'Матеріал'], [/^основа/, 'Основа'], [/^вологостійкий/, 'Вологостійкий'],
  [/^(планок|дощок) (у|в) пачці/, 'Планок у пачці'], [/^довжина рулону/, 'Довжина рулону'], [/^ширина рулону/, 'Ширина рулону'],
  [/^виконання/, 'Виконання'],
];
const number = (v) => { const n = Number(String(v ?? '').trim().replace(',', '.')); return Number.isFinite(n) && n > 0 ? n : null; };
const count = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);

function availability(value) {
  const v = label(value);
  if (/^(склад|в наявн|є( |$)|так( |$))/.test(v)) return 'in_stock';
  if (/замовл/.test(v)) return 'on_order';
  return undefined;
}

/** Typed fields of one variation; unknown columns are counted in `unknown`. */
function classify(variation, unknown) {
  const names = new Map((variation.attribute_definitions ?? []).map((d) => [d.key, d.display_name]));
  const out = { packArea: null, boardSize: null, availability: null, width: null, height: null, options: [], characteristics: [] };
  for (const [key, raw] of Object.entries(variation.catalog_attributes ?? {})) {
    const display = names.get(key) ?? key;
    const name = label(display);
    const value = String(raw ?? '').trim();
    if (!value || RELATION.test(name)) continue;
    let spec;
    if (/^(площа|м2|м²) в (пачці|упаковці)/.test(name)) out.packArea = number(value);
    else if (/^розмір дошки/.test(name)) out.boardSize = value;
    else if (/^наявність/.test(name)) {
      const a = availability(value);
      if (a) out.availability = a; else count(unknown, `наявність = ${value}`);
    } else if (/^ширина( мм)?$/.test(name)) out.width = Math.round(number(value)) || null;
    else if (/^висота( мм)?$/.test(name)) out.height = Math.round(number(value)) || null;
    else if ((spec = SPECS.find(([re]) => re.test(name)))) {
      out.characteristics.push({ name: spec[1], value: spec[2] ? value.replace(new RegExp(`\\s*${spec[2]}$`, 'i'), '') : value, unit: spec[2] ?? null });
    } else {
      const option = OPTIONS.find(([re]) => re.test(name));
      if (option) out.options.push({ name: option[1], value, changesLook: option[2] });
      else if (!/^(підклас|позначка)$/.test(name)) count(unknown, clean(display));
    }
  }
  const order = (list, item) => list.findIndex(([, n]) => n === item.name);
  out.options.sort((a, b) => order(OPTIONS, a) - order(OPTIONS, b));
  out.characteristics.sort((a, b) => order(SPECS, a) - order(SPECS, b));
  return out;
}

/** «позначка» of a product, e.g. "Новинка, Розпродаж". */
const marks = (product) => String(product.catalog_attributes?.['позначка'] ?? '').toLocaleLowerCase('uk');

const pick = (list, keys) => (list ?? []).map((item) => Object.fromEntries(keys.map((k) => [k, item[k] ?? (k === 'changesLook' ? false : null)])));
const sameVariation = (v, d) => FIELDS.every((f) => (v[f] == null ? null : f === 'packArea' ? Number(v[f]) : v[f]) === d[f])
  && JSON.stringify(pick(v.options, ['name', 'value', 'changesLook'])) === JSON.stringify(d.options)
  && JSON.stringify(pick(v.characteristics, ['name', 'value', 'unit'])) === JSON.stringify(d.characteristics);

function localStore(strapi) {
  const all = async function* (uid, query) {
    for (let start = 0; ; start += 200) {
      const page = await strapi.documents(uid).findMany({ status: 'published', start, limit: 200, ...query });
      yield* page;
      if (page.length < 200) break;
    }
  };
  return {
    products: () => all(PRODUCT, { fields: ['catalog_attributes', 'isNew', 'isPromo', 'isSale'],
      populate: { product_variations: { fields: ['documentId'] }, characteristics: true, category: { fields: ['slug'] } } }),
    variations: () => all(VARIATION, { fields: ['catalog_attributes', 'attribute_definitions', ...FIELDS],
      populate: { options: true, characteristics: true } }),
    update: (uid, documentId, data) => strapi.documents(uid).update({ documentId, data, status: 'published' }),
  };
}

function remoteStore(url, token) {
  const base = url.replace(/\/$/, '');
  const call = async (method, route, body) => {
    const r = await fetch(`${base}/${route}`, { method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const json = await r.json().catch(() => null);
    if (!r.ok) throw new Error(`${method} ${route.split('?')[0]}: HTTP ${r.status} ${json?.error?.message ?? ''}`);
    return json;
  };
  const all = async function* (route) {
    for (let page = 1; ; page++) {
      const b = await call('GET', `${route}&pagination[pageSize]=100&pagination[page]=${page}`);
      yield* b.data;
      if (page >= b.meta.pagination.pageCount) break;
    }
  };
  const fields = (list) => list.map((f, i) => `fields[${i}]=${f}`).join('&');
  return {
    products: () => all(`api/products?status=published&${fields(['catalog_attributes', 'isNew', 'isPromo', 'isSale'])}&populate[product_variations][fields][0]=documentId`
      + '&populate[characteristics]=true&populate[category][fields][0]=slug'),
    variations: () => all(`api/product-variations?status=published&${fields(['catalog_attributes', 'attribute_definitions', ...FIELDS])}&populate[options]=true&populate[characteristics]=true`),
    update: (uid, documentId, data) => call('PUT', `api/${uid === PRODUCT ? 'products' : 'product-variations'}/${documentId}?status=published`, { data }),
  };
}

async function main(store) {
  const unknown = new Map();
  const writes = [];
  const onOrder = new Set();
  const flags = { isNew: 0, isPromo: 0, isSale: 0, onOrder: 0, construction: 0 };
  for await (const p of store.products()) {
    const m = marks(p);
    const data = {};
    if (/новинка/.test(m) && !p.isNew) data.isNew = true;
    if (/акці/.test(m) && !p.isPromo) data.isPromo = true;
    if (/розпродаж/.test(m) && !p.isSale) data.isSale = true;
    for (const k of Object.keys(data)) flags[k]++;
    const subclass = String(p.catalog_attributes?.['підклас'] ?? '').trim();
    const door = /^(mizhkimnatni|dveri)/.test(p.category?.slug ?? '');
    if (subclass && door && !(p.characteristics ?? []).some((c) => /^конструкц/i.test(c.name))) {
      data.characteristics = [...pick(p.characteristics, ['name', 'value', 'unit']), { name: 'Конструкція', value: subclass, unit: null }];
      flags.construction++;
    }
    if (/під замовлення/.test(m)) { flags.onOrder++; for (const v of p.product_variations ?? []) onOrder.add(v.documentId); }
    if (Object.keys(data).length) writes.push([PRODUCT, p.documentId, data]);
  }
  let total = 0;
  const counts = { packArea: 0, boardSize: 0, availability: 0, width: 0, height: 0, options: 0, characteristics: 0 };
  for await (const v of store.variations()) {
    total++;
    const data = classify(v, unknown);
    if (!data.availability && onOrder.has(v.documentId)) data.availability = 'on_order';
    for (const f of Object.keys(counts)) if (Array.isArray(data[f]) ? data[f].length : data[f] != null) counts[f]++;
    if (!sameVariation(v, data)) writes.push([VARIATION, v.documentId, data]);
  }
  console.log(`${total} variations; filled: ${Object.entries(counts).map(([k, n]) => `${k} ${n}`).join(', ')}`);
  console.log(`products: «Новинка» → isNew ${flags.isNew}, «Акція» → isPromo ${flags.isPromo}, «Розпродаж» → isSale ${flags.isSale}, `
    + `«Під замовлення» → on_order for ${flags.onOrder}, «підклас» → «Конструкція» ${flags.construction}`);
  console.log(`to write: ${writes.length}`);
  if (unknown.size) console.log(`unknown columns (dropped with the JSON):\n  ${[...unknown].map(([k, n]) => `${k} × ${n}`).join('\n  ')}`);
  if (!APPLY) return;
  let n = 0;
  for (const [uid, documentId, data] of writes) {
    await store.update(uid, documentId, data);
    if (++n % 500 === 0) console.log(`  ${n}/${writes.length}`);
  }
  console.log(`written ${n}`);
}

(async () => {
  if (REMOTE) {
    if (!process.env.STRAPI_URL || !process.env.STRAPI_TOKEN) throw new Error('--remote needs STRAPI_URL and STRAPI_TOKEN');
    return main(remoteStore(process.env.STRAPI_URL, process.env.STRAPI_TOKEN));
  }
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const options = fs.existsSync('src') ? await compileStrapi() : { appDir: process.cwd(), distDir: path.join(process.cwd(), 'dist') };
  const strapi = await createStrapi(options).load();
  try { await main(localStore(strapi)); } finally { await strapi.destroy(); }
})().catch((error) => { console.error('ERROR:', error.message); process.exitCode = 1; });
