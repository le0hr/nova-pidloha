import { errors } from '@strapi/utils'; // bundled with Strapi
import { randomBytes } from 'node:crypto';

/**
 * What a manager should not have to type: titles in the admin — of a variation («PP · Білий мат · Глухе · 800×2000») and
 * of a colour («Білий мат · PP», as many decors share colour names) —, the page address (slug) of new products and variations. And what must not be forgotten before publishing.
 */
const PRODUCT = 'api::product.product';
const VARIATION = 'api::product-variation.product-variation';
const PARTS: Record<string, string> = { decor: 'api::decor.decor', decor_color: 'api::decor-color.decor-color', decor_glass: 'api::decor-glass.decor-glass',
  construction: 'api::construction.construction', edge: 'api::edge.edge', opening_side: 'api::opening-side.opening-side' };
const COLOR = PARTS.decor_color;
const PAGE = 500;

const colorTitle = (row: any): string => [row.name, row.decor?.name].filter(Boolean).join(' · ').slice(0, 250);

function variationTitle(row: any): string {
  return [
    ...Object.keys(PARTS).map((field) => row[field]?.name), ...(row.options ?? []).map((option: any) => option.value),
    row.width && row.height ? `${row.width}×${row.height}` : row.width || row.height, row.sku,
  ].filter(Boolean).join(' · ').slice(0, 250) || row.slug;
}

/** Titles of the matching rows, drafts and published apart. Plain writes: the draft does not become "modified". */
async function syncTitles(strapi: any, uid: string, where: any) {
  const title = uid === COLOR ? colorTitle : variationTitle;
  const populate = uid === COLOR ? { decor: { select: ['name'] } }
    : { options: true, ...Object.fromEntries(Object.keys(PARTS).map((field) => [field, { select: ['name'] }])) };
  for (let last = 0; ;) {
    const rows = await strapi.db.query(uid).findMany({ where: { $and: [where, { id: { $gt: last } }] }, orderBy: { id: 'asc' }, limit: PAGE, populate });
    const byTitle = new Map<string, number[]>();
    for (const row of rows) if (row.title !== title(row)) byTitle.set(title(row), [...(byTitle.get(title(row)) ?? []), row.id]);
    for (const [value, ids] of byTitle) await strapi.db.query(uid).updateMany({ where: { id: { $in: ids } }, data: { title: value } });
    if (rows.length < PAGE) return;
    last = rows[rows.length - 1].id;
  }
}

async function checkBeforePublish(strapi: any, uid: string, documentId: string) {
  const populate = uid === PRODUCT ? { category: { fields: ['id'] } } : { products: { fields: ['id'] }, decor_color: { fields: ['id'] } };
  const draft = await strapi.documents(uid).findOne({ documentId, populate });
  if (!draft) return;
  const missing = uid === PRODUCT
    ? [!draft.name?.trim() && 'назву', !draft.slug && 'адресу (slug)', !draft.category && 'категорію']
    : [!draft.products?.length && 'товар', !draft.decor_color && 'колір', !draft.price && 'ціну'];
  const list = missing.filter(Boolean).join(', ');
  if (list) throw new errors.ValidationError(`Щоб опублікувати, вкажіть: ${list}`);
}

export function registerIdentity(strapi: any) {
  strapi.documents.use(async (context: any, next: () => Promise<any>) => {
    const { uid, action, params } = context;
    const own = uid === PRODUCT || uid === VARIATION;
    if (own && action === 'publish') await checkBeforePublish(strapi, uid, params.documentId);
    if (uid === VARIATION && action === 'create' && params.data && !params.data.slug) params.data.slug = `variation-${randomBytes(6).toString('hex')}`;
    if (uid === PRODUCT && action === 'create' && params.data?.name && !params.data.slug) {
      params.data.slug = await strapi.plugin('content-manager').service('uid').generateUIDField({ contentTypeUID: PRODUCT, field: 'slug', data: params.data });
    }
    const result = await next();
    const documentId = result?.documentId ?? params?.documentId;
    if (documentId && ['create', 'update', 'clone', 'publish', 'discardDraft'].includes(action)) {
      if (uid === VARIATION || uid === COLOR) {
        await syncTitles(strapi, uid, { documentId });
        if (result && 'title' in result) result.title = (await strapi.db.query(uid).findOne({ select: ['title'], where: { id: result.id } }))?.title ?? result.title;
      }
      // A renamed colour, glass, edge… renames its variations.
      const part = Object.keys(PARTS).find((field) => PARTS[field] === uid);
      if (part && action !== 'create') await syncTitles(strapi, VARIATION, { [part]: { documentId } });
      if (uid === PARTS.decor && action !== 'create') await syncTitles(strapi, COLOR, { decor: { documentId } });
    }
    return result;
  });
}

/** Records made before the field existed. */
export async function seedTitles(strapi: any) {
  for (const uid of [COLOR, VARIATION]) await syncTitles(strapi, uid, { title: { $null: true } });
}
