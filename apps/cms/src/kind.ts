/**
 * `kind` (door / floor / hardware) decides which fields the admin forms show. It is never typed in: a product takes it
 * from the root of its category, a variation from its product. Empty (no category, another root) shows every field.
 */
const PRODUCT = 'api::product.product';
const VARIATION = 'api::product-variation.product-variation';
const KINDS: Record<string, string> = { dveri: 'door', mizhkimnatni: 'door', pidloha: 'floor', furnitura: 'hardware' };

async function categoryKind(strapi: any, id?: number): Promise<string | null> {
  const seen = new Set<number>();
  let category = id ? await strapi.db.query('api::category.category').findOne({ where: { id }, populate: { parent: true } }) : null;
  while (category?.parent && !seen.has(category.id)) {
    seen.add(category.id);
    category = await strapi.db.query('api::category.category').findOne({ where: { id: category.parent.id }, populate: { parent: true } });
  }
  return KINDS[category?.slug] ?? null;
}

// Plain database writes: no lifecycle loop, and the draft does not become "modified".
async function setKind(strapi: any, uid: string, documentIds: string[], kind: string | null) {
  if (documentIds.length) await strapi.db.query(uid).updateMany({ where: { documentId: { $in: documentIds } }, data: { kind } });
}

async function syncProduct(strapi: any, documentId: string) {
  const rows = await strapi.db.query(PRODUCT).findMany({ where: { documentId }, populate: { category: true, product_variations: { select: ['documentId'] } } });
  const draft = rows.find((row: any) => !row.publishedAt) ?? rows[0];
  if (!draft) return null;
  const kind = await categoryKind(strapi, draft.category?.id);
  await setKind(strapi, PRODUCT, [documentId], kind);
  const variations = [...new Set<string>(rows.flatMap((row: any) => row.product_variations.map((v: any) => v.documentId)))];
  for (let i = 0; i < variations.length; i += 200) await setKind(strapi, VARIATION, variations.slice(i, i + 200), kind);
  return kind;
}

async function syncVariation(strapi: any, documentId: string) {
  const rows = await strapi.db.query(VARIATION).findMany({ where: { documentId }, populate: { products: { populate: { category: true } } } });
  const draft = rows.find((row: any) => !row.publishedAt) ?? rows[0];
  if (!draft) return null;
  const kind = await categoryKind(strapi, draft.products?.[0]?.category?.id);
  await setKind(strapi, VARIATION, [documentId], kind);
  return kind;
}

export function registerKind(strapi: any) {
  strapi.documents.use(async (context: any, next: () => Promise<any>) => {
    const result = await next();
    if (![PRODUCT, VARIATION].includes(context.uid) || !['create', 'update', 'clone', 'publish'].includes(context.action)) return result;
    const documentId = result?.documentId ?? context.params?.documentId;
    if (documentId) {
      const kind = await (context.uid === PRODUCT ? syncProduct : syncVariation)(strapi, documentId);
      if (result && 'kind' in result) result.kind = kind;
    }
    return result;
  });
}
