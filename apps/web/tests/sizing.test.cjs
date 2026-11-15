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

// non-standard sizes come from CMS rules: rounded up to the step, standard values free, width + height add up
const rules = [
  { dimension: 'height', min: 1700, max: 1990, step: 10, percent: 15 },
  { dimension: 'height', min: 2010, max: 2200, step: 10, percent: 20, decors: 'Білий' },
  { dimension: 'width', min: 450, max: 850, step: 50, percent: 10 },
];
const h = sizing.rulesFor(rules, 'height', 'Екошпон', 'Нордік');
assert.equal(h.length, 1, 'the 2010–2200 range is only for the listed colour');
assert.equal(sizing.rulesFor(rules, 'height', 'Екошпон', 'білий').length, 2);
const allowedH = sizing.allowedValues([2000], h);
assert.equal(sizing.snapSize(1934, allowedH), 1940);
assert.equal(sizing.snapSize(2100, allowedH), 2000, 'above every range: the largest allowed');
assert.equal(sizing.sizePercent(2000, [2000], h), 0);
assert.equal(sizing.sizePercent(1940, [2000], h), 15);
const w = sizing.rulesFor(rules, 'width', '', '');
assert.equal(sizing.snapSize(730, sizing.allowedValues([600, 700, 800, 900], w)), 750);
assert.equal(sizing.sizePercent(750, [600, 700, 800, 900], w) + sizing.sizePercent(1940, [2000], h), 25);
assert.equal(sizing.sizePercent(800, [600, 700, 800, 900], w), 0, 'standard width inside a range stays free');
assert.equal(sizing.sizePercent(900, [600, 700, 800, 900], [{ dimension: 'width', min: 900, max: 900, step: 50, percent: 10 }]), 10, 'a single-value rule is a priced option');
assert.equal(sizing.sizedPrice(2500, 1.25), 3125);
assert.equal(sizing.nearestStandard(750, [600, 700, 800, 900]), 800, 'ties go to the larger size');
assert.deepEqual(sizing.standardFromCharacteristics([{ name: 'Стандартна ширина полотна', value: '400, 600, 700 мм' }]),
  { width: [400, 600, 700], height: [2000] });
// products without sizes in the file keep the old behaviour (no keys, no surcharge)
assert.deepEqual(sizing.sizeKeys([{ ...rows[0], attribute_definitions: [], catalog_attributes: {} }]), { width: undefined, height: undefined });

// cart: the size is on the line; a non-standard one is a separate line with its surcharge
const custom = configuredItem({ ...rows[1], price: 2875 }, 'Гранд Lux-1', [], { width: 650, height: 2000, custom: true, percent: 15 });
const standardLine = configuredItem(rows[1], 'Гранд Lux-1', [], { width: 800, height: 2000 });
const plain = configuredItem(rows[1], 'Гранд Lux-1', []);
assert.notEqual(custom.id, standardLine.id);
assert.deepEqual(custom.size, { width: 650, height: 2000, custom: true, percent: 15 });
assert.equal(custom.price, 2875);
assert.ok(custom.mods.includes('Нестандартний розмір: 650×2000 мм (+15%)'));
assert.ok(!custom.mods.some(mod => /^Ширина/.test(mod)), 'no misleading standard width next to the chosen size');
assert.ok(standardLine.mods.includes('Розмір: 800×2000 мм'));
assert.ok(plain.mods.includes('Ширина, мм: 800'));
assert.equal(plain.size, undefined);
console.log('PASS: standard sizes from variations, CMS size rules, cart line');
