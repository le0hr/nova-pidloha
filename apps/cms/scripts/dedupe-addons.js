/**
 * One-off: merge duplicated door add-ons (Комплектація, api::architrave-type).
 *
 * The importer used to create a separate add-on record for every variation ("variation-addon-<variation>…"), so one
 * moulding item existed thousands of times. Now an add-on is identified by brand + group + name (the name already
 * holds size, finish and colour; within a brand it always has one price). This script:
 *   1. groups importer-made add-ons by that key (brand comes from the linked product),
 *   2. keeps one record per key, gives it the importer's new external_id ("addon-…", same hash as
 *      apps/catalog-importer/app/strapi/mapping.py), and points every variation/product link to it,
 *   3. deletes the other copies and importer add-ons that nothing links to.
 * Edge records (кромка, external_id "architrave-types-…") and hand-made records (no importer external_id) are untouched.
 *
 * Usage (from apps/cms, CMS stopped when using SQLite; on the server inside the container:
 *   docker compose exec -e STRAPI_SCRIPT=1 cms node scripts/dedupe-addons.js [--apply]):
 *   STRAPI_SCRIPT=1 node scripts/dedupe-addons.js            # plan only
 *   STRAPI_SCRIPT=1 node scripts/dedupe-addons.js --apply    # write, in one transaction
 *   STRAPI_SCRIPT=1 node scripts/dedupe-addons.js --keys     # print brand/group/name → key (importer parity check)
 */
const crypto = require('node:crypto');
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const APPLY = process.argv.includes('--apply');
const KEYS = process.argv.includes('--keys');

