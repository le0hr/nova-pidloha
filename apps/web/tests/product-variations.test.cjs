const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const { loader } = require('./load-ts.cjs');

for (const count of [0, 80, 100, 205]) {
  test(`product loads all ${count} variations even when CMS caps pages at 25`, async () => {
    const rows = Array.from({ length: count }, (_, i) => ({
      slug: `variant-${i}`, price: '120', active: i !== 2,
    }));
    const starts = [];
    const service = loader({
      '@/lib/client': { graphqlFetch: async (query, variables) => {
        assert.match(query, /pagination: \{start: \$variationStart, limit: 100\}/);
        assert.match(query, /sort: \["documentId:asc"\]/);
        starts.push(variables.variationStart);
        return { products: [{ name: 'Door', product_variations:
          rows.slice(variables.variationStart, variables.variationStart + 25) }] };
      } },
    })(path.join(__dirname, '../src/lib/services/product.service.tsx'));
    const product = await service.getProductBySlug('door');
    assert.deepEqual(product.variations.map(v => v.slug), rows.filter(v => v.active).map(v => v.slug));
    assert.equal(starts.at(-1), count);
  });
}
