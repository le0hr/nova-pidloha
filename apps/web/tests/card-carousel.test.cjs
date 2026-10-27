const assert = require('node:assert/strict');
const React = require('react');
const { loader } = require('./load-ts.cjs');
let cursor = 0;
const state = [];
const effects = [];
let pending = [];
const timers = new Map();
let timerId = 0;
const register = fn => { const id = ++timerId; timers.set(id, fn); return () => timers.delete(id); };
const hooks = { ...React,
  useContext() { return register; },
  useEffect(fn, deps) { const i = cursor++; const prev = effects[i]; if (!prev || deps.some((value, index) => !Object.is(value, prev.deps[index]))) pending.push(() => { prev?.cleanup?.(); effects[i] = { deps, cleanup: fn() }; }); },
  useRef(value) { const i = cursor++; return state[i] ?? (state[i] = { current: value }); },
  useState(value) { const i = cursor++; if (!(i in state)) state[i] = value; return [state[i], next => { state[i] = typeof next === 'function' ? next(state[i]) : next; }]; },
};
let reduced = false;
global.window = { matchMedia: () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} }),
 setTimeout(fn, delay) { assert.equal(delay, 5000); timers.set(++timerId, fn); return timerId; },
 clearTimeout(id) { timers.delete(id); },
};
global.document = { hidden: false, addEventListener() {}, removeEventListener() {} };
global.IntersectionObserver = class { constructor(callback) { callback([{ isIntersecting: true }]); } observe() {} disconnect() {} };
const Carousel = loader({ react: hooks, '@/lib/scroll-card': {
 scrollCard(element, index) { element.scrollTo({top: index * element.clientHeight, behavior: reduced ? 'instant' : 'smooth'}); },
 cancelCardScroll() {},
} })(require('node:path').join(__dirname, '../src/components/home/VerticalCardCarousel.tsx')).default;
const slides = ['First', 'Second', 'Third'].map(key => ({ key, content: React.createElement('a', { href: '/' + key }, key) }));
const render = (items = slides) => { cursor = 0; pending = []; const tree = Carousel({ slides: items, label: 'Cards' }); pending.forEach(fn => fn()); return tree; };
const nodes = node => !node || typeof node !== 'object' ? [] : [node, ...React.Children.toArray(node.props?.children).flatMap(nodes)];
let tree = render();
const scrolls = [];
state[0].current = { clientHeight: 375, scrollTo: options => scrolls.push(options) };
const next = () => nodes(tree).find(n => n.type === 'button' && n.props['aria-label'].startsWith('Наступна'));
next().props.onClick();
assert.deepEqual(scrolls.pop(), { top: 375, behavior: 'smooth' });
let viewport = nodes(tree).find(n => n.props.onScroll);
viewport.props.onScroll({ currentTarget: { clientHeight: 375, scrollTop: 750 } });
tree = render();
assert.deepEqual(nodes(tree).filter(n => n.props['aria-roledescription'] === 'слайд').map(n => n.props.inert), [true, true, false]);
next().props.onClick();
assert.equal(scrolls.pop().top, 0);
reduced = true;
viewport = nodes(tree).find(n => n.props.onScroll);
viewport.props.onKeyDown({ key: 'Home', preventDefault() {} });
assert.deepEqual(scrolls.pop(), { top: 0, behavior: 'instant' });
assert.equal(nodes(render(slides.slice(0, 1))).filter(n => n.type === 'button').length, 0);
reduced = false;
tree = render();
assert.equal(timers.size, 1);
[...timers.values()][0]();
assert.equal(scrolls.pop().top, 0);
tree.props.onMouseEnter(); tree = render(); assert.equal(timers.size, 0);
tree.props.onMouseLeave(); tree = render(); assert.equal(timers.size, 1);
tree.props.onFocusCapture(); tree = render(); assert.equal(timers.size, 0);
tree.props.onBlurCapture({ currentTarget: { contains: () => false }, relatedTarget: null }); tree = render(); assert.equal(timers.size, 1);
nodes(tree).find(n => n.props.onTouchStart).props.onTouchStart(); tree = render(); assert.equal(timers.size, 0);
nodes(tree).find(n => n.props.onTouchEnd).props.onTouchEnd(); tree = render(); assert.equal(timers.size, 1);
console.log('PASS: shared autoplay registration, hover/focus/touch pause, resume, card navigation, wraparound, inactive content, keyboard, reduced motion, single-card controls');
