/**
 * Product price ("від" on cards, sorting and the price filter) = the lowest price of its active variations, kept
 * separately for the draft and the published version. A product without such variations keeps its price.
 */
const PRODUCT = 'api::product.product';
const VARIATION = 'api::product-variation.product-variation';
const ACTIONS = ['create', 'update', 'clone', 'publish', 'unpublish', 'discardDraft', 'delete'];

const productsOf = async (strapi: any, documentId?: string): Promise<string[]> => (documentId
  ? (await strapi.db.query(VARIATION).findMany({ where: { documentId }, populate: { products: { select: ['documentId'] } } }))
    .flatMap((row: any) => row.products.map((product: any) => product.documentId))
  : []);

async function syncPrice(strapi: any, documentId: string) {
  for (const publishedAt of [{ $null: true }, { $notNull: true }]) {
    const product = await strapi.db.query(PRODUCT).findOne({ select: ['id', 'price'], where: { documentId, publishedAt } });
    if (!product) continue;
    const rows = await strapi.db.query(VARIATION).findMany({ select: ['price', 'active'], where: { publishedAt, products: { documentId } } });
    const prices = rows.filter((row: any) => row.active !== false).map((row: any) => Number(row.price)).filter((price: number) => price > 0);
    if (!prices.length) continue;
    const price = Math.min(...prices);
    // Plain database write: the draft does not become "modified".
    if (Number(product.price) !== price || product.price == null) await strapi.db.query(PRODUCT).update({ where: { id: product.id }, data: { price } });
  }
}

export function registerPrice(strapi: any) {
  strapi.documents.use(async (context: any, next: () => Promise<any>) => {
    if (![PRODUCT, VARIATION].includes(context.uid) || !ACTIONS.includes(context.action)) return next();
    // A variation may leave its product (moved, deleted): the product it had before counts too.
    const before = context.uid === VARIATION ? await productsOf(strapi, context.params?.documentId) : [];
    const result = await next();
    const documentId = result?.documentId ?? context.params?.documentId;
    const products = context.uid === VARIATION ? [...before, ...await productsOf(strapi, documentId)] : [documentId];
    for (const id of new Set(products.filter(Boolean))) await syncPrice(strapi, id);
    if (context.uid === PRODUCT && result && 'price' in result) {
      const row = await strapi.db.query(PRODUCT).findOne({ select: ['price'], where: { id: result.id } });
      if (row) result.price = row.price;
    }
    return result;
  });
}
