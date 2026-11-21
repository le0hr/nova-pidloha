/**
 * Floor skirting as an add-on of laminate / SPC / LVT (group "Плінтус", priced per board, bought by the piece).
 * Input: JSON from apps/catalog-importer/scripts/convert_skirting.py. Each board is offered by its scope:
 *   "all"            every floor product,
 *   "brand:<Brand>"  every floor product of that brand,
 *   "decor:<text>"   only the Classen variation(s) of that collection + decor ("Impression 4V WR Дуб Бассано").
 * Add-on records get external_id "skirting-<hash>" and are created or updated; links are only added, never removed.
 * Rerun after every floor import (the importer resets product and variation add-ons).
 *
 *   STRAPI_SCRIPT=1 node scripts/floor-skirting.js FILE.json [--apply]                       local CMS
 *   STRAPI_URL=… STRAPI_TOKEN=… node scripts/floor-skirting.js FILE.json --remote [--apply]  another CMS over REST
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const APPLY = process.argv.includes('--apply');
const REMOTE = process.argv.includes('--remote');
const FILE = process.argv.find((a) => a.endsWith('.json'));
const ADDON = 'api::architrave-type.architrave-type';
const PRODUCT = 'api::product.product';
const VARIATION = 'api::product-variation.product-variation';
const FLOOR = /^pidloha-(laminat|vinilova-pidloha)/;

const norm = (s) => String(s ?? '').toLowerCase().replace(/ё/g, 'е').replace(/[’'`]/g, '').replace(/\s+/g, ' ').trim();
const tokens = (s) => norm(s).split(/[^0-9a-zа-яіїєґ+]+/i).filter(Boolean);
/** One letter off is still the same word ("Дуд Сантана" in the price list). */
const near = (a, b) => {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1 || a.length < 3) return false;
  let i = 0; while (i < a.length && a[i] === b[i]) i++;
  return a.slice(i + 1) === b.slice(i + 1) || a.slice(i + 1) === b.slice(i) || a.slice(i) === b.slice(i + 1);
};
const sameWords = (a, b) => a.length === b.length && a.every((t, i) => near(t, b[i]));

/** Classen variations a "decor:" scope belongs to. */
function decorTargets(scope, floors) {
  const words = tokens(scope);
  const out = [];
  for (const p of floors.filter((f) => /classen/i.test(f.brand))) {
    const collection = tokens(p.name).filter((t) => t !== 'classen');
    const rest = collection.every((t) => words.includes(t)) ? words.filter((t) => !collection.includes(t)) : null;
    for (const v of p.variations) {
      const colour = tokens(v.colour);
      if ((rest && sameWords(rest, colour)) || sameWords(words, colour) && !words.some((t) => collection.includes(t))) out.push(v.documentId);
    }
  }
  return out;
}

