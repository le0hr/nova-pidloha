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
        // CMS graphql maxLimit is 100 (apps/cms/config/plugins.ts).
        return { products: [{ product_variations: rows.slice(variables.start, variables.start + 100) }] };
      }
      return { products: [{ name: 'Door', slug: 'door', price: null, image: null,
        product_variations: rows.slice(0, 100) }], products_connection: { pageInfo } };
    },
  } })(path.join(__dirname, '../src/lib/services/catalog.service.tsx'));
  const result = await getProducts({ page: '2' }, [], ['doors']);
  assert.equal(result.products[0].price, 50);
  assert.deepEqual(result.products[0].images, ['https://cms.example/last.jpg']);
  assert.deepEqual(result.pagination, pageInfo);
  // Full pages continue; the short last page (5) ends the loop without an extra empty request.
  assert.deepEqual(starts, [100, 200]);
});

test('price sorting, filtering and bounds are done by the CMS on product price (one page, no full download)', async () => {
  const calls = [];
  const { getProducts, getFilters, CATALOG_PAGE_SIZE: size } = loader({ '@/lib/client': {
    mediaUrl: url => url,
    graphqlFetch: async (query, variables) => {
      const name = query.match(/query (\w+)/)[1];
      calls.push({ name, variables });
      if (name === 'CategoryFilters') return { filterGroups: [{ name: 'Ціна', slug: 'price', type: 'price', filter_values: [] }], filterGroups_connection: { pageInfo: { pageCount: 1 } } };
      if (name === 'PriceBounds') return { cheapest: [{ price: '9.5' }], priciest: [{ price: '120.2' }] };
      if (name === 'GetProducts') return { products: [{ name: 'P', slug: 'p', price: '9.5', image: null, product_variations: [] }],
        products_connection: { pageInfo: { page: variables.pagination.page, pageSize: size, pageCount: 2, total: 30 } } };
      throw new Error('unexpected query ' + name);
    },
  } })(path.join(__dirname, '../src/lib/services/catalog.service.tsx'));
  const priceFilter = v => v.filters.and.find(item => item.price)?.price;

  assert.equal(size % 2 + size % 3 + size % 4, 0, 'page size fills 2, 3 and 4 column grids');
  await getProducts({ sort: 'price_asc', page: '2' }, [], ['doors']);
  await getProducts({ sort: 'price_desc' }, [], ['doors']);
  assert.deepEqual(calls.map(c => c.variables.sort), [['price:asc', 'documentId:asc'], ['price:desc', 'documentId:asc']]);
  assert.deepEqual(calls.map(c => c.variables.pagination), [{ page: 2, pageSize: size }, { page: 1, pageSize: size }]);

  calls.length = 0;
  await getProducts({ price_min: '0', price_max: '10' }, [], ['doors']);
  // A price group with another slug, and "from" larger than "to", still becomes one sorted range.
  await getProducts({ cost_min: '120', cost_max: '110' }, [{ slug: 'cost', type: 'price', filter_values: [] }], ['doors']);
  assert.deepEqual(calls.map(c => priceFilter(c.variables)), [{ gte: 0, lte: 10 }, { gte: 110, lte: 120 }]);
  assert.ok(calls.every(c => c.name === 'GetProducts'), 'one CMS page query per catalog page');

  calls.length = 0;
  const groups = await getFilters(['doors']);
  assert.deepEqual([groups[0].min, groups[0].max], [9, 121]);
  assert.deepEqual(calls.map(c => c.name).filter(n => n !== 'FilterPopularity'), ['CategoryFilters', 'PriceBounds']);
  assert.deepEqual(calls.find(c => c.name === 'PriceBounds').variables.filters.and.at(-1), { price: { notNull: true } });
});