/** Same as importer normalize(): trim, casefold, unify apostrophes, collapse whitespace. */
const normalize = (value) => String(value ?? '').trim().toLowerCase().replace(/[’ʼ`]/g, "'").split(/\s+/).filter(Boolean).join(' ');
/** Same as importer stable_id(): kind + sha256(json.dumps([...normalized], ensure_ascii=False))[:24]. */
const stableId = (kind, ...parts) =>
  `${kind}-${crypto.createHash('sha256').update(`[${parts.map((p) => JSON.stringify(normalize(p))).join(', ')}]`).digest('hex').slice(0, 24)}`;
const addonKey = (brand, group, name) => stableId('addon', brand || '', group || '', name);

const chunks = (list, size = 400) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));

async function main(strapi) {
  const knex = strapi.db.connection;
  const meta = (uid) => strapi.db.metadata.get(uid);
  const ADDON = meta('api::architrave-type.architrave-type');
  const variationAddons = meta('api::product-variation.product-variation').attributes.addons.joinTable;
  const productAddons = meta('api::product.product').attributes.addons.joinTable;
  const variationProducts = meta('api::product-variation.product-variation').attributes.products.joinTable;
  const productBrand = meta('api::product.product').attributes.brand.joinTable;
  const BRAND = meta('api::brand.brand');
  const col = (table) => ({ own: table.joinColumn.name, addon: table.inverseJoinColumn.name });

  const rows = await knex(ADDON.tableName).select('id', 'document_id', 'name', 'group', 'additional_cost', 'price', 'external_id', 'published_at');
  const imported = rows.filter((r) => /^(variation-addon|addon)-/.test(r.external_id || ''));
  const rowById = new Map(imported.map((r) => [r.id, r]));

  // Brand of every product row, and product of every variation row.
  const brands = new Map((await knex(BRAND.tableName).select('id', 'name')).map((b) => [b.id, b.name]));
  const pb = col(productBrand);
  const brandOfProduct = new Map((await knex(productBrand.name).select(pb.own, pb.addon)).map((l) => [l[pb.own], brands.get(l[pb.addon])]));
  const vp = col(variationProducts);
  const productOfVariation = new Map((await knex(variationProducts.name).select(vp.own, vp.addon)).map((l) => [l[vp.own], l[vp.addon]]));

  const va = col(variationAddons), pa = col(productAddons);
  const links = [
    ...(await knex(variationAddons.name).select('id', va.own, va.addon)).map((l) => ({ table: variationAddons.name, id: l.id, owner: l[va.own], addonColumn: va.addon, addon: l[va.addon], brand: brandOfProduct.get(productOfVariation.get(l[va.own])) })),
    ...(await knex(productAddons.name).select('id', pa.own, pa.addon)).map((l) => ({ table: productAddons.name, id: l.id, owner: l[pa.own], addonColumn: pa.addon, addon: l[pa.addon], brand: brandOfProduct.get(l[pa.own]) })),
  ].filter((l) => rowById.has(l.addon));

  // Documents (draft + published rows) and their brand.
  const docs = new Map();
  for (const r of imported) {
    const doc = docs.get(r.document_id) ?? { documentId: r.document_id, rows: {}, brand: undefined, linked: false };
    doc.rows[r.published_at ? 'published' : 'draft'] = r;
    docs.set(r.document_id, doc);
  }
  for (const l of links) {
    const doc = docs.get(rowById.get(l.addon).document_id);
    doc.linked = true;
    if (l.brand && !doc.brand) doc.brand = l.brand;
  }

  const groups = new Map();
  const orphans = [];
  for (const doc of docs.values()) {
    if (!doc.linked) { orphans.push(doc); continue; }
    const any = doc.rows.published ?? doc.rows.draft;
    const key = addonKey(doc.brand, any.group, any.name);
    groups.set(key, [...(groups.get(key) ?? []), doc]);
  }

  if (KEYS) {
    for (const [key, list] of groups) { const r = list[0].rows.published ?? list[0].rows.draft; console.log(JSON.stringify([list[0].brand ?? '', r.group ?? '', r.name, key])); }
    return;
  }

  // One price per key, otherwise merging would change what customers pay.
  const conflicts = [...groups].filter(([, list]) => new Set(list.map((d) => { const r = d.rows.published ?? d.rows.draft; return `${r.additional_cost}|${r.price}`; })).size > 1);
  if (conflicts.length) {
    for (const [key, list] of conflicts.slice(0, 10)) console.log('PRICE CONFLICT', key, list.map((d) => (d.rows.published ?? d.rows.draft).name).slice(0, 2));
    throw new Error(`${conflicts.length} add-on keys have different prices; nothing changed.`);
  }

  // Keep one document per key: prefer one that already has the new key, then one with both draft and published rows.
  const remap = new Map(); // old row id → kept row id (same status)
  const keep = [], drop = [...orphans];
  for (const [key, list] of groups) {
    list.sort((a, b) => Number(b.rows.draft?.external_id === key || b.rows.published?.external_id === key) - Number(a.rows.draft?.external_id === key || a.rows.published?.external_id === key)
      || Number(Boolean(b.rows.draft && b.rows.published)) - Number(Boolean(a.rows.draft && a.rows.published))
      || (a.rows.published ?? a.rows.draft).id - (b.rows.published ?? b.rows.draft).id);
    const [kept, ...rest] = list;
    keep.push({ key, doc: kept });
    for (const doc of rest) {
      drop.push(doc);
      for (const status of ['draft', 'published']) {
        if (!doc.rows[status]) continue;
        const target = kept.rows[status];
        if (!target) throw new Error(`Kept add-on ${kept.documentId} has no ${status} row for ${key}; nothing changed.`);
        remap.set(doc.rows[status].id, target.id);
      }
    }
  }

  const moved = links.filter((l) => remap.has(l.addon));
  const dropIds = drop.flatMap((d) => Object.values(d.rows).map((r) => r.id));
  const renamed = keep.filter(({ key, doc }) => Object.values(doc.rows).some((r) => r.external_id !== key));
  console.log(`importer add-on documents: ${docs.size} (rows ${imported.length})`);
  console.log(`after merge: ${keep.length} documents | duplicates removed: ${drop.length - orphans.length} | orphans removed: ${orphans.length}`);
  console.log(`links repointed: ${moved.length} | rows deleted: ${dropIds.length} | kept records getting the new external_id: ${renamed.length}`);
  console.log(`untouched (edge / hand-made): ${rows.length - imported.length} rows`);
  if (!APPLY) { console.log('Plan only. Run with --apply to write.'); return; }

  await knex.transaction(async (trx) => {
    for (const { key, doc } of renamed) {
      await trx(ADDON.tableName).whereIn('id', Object.values(doc.rows).map((r) => r.id)).update({ external_id: key });
    }
    // Repoint links; a variation that already links the kept record just loses the duplicate link.
    const existing = new Set(links.map((l) => `${l.table}|${l.owner}|${l.addon}`));
    for (const l of moved) {
      const target = remap.get(l.addon);
      const id = `${l.table}|${l.owner}|${target}`;
      if (existing.has(id)) await trx(l.table).where({ id: l.id }).del();
      else { await trx(l.table).where({ id: l.id }).update({ [l.addonColumn]: target }); existing.add(id); }
    }
    // Remove the dropped rows and anything still pointing at them.
    const addonColumns = Object.values(ADDON.attributes).filter((a) => a.joinTable).map((a) => a.joinTable);
    for (const part of chunks(dropIds)) {
      for (const table of [variationAddons, productAddons]) await trx(table.name).whereIn(table.inverseJoinColumn.name, part).del();
      for (const table of addonColumns) await trx(table.name).whereIn(table.joinColumn.name, part).del();
      await trx(ADDON.tableName).whereIn('id', part).del();
    }
  });
  console.log('Applied.');
}

(async () => {
  // In the Docker image there is no src/, only the built dist/.
  const fs = require('node:fs');
  const options = fs.existsSync('src') ? await compileStrapi() : { appDir: process.cwd(), distDir: require('node:path').join(process.cwd(), 'dist') };
  const strapi = await createStrapi(options).load();
  try { await main(strapi); }
  catch (error) { console.error('ERROR:', error.message); process.exitCode = 1; }
  finally { await strapi.destroy(); }
})();