function localStore(strapi) {
  return {
    async floors() {
      const out = [];
      for (let start = 0; ; start += 100) {
        const page = await strapi.documents(PRODUCT).findMany({ status: 'published', start, limit: 100,
          populate: { category: { fields: ['slug'] }, brand: { fields: ['name'] },
            product_variations: { fields: ['active'], populate: { decor_color: { fields: ['name'] } } } } });
        out.push(...page);
        if (page.length < 100) break;
      }
      return out;
    },
    async addons() { return strapi.documents(ADDON).findMany({ status: 'published', filters: { external_id: { $startsWith: 'skirting-' } }, limit: 10000 }); },
    async upsertAddon(existing, data) {
      const doc = existing
        ? await strapi.documents(ADDON).update({ documentId: existing.documentId, data })
        : await strapi.documents(ADDON).create({ data });
      await strapi.documents(ADDON).publish({ documentId: doc.documentId });
      return doc.documentId;
    },
    async connect(uid, documentId, ids) {
      await strapi.documents(uid).update({ documentId, data: { addons: { connect: ids } } });
      await strapi.documents(uid).publish({ documentId });
    },
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
  const all = async (route) => {
    const out = [];
    for (let page = 1; ; page++) {
      const b = await call('GET', `${route}&pagination[pageSize]=100&pagination[page]=${page}`);
      out.push(...b.data);
      if (page >= b.meta.pagination.pageCount) break;
    }
    return out;
  };
  return {
    floors: () => all('api/products?status=published&fields[0]=name&fields[1]=active&populate[category][fields][0]=slug&populate[brand][fields][0]=name&populate[product_variations][fields][0]=active&populate[product_variations][populate][decor_color][fields][0]=name'),
    addons: () => all('api/architrave-types?status=published&filters[external_id][$startsWith]=skirting-&fields[0]=name&fields[1]=external_id&fields[2]=group&fields[3]=price&fields[4]=additionalCost'),
    async upsertAddon(existing, data) {
      const b = existing
        ? await call('PUT', `api/architrave-types/${existing.documentId}?status=published`, { data })
        : await call('POST', 'api/architrave-types?status=published', { data });
      return b.data.documentId;
    },
    async connect(kind, documentId, ids) {
      const route = kind === PRODUCT ? 'products' : 'product-variations';
      await call('PUT', `api/${route}/${documentId}?status=published`, { data: { addons: { connect: ids } } });
    },
  };
}

async function main(store) {
  const boards = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const products = (await store.floors()).filter((p) => p.active !== false && FLOOR.test(p.category?.slug ?? ''));
  const floors = products.map((p) => ({ documentId: p.documentId, name: p.name, brand: p.brand?.name ?? '',
    variations: (p.product_variations ?? []).filter((v) => v.active !== false).map((v) => ({ documentId: v.documentId, colour: v.decor_color?.name ?? '' })) }));

  const productLinks = new Map(); const variationLinks = new Map(); const unmatched = [];
  const link = (map, id, ref) => { if (!map.has(id)) map.set(id, new Set()); map.get(id).add(ref); };
  for (const b of boards) {
    b.external_id = `skirting-${crypto.createHash('sha256').update(b.name).digest('hex').slice(0, 20)}`;
    const [kind, value] = b.scope.split(/:(.*)/s);
    if (kind === 'all') floors.forEach((f) => link(productLinks, f.documentId, b.external_id));
    else if (kind === 'brand') floors.filter((f) => norm(f.brand) === norm(value)).forEach((f) => link(productLinks, f.documentId, b.external_id));
    else {
      const targets = decorTargets(value, floors);
      if (!targets.length) unmatched.push(`${value} → ${b.name}`);
      targets.forEach((id) => link(variationLinks, id, b.external_id));
    }
  }
  console.log(`${boards.length} boards; ${floors.length} floor products: ${productLinks.size} get product skirting, ${variationLinks.size} variations get a colour-matched Classen board`);
  if (unmatched.length) console.log(`no Classen decor on the site for ${unmatched.length}:\n  ${unmatched.join('\n  ')}`);
  if (!APPLY) return;

  const existing = new Map((await store.addons()).map((a) => [a.external_id, a]));
  const ids = new Map();
  for (const b of boards) {
    const data = { name: b.name, group: 'Плінтус', additionalCost: String(b.price), price: String(b.price), external_id: b.external_id };
    ids.set(b.external_id, await store.upsertAddon(existing.get(b.external_id), data));
  }
  let n = 0;
  for (const [documentId, refs] of productLinks) { await store.connect(PRODUCT, documentId, [...refs].map((r) => ids.get(r))); n++; }
  for (const [documentId, refs] of variationLinks) { await store.connect(VARIATION, documentId, [...refs].map((r) => ids.get(r))); n++; }
  console.log(`saved ${ids.size} boards, linked ${n} products/variations`);
}

(async () => {
  if (!FILE) throw new Error('Pass the JSON from convert_skirting.py');
  if (REMOTE) {
    if (!process.env.STRAPI_URL || !process.env.STRAPI_TOKEN) throw new Error('--remote needs STRAPI_URL and STRAPI_TOKEN');
    return main(remoteStore(process.env.STRAPI_URL, process.env.STRAPI_TOKEN));
  }
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const options = fs.existsSync('src') ? await compileStrapi() : { appDir: process.cwd(), distDir: path.join(process.cwd(), 'dist') };
  const strapi = await createStrapi(options).load();
  try { await main(localStore(strapi)); } finally { await strapi.destroy(); }
})().catch((error) => { console.error('ERROR:', error.message); process.exitCode = 1; });
