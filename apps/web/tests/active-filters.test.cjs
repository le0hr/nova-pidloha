const assert = require('node:assert/strict');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { loader } = require('./load-ts.cjs');

const render = (query) => {
  const { default: ActiveFilters } = loader({
    'next/navigation': { useSearchParams: () => new URLSearchParams(query) },
    './FilterDrawerContext': { useFilterDrawer: () => ({
      removeFilter() {},
      filterGroups: [
        { name: 'Колір', slug: 'kolir', type: 'color', filter_values: [] },
        { name: 'Бренд', slug: 'brand', type: 'select', filter_values: [] },
        { name: 'Ціна', slug: 'price', type: 'price', filter_values: [], min: 0, max: 9000 },
      ],
    }) },
  })(path.join(__dirname, '../src/components/catalog/ActiveFilters.tsx'));
  return renderToStaticMarkup(React.createElement(ActiveFilters));
};

// Pagination and sorting are not filters.
assert.equal(render('page=2'), '');
assert.equal(render('page=3&sort=price:asc&utm_source=fb&price_min=100&price_max=500'), '');
const html = render('page=2&sort=price:asc&brand=darumi,korfad&kolir=bilyi');
assert.match(html, /Активні фільтри/);
for (const value of ['darumi', 'korfad', 'bilyi']) assert.match(html, new RegExp(`${value} ×`));
assert.doesNotMatch(html, /2 ×|price:asc/);
console.log('PASS: active filters ignore page, sort and other non-filter params');
