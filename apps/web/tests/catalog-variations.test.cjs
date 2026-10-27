const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const { loader } = require('./load-ts.cjs');

test('catalog includes cheaper variations and images beyond the first CMS page', async () => {
  const rows = Array.from({ length: 205 }, (_, i) => ({
    active: true, price: i === 204 ? '50' : '100',
    image: i === 204 ? { url: '/last.jpg' } : null,
  }));
  const starts = [];
  const pageInfo = { page: 2, pageSize: 20, pageCount: 3, total: 45 };
  const { getProducts } = loader({ '@/lib/client': {
    mediaUrl: url => `https://cms.example${url}`,
    graphqlFetch: async (query, variables) => {
      assert.match(query, /sort: \["documentId:asc"\]/);
      if (query.includes('CatalogVariations')) {
        assert.equal(variables.slug, 'door');
        starts.push(variables.start);
        return { products: [{ product_variations: rows.slice(variables.start, variables.start + 25) }] };
      }
      return { products: [{ name: 'Door', slug: 'door', price: null, image: null,
        product_variations: rows.slice(0, 25) }], products_connection: { pageInfo } };
    },
  } })(path.join(__dirname, '../src/lib/services/catalog.service.tsx'));
  const result = await getProducts({ page: '2' }, [], ['doors']);
  assert.equal(result.products[0].price, 50);
  assert.deepEqual(result.products[0].images, ['https://cms.example/last.jpg']);
  assert.deepEqual(result.pagination, pageInfo);
  assert.deepEqual(starts, [25, 50, 75, 100, 125, 150, 175, 200, 205]);
});

test('price sorting and filtering include variant prices across all pages', async () => {
  const rows = Array.from({ length: 23 }, (_, i) => ({ name: `P${i}`, slug: `p${i}`,
    price: i === 22 ? null : String(100 + i), image: null,
    product_variations: i === 22 ? [{ active: true, price: '9.5', image: null }] : [] }));
  const { getProducts, getFilters } = loader({ '@/lib/client': {
    mediaUrl: url => url,
    graphqlFetch: async (query, variables) => {
      if (query.includes('CategoryFilters')) return { filterGroups: [{ name: 'Ціна', slug: 'price', type: 'price', filter_values: [] }], filterGroups_connection: { pageInfo: { pageCount: 1 } } };
      if (query.includes('CatalogVariations')) return { products: [{ product_variations: [] }] };
      assert.equal(JSON.stringify(variables.filters).includes('"price"'), false);
      const page = variables.pagination.page;
      return { products: rows.slice((page - 1) * 20, page * 20), products_connection: {
        pageInfo: { page, pageSize: 20, pageCount: 2, total: 23 } } };
    },
  } })(path.join(__dirname, '../src/lib/services/catalog.service.tsx'));
  const sorted = await getProducts({ sort: 'price_asc' }, [], ['doors']);
  assert.equal(sorted.products[0].price, 9.5);
  assert.equal(sorted.products.length, 20);
  assert.equal(sorted.pagination.total, 23);
  const filtered = await getProducts({ price_min: '0', price_max: '10' }, [], ['doors']);
  assert.deepEqual(filtered.products.map(p => p.price), [9.5]);
  assert.equal(filtered.pagination.total, 1);
  const descending = await getProducts({ cost_min: '120', cost_max: '110', sort: 'price_desc' },
    [{ slug: 'cost', type: 'price', filter_values: [] }], ['doors']);
  assert.equal(descending.products[0].price, 120);
  assert.equal(descending.products.at(-1).price, 110);
  const groups = await getFilters(['doors']);
  assert.equal(groups[0].min, 9);
  assert.equal(groups[0].max, 121);
});
