/**
 * `kind` (door / floor / hardware) decides which fields the admin forms show. It is chosen in a root category and
 * inherited by the products under it and their variations. Empty shows every field.
 * `isSub` is a service flag: a form condition cannot look at the parent relation, so it hides `kind` in subcategories.
 */
const CATEGORY = 'api::category.category';
const PRODUCT = 'api::product.product';
const VARIATION = 'api::product-variation.product-variation';
const DEFAULTS: Record<string, string> = { dveri: 'door', pidloha: 'floor', furnitura: 'hardware' };

type Row = { id: number; documentId: string; kind: string | null; isSub: boolean | null; parent?: { id: number } | null };

/** Categories (drafts and published rows) and the kind of their root. */
async function categoryTree(strapi: any) {
  const rows: Row[] = await strapi.db.query(CATEGORY).findMany({ select: ['id', 'documentId', 'kind', 'isSub'], populate: { parent: { select: ['id'] } } });
  const byId = new Map(rows.map((row) => [row.id, row]));
  const path = (row?: Row) => {
    const out: Row[] = [];
    for (let item = row; item && !out.includes(item); item = item.parent ? byId.get(item.parent.id) : undefined) out.push(item);
    return out;
  };
  return { rows, kind: (id?: number) => path(id ? byId.get(id) : undefined).at(-1)?.kind ?? null };
}

// Plain database writes: no lifecycle loop, and the draft does not become "modified".
async function setKind(strapi: any, uid: string, documentIds: string[], kind: string | null) {
  for (let i = 0; i < documentIds.length; i += 200) {
    await strapi.db.query(uid).updateMany({ where: { documentId: { $in: documentIds.slice(i, i + 200) } }, data: { kind } });
  }
}
const unique = (rows: { documentId: string }[]) => [...new Set(rows.map((row) => row.documentId))];

/** Any category may have moved in the tree: re-checks them all, writes only what differs. */
async function syncCategories(strapi: any) {
  const { rows, kind } = await categoryTree(strapi);
  for (const row of rows) {
    if (row.isSub !== !!row.parent) await strapi.db.query(CATEGORY).update({ where: { id: row.id }, data: { isSub: !!row.parent } });
    const value = kind(row.id);
    const draft = { publishedAt: null, category: { id: row.id } };
    const stale = async (uid: string, where: any) => unique((await strapi.db.query(uid).findMany({ select: ['documentId', 'kind'], where }))
      .filter((item: any) => (item.kind ?? null) !== value));
    await setKind(strapi, PRODUCT, await stale(PRODUCT, draft), value);
    await setKind(strapi, VARIATION, await stale(VARIATION, { publishedAt: null, products: draft }), value);
  }
}

async function syncProduct(strapi: any, documentId: string) {
  const rows = await strapi.db.query(PRODUCT).findMany({ where: { documentId }, populate: { category: true, product_variations: { select: ['documentId'] } } });
  const draft = rows.find((row: any) => !row.publishedAt) ?? rows[0];
  if (!draft) return null;
  const kind = (await categoryTree(strapi)).kind(draft.category?.id);
  await setKind(strapi, PRODUCT, [documentId], kind);
  await setKind(strapi, VARIATION, unique(rows.flatMap((row: any) => row.product_variations)), kind);
  return kind;
}

async function syncVariation(strapi: any, documentId: string) {
  const rows = await strapi.db.query(VARIATION).findMany({ where: { documentId }, populate: { products: { populate: { category: true } } } });
  const draft = rows.find((row: any) => !row.publishedAt) ?? rows[0];
  if (!draft) return null;
  const kind = (await categoryTree(strapi)).kind(draft.products?.[0]?.category?.id);
  await setKind(strapi, VARIATION, [documentId], kind);
  return kind;
}

export function registerKind(strapi: any) {
  strapi.documents.use(async (context: any, next: () => Promise<any>) => {
    const result = await next();
    if (!['create', 'update', 'clone', 'publish'].includes(context.action)) return result;
    const documentId = result?.documentId ?? context.params?.documentId;
    if (!documentId) return result;
    if (context.uid === CATEGORY) await syncCategories(strapi);
    if (context.uid === PRODUCT || context.uid === VARIATION) {
      const kind = await (context.uid === PRODUCT ? syncProduct : syncVariation)(strapi, documentId);
      if (result && 'kind' in result) result.kind = kind;
    }
    return result;
  });
}

/** First start with the field: the known root categories get their kind. Later changes in the admin stay. */
export async function seedCategoryKinds(strapi: any) {
  const marker = strapi.store({ type: 'plugin', name: 'content-manager', key: 'nova-category-kinds' });
  if (await marker.get()) return syncCategories(strapi);
  for (const [slug, kind] of Object.entries(DEFAULTS)) await strapi.db.query(CATEGORY).updateMany({ where: { slug, kind: null }, data: { kind } });
  await marker.set({ value: true });
  await syncCategories(strapi);
}
