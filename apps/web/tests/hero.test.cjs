const assert=require('node:assert/strict');
const {loader}=require('./load-ts.cjs');
const root=require('node:path').join(__dirname,'../src/');
const {normalizeHero}=loader()(root+'lib/catalog/hero.ts');
assert.equal(normalizeHero(null)[0].kind,'map');
assert.equal(normalizeHero(null)[0].title,'Наші магазини');
assert.equal(normalizeHero({heroSlides:[]}).length,1);
assert.equal(normalizeHero(null).length,1);
assert.equal(normalizeHero({heroSlides:[{kind:'map',title:'We on map'}]}).length,1);
assert.equal(normalizeHero({heroEnabled:false}).length,1);
const slides=normalizeHero({heroSlides:[{kind:'promotion',title:'Sale',badge:'−20%',body:[{type:'paragraph',children:[{type:'text',text:'Sale',bold:true}]}]},{kind:'map',title:'Map'}]});
assert.equal(slides.length,2);assert.equal(slides[1].badge,'−20%');assert.equal(slides[1].body[0].children[0].bold,true);
const {SHOP_LOCATIONS}=loader()(root+'lib/catalog/shop-locations.ts');
assert.deepEqual(SHOP_LOCATIONS.map(s=>[s.lat,s.lng]),[[49.438958423807314,32.05061177492442],[49.42909246799387,32.00709050070083]]);
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const componentMocks={
 './HomeIcon':{__esModule:true,default:()=>null},
 './ShopMap':{__esModule:true,default:()=>React.createElement('div',{'data-map':true})},
 './HeroBody':{__esModule:true,default:()=>null},
 'next/image':{__esModule:true,default:()=>null},
 'next/link':{__esModule:true,default:({href,children})=>React.createElement('a',{href},children)},
};
const ServerHero=loader(componentMocks)(root+'components/home/Hero.tsx').default;
const html=renderToStaticMarkup(React.createElement(ServerHero,{slides}));
assert.match(html,/data-map/);assert.match(html,/Наступний слайд/);assert.match(html,/OpenStreetMap/);

// Exercise the actual component's effects and event handlers with deterministic hooks/timers.
let cursor=0, state=[],effects=[],pending=[];
const timers=new Map();let timerId=0;
global.window={matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){}}),requestAnimationFrame:fn=>{const id=++timerId;timers.set(id,()=>{timers.delete(id);fn(performance.now()+7001);});return id;},cancelAnimationFrame:id=>timers.delete(id)};
global.document={hidden:false,addEventListener(){},removeEventListener(){}};
const hookReact={...React,
 useState(initial){const id=cursor++;if(!(id in state))state[id]=initial;return[state[id],v=>{state[id]=typeof v==='function'?v(state[id]):v;}];},
 useRef(initial){const id=cursor++;return state[id]??(state[id]={current:initial});},
 useEffect(fn,deps){const id=cursor++;const prev=effects[id];if(!prev||deps.some((v,i)=>!Object.is(v,prev.deps[i]))){pending.push(()=>{prev?.cleanup?.();effects[id]={deps,cleanup:fn()};});}},
};
const Hero=loader({...componentMocks,react:hookReact})(root+'components/home/Hero.tsx').default;
const render=()=>{cursor=0;pending=[];const result=Hero({slides});pending.forEach(fn=>fn());return result;};
function nodes(node){if(!node||typeof node!=='object')return [];return [node,...React.Children.toArray(node.props?.children).flatMap(nodes)];}
const button=(tree,label)=>nodes(tree).find(n=>n.props?.['aria-label']===label);
const title=tree=>nodes(tree).find(n=>n.type==='h1').props.children;
let tree=render();assert.equal(timers.size,1);
[...timers.values()][0]();tree=render();assert.equal(title(tree),'Sale');
tree.props.onMouseEnter();tree=render();assert.equal(timers.size,0);
button(tree,'Наступний слайд').props.onClick();tree=render();assert.equal(title(tree),'Наші магазини');
tree.props.onMouseLeave();tree=render();assert.equal(timers.size,1);
assert.equal(button(tree,'Призупинити автоматичне гортання'),undefined);
tree.props.onTouchStart({touches:[{clientX:200,clientY:20}]});tree.props.onTouchEnd({changedTouches:[{clientX:100,clientY:25}]});tree=render();assert.equal(title(tree),'Sale');
tree.props.onKeyDown({target:{closest:()=>null},key:'ArrowLeft',preventDefault(){}});tree=render();assert.equal(title(tree),'Наші магазини');
nodes(tree).find(n=>n.type==='button'&&React.Children.toArray(n.props.children)[0]==='Знайти магазини').props.onClick();tree=render();assert.equal(timers.size,0);
console.log('PASS: permanent map, exact shop coordinates, rich CMS banners, autoplay, hover/pause, wrapping, swipe, keyboard, map interaction pause');
