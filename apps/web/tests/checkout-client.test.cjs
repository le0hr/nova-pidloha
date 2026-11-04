const assert=require('node:assert/strict');
const {loader}=require('./load-ts.cjs');
const path=require('node:path');
const state={contacts:{firstName:'Тест'},delivery:null,payment:null,comment:'',order:null,setOrder(order){this.order=order},resetCheckout(){this.order=null}};
const cart={items:[{id:'a',qty:1}]};
const client=loader({'@/store/cart-store':{useCartStore:{getState:()=>cart}},'@/store/checkout-store':{useCheckoutStore:{getState:()=>state}}})(path.join(__dirname,'../src/lib/checkout/client.ts'));
const calls=[];
let fail=false,active=0,maxActive=0;
global.fetch=async(url,options)=>{
  calls.push({url,body:options.body&&JSON.parse(options.body)});
  if(url.endsWith('/status')) return Response.json({error:'not found'},{status:404});
  if(url.endsWith('/draft')) {
    active++;maxActive=Math.max(active,maxActive);
    await new Promise(resolve=>setTimeout(resolve,10));active--;
    if(fail) return Response.json({error:'Збереження не вдалося'},{status:503});
    return Response.json({number:'NP-test',totalMinor:10000,submittedAt:null});
  }
  return Response.json({ok:true});
};
async function run(){
  await Promise.all([client.saveCheckout('cart'),client.saveCheckout('contacts')]);
  assert.equal(maxActive,1,'saves must be serialized');
  assert.equal(calls.filter(c=>c.url.endsWith('/session')).length,1);
  assert.deepEqual(calls.filter(c=>c.url.endsWith('/draft')).map(c=>c.body.step),['cart','contacts']);
  assert.equal(state.order.number,'NP-test');
  fail=true;await assert.rejects(client.saveCheckout('delivery'),/Збереження/);
  fail=false;await client.saveCheckout('contacts');
  state.order.submittedAt='2026-11-04T00:00:00Z';
  const before=calls.length;await client.saveCheckout('cart');assert.equal(calls.length,before,'submitted orders are immutable');
  assert.throws(()=>client.openPayment({url:'https://attacker.example'}),/адреса/);
  await client.newCheckout();assert.equal(state.order,null);
  console.log('PASS checkout client: serialized step persistence, surfaced failures, retry after failure, immutable submitted orders.');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
