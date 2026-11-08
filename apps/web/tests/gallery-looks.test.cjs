const assert = require('node:assert/strict');
const path = require('node:path');
const { loader } = require('./load-ts.cjs');
const { galleryLooks, lookImage } = loader()(path.join(__dirname, '../src/lib/catalog/variations.ts'));

const defs = [{ key: 'кромка', display_name: 'Кромка' }, { key: 'ширина_мм', display_name: 'Ширина, мм' }];
const row = (slug, color, edge, width, image) => ({ slug, name: slug, price: 1, image,
  decor: { name: 'Sincrolam' }, decor_color: { name: color }, decor_glass: { name: 'Глухе' },
  attribute_definitions: defs, catalog_attributes: { 'кромка': edge, 'ширина_мм': width } });
const rows = [
  row('oak-alu-800', 'Дуб', 'Алюмінієва', '800', ''),          // no own photo
  row('oak-black-800', 'Дуб', 'Чорна матова', '800', '/oak.jpg'),
  row('oak-alu-900', 'Дуб', 'Алюмінієва', '900', ''),
  row('nut-alu-800', 'Горіх', 'Алюмінієва', '800', '/nut.jpg'),
  row('nut-black-800', 'Горіх', 'Чорна матова', '800', '/nut.jpg'),
];

// another edge without its own photo shows the same colour's photo, not another colour
assert.equal(lookImage(rows, rows[0]), '/oak.jpg');
const g = galleryLooks(rows, rows[0]);
assert.equal(g.items.length, 2, 'one thumbnail per colour, not per edge/width');
assert.deepEqual(g.items.map(i => i.image), ['/oak.jpg', '/nut.jpg']);
assert.equal(g.items[g.activeIndex].image, '/oak.jpg', 'gallery stays on the selected colour');
// picking another colour keeps the chosen edge and width
assert.equal(g.select(g.items[1]).slug, 'nut-alu-800');
assert.equal(galleryLooks(rows, rows[1]).select(g.items[1]).slug, 'nut-black-800');
// a variation with its own edge-specific photo still shows the look's one photo
const own = [...rows, row('oak-black-900', 'Дуб', 'Чорна матова', '900', '/oak.jpg'), row('oak-gold-800', 'Дуб', 'Золота', '800', '/oak-gold-edge.jpg')];
assert.equal(lookImage(own, own.at(-1)), '/oak.jpg');
assert.equal(galleryLooks(own, own.at(-1)).items.length, 2);
// a visible attribute (construction) is a separate look with its own photo
const defs2 = [...defs, { key: 'конструкція', display_name: 'Конструкція' }];
const c1 = { ...rows[1], slug: 'c1', attribute_definitions: defs2, catalog_attributes: { ...rows[1].catalog_attributes, 'конструкція': 'Розсувні' }, image: '/slide.jpg' };
const c2 = { ...rows[1], slug: 'c2', attribute_definitions: defs2, catalog_attributes: { ...rows[1].catalog_attributes, 'конструкція': 'Звичайні' }, image: '/oak.jpg' };
assert.equal(lookImage([c1, c2], c1), '/slide.jpg');
console.log('PASS: photo per look, edge change keeps colour photo, gallery keeps edge');
