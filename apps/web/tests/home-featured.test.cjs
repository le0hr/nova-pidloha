const assert = require('node:assert/strict');
const path = require('node:path');
const { loader } = require('./load-ts.cjs');
const { homeCardColumns, groupedCardColumns } = loader()(path.join(__dirname, '../src/lib/catalog/home-cards.ts'));
for (const count of [0, 1, 2, 4, 5, 7, 8, 12, 101]) {
  const items = Array.from({ length: count }, (_, id) => ({ id, group: String(id % 3) }));
  const columns = homeCardColumns(items, item => item.group);
  assert.equal(columns.length, Math.min(4, count));
  if (!count) continue;
  const ids = items.map(item => item.id);
  if (count < 8) {
    // Few items: each column is a full carousel, starting from a different card.
    for (const column of columns) assert.deepEqual(column.map(item => item.id).sort((a, b) => a - b), ids);
    assert.equal(new Set(columns.map(column => column[0].id)).size, columns.length);
  } else {
    // Enough items: dealt once, every column still scrolls (>= 2 cards), balanced.
    assert.deepEqual(columns.flat().map(item => item.id).sort((a, b) => a - b), ids);
    assert.ok(columns.every(column => column.length >= 2));
    assert.ok(Math.max(...columns.map(c => c.length)) - Math.min(...columns.map(c => c.length)) <= 1);
  }
}
const mixed = homeCardColumns(['A', 'A', 'A', 'B', 'C', 'D'], item => item);
assert.deepEqual(mixed.map(column => column[0]), ['A', 'B', 'C', 'D']);
// Product carousels: one column per subclass/category.
const by = (list) => groupedCardColumns(list, item => item[0]).map(column => column.join(''));
assert.deepEqual(by(['A1', 'A2', 'B1', 'C1', 'D1']), ['A1A2', 'B1', 'C1', 'D1']);
// more groups than columns: smallest groups join the shortest columns, nothing is lost
assert.deepEqual(by(['A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'C2', 'D1', 'E1']), ['A1A2A3', 'B1B2', 'C1C2', 'D1E1']);
// fewer groups: the largest group is split while both halves keep >= 2 cards
const split = groupedCardColumns(['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2'], item => item[0]);
assert.equal(split.length, 4);
assert.ok(split.every(column => column.length >= 2 && new Set(column.map(item => item[0])).size === 1));
assert.deepEqual(split.flat().sort(), ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2']);
assert.deepEqual(by(['A1', 'A2', 'A3']), ['A1A2A3']);
// a big group is split evenly, not halved repeatedly (8 cards -> 3+3+2, not 4+2+2)
assert.deepEqual(by(['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2']), ['A1A4A7', 'A2A5A8', 'A3A6', 'B1B2']);
assert.deepEqual(by(['A1', 'A2', 'A3', 'A4', 'A5']), ['A1A3A5', 'A2A4']);
assert.deepEqual(groupedCardColumns([], item => item), []);
let calls = 0;
const service = loader({ '@/lib/client': {
  mediaUrl: url => `https://cms.example${url}`,
  graphqlFetch: async (query, variables) => {
    assert.match(query, /status: PUBLISHED/);
    calls++;
    if (query.includes('GetHomeCategories')) return {
      categories: [
        // featured class -> all of its subclasses
        { documentId: 'doors', name: 'Двері', slug: 'dveri', description: null, isFeatured: true, image: null, parent: null },
        { documentId: 'inner', name: 'Міжкімнатні', slug: 'mizhkimnatni', description: null, isFeatured: false, image: null, parent: { documentId: 'doors', name: 'Двері' } },
        { documentId: 'covers', name: 'Накладки', slug: 'nakladky', description: null, isFeatured: null, image: { url: '/covers.jpg' }, parent: { documentId: 'doors', name: 'Двері' } },
        // featured subclass -> shown inside its class
        { documentId: 'floor', name: 'Підлога', slug: 'pidloha', description: null, isFeatured: false, image: null, parent: null },
        { documentId: 'lam', name: 'Ламінат', slug: 'laminat', description: '## Зносостійкі **покриття**\n- мінерально-композитна основа', isFeatured: true, image: null, parent: { documentId: 'floor', name: 'Підлога' } },
        { documentId: 'spc', name: 'SPC', slug: 'spc', description: null, isFeatured: false, image: null, parent: { documentId: 'floor', name: 'Підлога' } },
        // featured class without subclasses -> itself
        { documentId: 'misc', name: 'Фурнітура', slug: 'furnitura', description: null, isFeatured: true, image: null, parent: null },
      ],
      categories_connection: { pageInfo: { pageCount: 1 } },
    };
    assert.match(query, /isFeatured: \{eq: true\}/);
    assert.match(query, /active: \{ne: false\}/);
    assert.doesNotMatch(query, /image: \{url:|price: \{gte/);
    return {
      products: [{ name: `Товар ${variables.page}`, slug: `product-${variables.page}`, shortDescription: variables.page === 1 ? '  Каркасно-щитові двері.  ' : '', price: variables.page === 1 ? '500' : null, image: null, category: { name: 'Ламінат' }, catalog_attributes: variables.page === 1 ? { 'підклас': ' Каркасно-щитові ' } : null, isNew: false,
        product_variations: [{ price: '1000', image: null }, { price: '300', image: { url: '/real.jpg' } }, { price: '', image: null }] }],
      products_connection: { pageInfo: { pageCount: 2 } },
    };
  },
} })(path.join(__dirname, '../src/lib/services/home.service.ts'));
(async () => {
  const products = await service.getHomeProducts();
  assert.equal(products.length, 2);
  assert.equal(products[0].price, 500);
  assert.equal(products[1].price, 300);
  assert.equal(products[0].image, 'https://cms.example/real.jpg');
  assert.deepEqual(products.map(p => p.description), ['Каркасно-щитові двері.', undefined]);
  assert.deepEqual(products.map(p => p.group), ['Каркасно-щитові', 'Ламінат']);
  const categories = await service.getHomeCategories();
  assert.deepEqual(categories.map(c => `${c.group}/${c.name}`), ['Двері/Міжкімнатні', 'Двері/Накладки', 'Підлога/Ламінат', 'Фурнітура/Фурнітура']);
  const laminate = categories.find(c => c.name === 'Ламінат');
  assert.equal(laminate.href, '/catalog/laminat');
  assert.equal(laminate.parentName, 'Підлога');
  assert.equal(laminate.image, '/images/home/laminate.png'); // same fallback picture as the catalog
  assert.equal(categories.find(c => c.name === 'Накладки').image, 'https://cms.example/covers.jpg');
  assert.equal(laminate.description, 'Зносостійкі покриття мінерально-композитна основа');
  assert.equal(calls, 3);
  console.log('PASS: featured filters, pagination, CMS mapping, balanced unique cards and category variety');
})().catch(error => { console.error(error); process.exitCode = 1; });
