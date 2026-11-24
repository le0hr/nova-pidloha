/**
 * One-off: moves «Конструкція», «Кромка» and «Сторона відкривання» from the variations' option list into the fields
 * construction / edge / opening_side (dictionary records are created by name) and fills `kind` of products and
 * variations from the root category. Other options stay in the list. Only changed documents are written.
 *
 *   STRAPI_SCRIPT=1 node scripts/options-to-fields.js [--apply]                       local CMS
 *   STRAPI_URL=… STRAPI_TOKEN=… node scripts/options-to-fields.js --remote [--apply]  another CMS over REST
 */
const fs = require('node:fs');
const path = require('node:path');

const APPLY = process.argv.includes('--apply');
const REMOTE = process.argv.includes('--remote');
const PRODUCT = 'api::product.product';
const VARIATION = 'api::product-variation.product-variation';
const STEPS = { 'Конструкція': ['construction', 'api::construction.construction'], 'Кромка': ['edge', 'api::edge.edge'],
  'Сторона відкривання': ['opening_side', 'api::opening-side.opening-side'] };
const KINDS = { dveri: 'door', mizhkimnatni: 'door', pidloha: 'floor', furnitura: 'hardware' };
const ROUTES = { [PRODUCT]: 'products', [VARIATION]: 'product-variations', 'api::category.category': 'categories',
  'api::construction.construction': 'constructions', 'api::edge.edge': 'edges', 'api::opening-side.opening-side': 'opening-sides' };
const QUERIES = {
  category: ['api::category.category', { fields: ['slug'], populate: { parent: { fields: ['slug'] } } }],
  product: [PRODUCT, { fields: ['kind'], populate: { category: { fields: ['slug'] } } }],
  variation: [VARIATION, { fields: ['kind'], populate: { options: true, products: { fields: ['slug'] }, construction: { fields: ['name'] },
    edge: { fields: ['name'] }, opening_side: { fields: ['name'] } } }],
};
const key = (name) => String(name).trim().toLocaleLowerCase('uk').replace(/\s+/g, ' ');

function localStore(strapi) {
  return {
    async all(uid, query) {
      const out = [];
      for (let start = 0; ; start += 200) {
        const page = await strapi.documents(uid).findMany({ status: 'published', start, limit: 200, ...query });
        out.push(...page);
        if (page.length < 200) return out;
      }
    },
    create: (uid, data) => strapi.documents(uid).create({ data, status: 'published' }),
    update: (uid, documentId, data) => strapi.documents(uid).update({ documentId, data, status: 'published' }),
  };
}

function remoteStore(url, token) {
  const base = url.replace(/\/$/, '');
  const call = async (method, route, body) => {
    const r = await fetch(`${base}/api/${route}`, { method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const json = await r.json().catch(() => null);
    if (!r.ok) throw new Error(`${method} ${route.split('?')[0]}: HTTP ${r.status} ${json?.error?.message ?? ''}`);
    return json;
  };
  const flat = (value, prefix) => (value && typeof value === 'object'
    ? Object.entries(value).flatMap(([k, v]) => flat(v, `${prefix}[${k}]`)) : [`${prefix}=${value}`]);
  return {
    async all(uid, query) {
      const qs = Object.entries(query).flatMap(([k, v]) => flat(v, k)).join('&');
      const out = [];
      for (let page = 1; ; page++) {
        const b = await call('GET', `${ROUTES[uid]}?status=published&${qs}&pagination[pageSize]=100&pagination[page]=${page}`);
        out.push(...b.data);
        if (page >= b.meta.pagination.pageCount) return out;
      }
    },
    create: async (uid, data) => (await call('POST', `${ROUTES[uid]}?status=published`, { data })).data,
    update: (uid, documentId, data) => call('PUT', `${ROUTES[uid]}/${documentId}?status=published`, { data }),
  };
}

async function main(store) {
  const parent = new Map((await store.all(...QUERIES.category)).map((c) => [c.slug, c.parent?.slug]));
  const kindOf = (slug) => {
    const seen = new Set();
    while (slug && parent.get(slug) && !seen.has(slug)) { seen.add(slug); slug = parent.get(slug); }
    return KINDS[slug] ?? null;
  };
  const writes = [];
  const productKind = new Map();
  for (const p of await store.all(...QUERIES.product)) {
    const kind = kindOf(p.category?.slug);
    productKind.set(p.documentId, kind);
    if (kind && p.kind !== kind) writes.push([PRODUCT, p.documentId, { kind }]);
  }
  const records = {};
  for (const [, uid] of Object.values(STEPS)) records[uid] = new Map((await store.all(uid, { fields: ['name'] })).map((r) => [key(r.name), r.documentId]));
  const missing = new Map();
  const counts = { construction: 0, edge: 0, opening_side: 0, door: 0, floor: 0, hardware: 0, noKind: 0 };
  const variations = await store.all(...QUERIES.variation);
  for (const v of variations) {
    const data = {};
    const kind = productKind.get(v.products?.[0]?.documentId) ?? null;
    counts[kind ?? 'noKind']++;
    if (kind && v.kind !== kind) data.kind = kind;
    const moved = (v.options ?? []).filter((o) => STEPS[o.name]);
    for (const o of moved) {
      const [field, uid] = STEPS[o.name];
      counts[field]++;
      if (v[field] && key(v[field].name) !== key(o.value)) throw new Error(`${v.documentId}: ${o.name} is «${o.value}» in the list and «${v[field].name}» in the field`);
      if (!records[uid].has(key(o.value))) missing.set(`${uid}|${key(o.value)}`, [uid, o.value.trim()]);
      if (!v[field]) data[field] = { uid, name: key(o.value) };
    }
    if (moved.length) data.options = v.options.filter((o) => !STEPS[o.name]).map(({ name, value, changesLook }) => ({ name, value, changesLook: !!changesLook }));
    if (Object.keys(data).length) writes.push([VARIATION, v.documentId, data]);
  }
  console.log(`${variations.length} variations: ${Object.entries(counts).map(([k, n]) => `${k} ${n}`).join(', ')}`);
  console.log(`new records: ${[...missing.values()].map(([uid, name]) => `${uid.split('.')[1]} «${name}»`).join('; ') || 'none'}`);
  console.log(`to write: ${writes.length}`);
  if (!APPLY) return;
  for (const [uid, name] of missing.values()) records[uid].set(key(name), (await store.create(uid, { name })).documentId);
  let n = 0;
  for (const [uid, documentId, data] of writes) {
    for (const field of ['construction', 'edge', 'opening_side']) if (data[field]) data[field] = records[data[field].uid].get(data[field].name);
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
