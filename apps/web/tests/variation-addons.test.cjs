const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {loader} = require('./load-ts.cjs');
const root = path.join(__dirname, '../src');

test('loads all per-variation add-ons across capped pages and normalizes surcharges', async () => {
  const addons = Array.from({length: 7}, (_, i) => ({documentId: `a${i}`, name: `Frame ${i}`, group: 'Frame', additionalCost: String(i * 10)}));
  const rows = [{slug: 'v1', price: '100', addons}, {slug: 'v2', price: '200', addons: []}];
  const service = loader({'@/lib/client': {graphqlFetch: async (query, vars) => {
    assert.match(query, /addons\(pagination: \{start: \$addonStart, limit: 100\}/);
    return {products: [{name: 'Door', product_variations: rows.slice(vars.variationStart, vars.variationStart + 1).map(row => ({...row, addons: row.addons.slice(vars.addonStart, vars.addonStart + 2)}))}]};
  }}})(path.join(root, 'lib/services/product.service.tsx'));
  const product = await service.getProductBySlug('door');
  assert.equal(product.variations.length, 2);
  assert.equal(product.variations[0].addons.length, 7);
  assert.equal(product.variations[0].addons[6].price, 60);
  assert.deepEqual(product.variations[1].addons, []);
});

test('page displays selected variation add-ons and clears selection on gallery and configurator changes', () => {
  let cursor = 0;
  const state = [];
  const mocks = {react: {
    useMemo: fn => fn(),
    useState: initial => {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
      return [state[index], value => {state[index] = typeof value === 'function' ? value(state[index]) : value;}];
    },
  }};
  const components = ['AccesoriesSelector', 'AddToCartButton', 'ProductGallery', 'DoorVariationSelector', 'TableVariationSelector', 'FloorConfigurator'];
  for (const name of components) mocks[`@/components/product/${name}`] = {__esModule: true, default: name};
  const Page = loader(mocks)(path.join(root, 'app/(shop)/product/[slug]/ProductInteractive.tsx')).default;
  const a = {id: 'a', name: 'Oak frame', group: 'Frame', price: 10};
  const b = {id: 'b', name: 'White frame', group: 'Frame', price: 20};
  const variation = (slug, color, addons) => ({slug, price: 100, image: '', decor: {name: 'PP'}, decor_color: {name: color}, decor_glass: null, addons});
  const product = {name: 'Door', category: {slug: 'doors'}, variations: [variation('v1', 'Oak', [a]), variation('v2', 'White', [b]), variation('v3', 'Grey', [])]};
  const {addonGroup} = loader()(path.join(root, 'lib/catalog/addons.ts'));
  function render() {
    cursor = 0;
    const found = {};
    function walk(node) {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) return node.forEach(walk);
      if (components.includes(node.type)) found[node.type] = node.props;
      walk(node.props?.children);
    }
    walk(Page({product}));
    return found;
  }
  let view = render();
  assert.deepEqual(view.AccesoriesSelector.addons, [a]);
  view.AccesoriesSelector.onChange({[addonGroup(a)]: 'a'});
  assert.deepEqual(render().AddToCartButton.addons, [a]);
  view.ProductGallery.onSelectVariation(product.variations[1]);
  view = render();
  assert.deepEqual(view.AccesoriesSelector.addons, [b]);
  assert.deepEqual(view.AccesoriesSelector.selected, {});
  assert.deepEqual(view.AddToCartButton.addons, []);
  view.AccesoriesSelector.onChange({[addonGroup(b)]: 'b'});
  view = render();
  assert.deepEqual(view.AddToCartButton.addons, [b]);
  view.DoorVariationSelector.onChange({decor_color: 'Grey'});
  view = render();
  assert.deepEqual(view.AccesoriesSelector.addons, []);
  assert.deepEqual(view.AccesoriesSelector.selected, {});
  assert.deepEqual(view.AddToCartButton.addons, []);
});
