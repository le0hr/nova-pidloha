const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { loader } = require('./load-ts.cjs');
const src = name => path.join(__dirname, '../src', name);
const categories = [
  {documentId: 'doors', name: 'Двері', slug: 'categories-imported-doors', parent: null},
  {documentId: 'interior', name: 'Міжкімнатні', slug: 'imported-interior', parent: {documentId: 'doors'}},
  {documentId: 'floor', name: 'Підлога', slug: 'categories-imported-floor', parent: null},
];

test('header links use imported root slugs and highlight the parent on a child page', () => {
  const load = loader({
    'next/navigation': {usePathname: () => '/catalog/imported-interior'},
    'next/link': {__esModule: true, default: ({children, ...props}) => React.createElement('a', props, children)},
  });
  const Navigation = load(src('components/layout/shop/Navigation.tsx')).default;
  const html = renderToStaticMarkup(React.createElement(Navigation, {categories}));
  assert.match(html, /href="\/catalog\/categories-imported-doors" aria-current="page"/);
  assert.match(html, /href="\/catalog\/categories-imported-floor"/);
  assert.doesNotMatch(html, /mizhkimnatni-dveri|\/catalog\/pidloha|href="\/catalog\/imported-interior"/);
  const mobile = renderToStaticMarkup(React.createElement(Navigation, {categories, mobile: true}));
  assert.match(mobile, /categories-imported-doors/);
});

test('selected root includes its imported class but never another root', () => {
  const {categoryScope} = loader()(src('lib/catalog/categories.ts'));
  assert.deepEqual(categoryScope(categories, categories[0]).map(c => c.documentId), ['doors', 'interior']);
  assert.deepEqual(categoryScope(categories, categories[2]).map(c => c.documentId), ['floor']);
});

test('service sends category scope to both listing and total; uses standalone product price/image', async () => {
  const calls = [];
  const load = loader({'@/lib/client': {
    mediaUrl: url => new URL(url, 'https://cms.example').toString(),
    graphqlFetch: async (query, variables) => {
      calls.push({query, variables});
      return {products: [{name: 'Floor', slug: 'floor-2001', price: '100', image: {url: '/uploads/floor.jpg'}, product_variations: []}],
        products_connection: {pageInfo: {page: 1, pageSize: 20, pageCount: 1, total: 1}}};
    },
  }});
  const {getProducts} = load(src('lib/services/catalog.service.tsx'));
  const result = await getProducts({}, [], ['categories-imported-floor']);
  assert.deepEqual(calls[0].variables.filters.and[0], {category: {slug: {in: ['categories-imported-floor']}}});
  assert.match(calls[0].query, /products_connection\(status: PUBLISHED, filters: \$filters/);
  assert.equal(result.products[0].price, 100);
  assert.equal(result.products[0].images[0], 'https://cms.example/uploads/floor.jpg');
  assert.equal(result.pagination.total, 1);
});

test('category loader follows CMS pagination and uses published categories', async () => {
  const pages = [];
  const load = loader({'@/lib/client': {graphqlFetch: async (query, variables) => {
    assert.match(query, /status: PUBLISHED/);
    pages.push(variables.page);
    return {categories: variables.page === 1 ? categories.slice(0, 2) : categories.slice(2), categories_connection: {pageInfo: {pageCount: 2}}};
  }}});
  const {getCategories} = load(src('lib/services/category.service.ts'));
  assert.equal((await getCategories()).length, 3);
  assert.deepEqual(pages, [1, 2]);
});
