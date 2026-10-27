const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { loader } = require('./load-ts.cjs');
const categories = [
  { documentId: 'floor', name: 'Підлога', slug: 'pidloha', parent: null },
  { documentId: 'vinyl', name: 'Вініл', slug: 'вініл', parent: { documentId: 'floor' }, image: { url: '/uploads/vinyl.jpg' } },
  { documentId: 'laminate', name: 'Ламінат', slug: 'laminat', parent: { documentId: 'floor' } },
  { documentId: 'doors', name: 'Двері', slug: 'dveri', parent: null },
];
const load = loader({
  'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
  'next/image': { __esModule: true, default: ({ fill, unoptimized, ...props }) => React.createElement('img', props) },
  '@/lib/client': { mediaUrl: url => new URL(url, 'https://cms.example').toString() },
});
const Selector = load(path.join(__dirname, '../src/components/catalog/SubclassSelector.tsx')).default;
const render = current => renderToStaticMarkup(React.createElement(Selector, { categories, current }));

test('parent shows only its subclasses, category photos, and encoded links', () => {
  const html = render(categories[0]);
  assert.match(html, /href="\/catalog\/pidloha" aria-current="page"/);
  assert.ok(html.includes('/catalog/' + encodeURIComponent('вініл')));
  assert.match(html, /https:\/\/cms.example\/uploads\/vinyl.jpg/);
  assert.match(html, /\/images\/home\/laminate.png/);
  assert.doesNotMatch(html, /\/catalog\/dveri/);
});
test('child keeps siblings visible and selects the current subclass', () => {
  const html = render(categories[1]);
  assert.ok(html.includes(`href="/catalog/${encodeURIComponent('вініл')}" aria-current="page"`));
  assert.match(html, /href="\/catalog\/laminat"/);
  assert.match(html, /Усі товари: Підлога/);
});
test('standalone category does not show an empty selector', () => {
  assert.equal(render(categories[3]), '');
});
