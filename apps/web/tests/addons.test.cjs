const assert = require('node:assert/strict');
const test = require('node:test');
const { loader } = require('./load-ts.cjs');
const base = require('node:path').join(__dirname, '../src/');
const { normalizeAddon, groupAddons, addonGroup, selectedAddons, addonTotal, configuredCartId } = loader()(base+'lib/catalog/addons.ts');
test('imported surcharge, zero, negative and fallback prices', () => {
 assert.equal(normalizeAddon({documentId:'a',name:'Box',additionalCost:'1020',price:'50'}).price,1020);
 assert.equal(normalizeAddon({documentId:'a',name:'Box',additionalCost:'0',price:'50'}).price,0);
 assert.equal(normalizeAddon({documentId:'a',name:'Box',additionalCost:'-50'}).price,-50);
 assert.equal(normalizeAddon({documentId:'a',name:'Box',price:'25.5'}).price,25.5);
});
test('one option per group, independent ungrouped options, distinct cart configurations', () => {
 const addons=[{id:'a',name:'A',group:'Box',price:10},{id:'b',name:'B',group:'Box',price:20},{id:'c',name:'C',group:null,price:5}];
 assert.equal(groupAddons(addons).length,2);
 const chosen=selectedAddons(addons,{[addonGroup(addons[0])]:'b',[addonGroup(addons[2])]:'c'});
 assert.equal(addonTotal(chosen),25);
 assert.equal(configuredCartId('door',chosen),configuredCartId('door',[...chosen].reverse()));
 assert.notEqual(configuredCartId('door',chosen),configuredCartId('door',[]));
 assert.equal(selectedAddons(addons,{[addonGroup(addons[0])]:''}).length,0);
});
test('product service fetches and normalizes CMS add-ons', async () => {
 const service=loader({'@/lib/catalog/addons':{normalizeAddon},'@/lib/client':{graphqlFetch:async(query)=>{
  assert.match(query,/addons\s*\{/); assert.match(query,/additionalCost/);
  return {products:[{name:'Door',addons:[{documentId:'box',name:'Box',group:'Frame',additionalCost:'1020'}],product_variations:[]}]};
 }}})(base+'lib/services/product.service.tsx');
 const product=await service.getProductBySlug('door');
 assert.deepEqual(product.addons,[{id:'box',name:'Box',group:'Frame',price:1020}]);
});
