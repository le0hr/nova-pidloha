// Run by the isolated CMS smoke harness after importing the corrected test workbook.
const assert = require('node:assert/strict');
const path = require('node:path');
const { loader } = require('./load-ts.cjs');
async function main() {
  const load = loader();
  const { getCategories } = load(path.join(__dirname, '../src/lib/services/category.service.ts'));
  const { getProducts, getFilters } = load(path.join(__dirname, '../src/lib/services/catalog.service.tsx'));
  const { categoryScope } = load(path.join(__dirname, '../src/lib/catalog/categories.ts'));
  const categories = await getCategories();
  const doors = categories.find(c => c.name === 'Двері' && !c.parent);
  const floor = categories.find(c => c.name === 'Підлога' && !c.parent);
  assert.ok(doors);
  assert.ok(floor);
  const doorSlugs = categoryScope(categories, doors).map(c => c.slug);
  assert.equal(doorSlugs.length, 2);
  const groups = await getFilters(doorSlugs);
  const doorProducts = await getProducts({}, groups, doorSlugs);
  assert.deepEqual(doorProducts.products.map(p => p.name).sort(), ['Bariano', 'Loft Plato']);
  assert.equal(doorProducts.pagination.total, 2);
  const floorProducts = await getProducts({}, [], categoryScope(categories, floor).map(c => c.slug));
  assert.equal(floorProducts.products.length, 1);
  assert.equal(floorProducts.products[0].name, 'Test floor');
  assert.equal(floorProducts.products[0].price, 100);
  assert.ok(floorProducts.products[0].images.length);
  assert.equal((await getProducts({}, [], ['nonexistent-category'])).pagination.total, 0);
  console.log('CATEGORY LIVE PASSED: imported header slugs resolve to 2 door products and 1 floor product, including class relations, correct totals and standalone price/image.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
