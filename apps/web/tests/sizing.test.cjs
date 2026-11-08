const assert = require('node:assert/strict');
const path = require('node:path');
const { loader } = require('./load-ts.cjs');
const load = loader();
const sizing = load(path.join(__dirname, '../src/lib/catalog/sizing.ts'));
const { configuredItem } = load(path.join(__dirname, '../src/lib/catalog/configured-item.ts'));

const defs = [
  { key: 'ширина_мм', display_name: 'Ширина, мм' },
  { key: 'висота_мм', display_name: 'Висота, мм' },
  { key: 'сторона_відкривання', display_name: 'Сторона відкривання' },
];
const row = (slug, color, width, height, side, price) => ({
  slug, name: slug, price, image: '', decor: { name: 'Екошпон' }, decor_color: { name: color }, decor_glass: { name: 'Сатин' },
  attribute_definitions: defs, catalog_attributes: { 'ширина_мм': width, 'висота_мм': height, 'сторона_відкривання': side },
});
const rows = [
  row('n600', 'Нордік', '600', '2000', 'Ліве', 2500),
  row('n800', 'Нордік', '800', '2000', 'Ліве', 2500),
  row('n900', 'Нордік', '900', '2000', 'Ліве', 2600),
  row('n800r', 'Нордік', '800', '2000', 'Праве', 2500),
  row('b700', 'Білий', '700', '2000', 'Ліве', 3992),
];

// sizes come from the variations; only rows matching colour, glass and side count
assert.deepEqual(sizing.sizeKeys(rows), { width: 'ширина_мм', height: 'висота_мм' });
const std = sizing.standardSizes(rows, rows[1]);
assert.deepEqual(std.widths, [600, 800, 900]);
assert.deepEqual(std.heights, [2000]);
assert.equal(sizing.variationForSize(rows, rows[1], { width: 900 }).slug, 'n900');
assert.equal(sizing.variationForSize(rows, rows[3], { width: 800 }).slug, 'n800r', 'keeps the side');

// one-off surcharge: +15% other width, +20% other height, both multiply; standard size: no surcharge
const base = { width: 800, height: 2000 };
assert.equal(sizing.sizeSurcharge(base, { width: 800, height: 2000 }), 1);
assert.equal(sizing.sizedPrice(2500, sizing.sizeSurcharge(base, { width: 650, height: 2000 })), 2875);
assert.equal(sizing.sizedPrice(2500, sizing.sizeSurcharge(base, { width: 800, height: 2100 })), 3000);
assert.equal(sizing.sizedPrice(2500, sizing.sizeSurcharge(base, { width: 1000, height: 2200 })), 3450);
// products without sizes in the file keep the old behaviour (no keys, no surcharge)
assert.deepEqual(sizing.sizeKeys([{ ...rows[0], attribute_definitions: [], catalog_attributes: {} }]), { width: undefined, height: undefined });

// cart: custom size is a separate line with the size and the surcharged price
const custom = configuredItem({ ...rows[1], price: 2875 }, 'Гранд Lux-1', [], { width: 650, height: 2000 });
const plain = configuredItem(rows[1], 'Гранд Lux-1', []);
assert.notEqual(custom.id, plain.id);
assert.deepEqual(custom.size, { width: 650, height: 2000 });
assert.equal(custom.price, 2875);
assert.ok(custom.mods.includes('Нестандартний розмір: 650×2000 мм'));
assert.ok(!custom.mods.some(mod => /^Ширина/.test(mod)), 'no misleading standard width next to the custom size');
assert.ok(plain.mods.includes('Ширина, мм: 800'));
assert.equal(plain.size, undefined);
console.log('PASS: standard sizes from variations, custom-size surcharge, cart line');
