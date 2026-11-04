const assert = require('node:assert/strict');
const {loader} = require('./load-ts.cjs');
const {NextRequest} = require('next/server');
process.env.CHECKOUT_API_SECRET='server-only-test-secret'.repeat(3);
process.env.WEB_PUBLIC_URL='https://shop.example';
process.env.STRAPI_URL='http://cms.internal:1337';
const {POST,GET}=loader()(require('node:path').join(__dirname,'../src/app/api/checkout/[action]/route.ts'));
const ctx=action=>({params:Promise.resolve({action})});
function request(action, {method='POST',origin='https://shop.example',cookie='',body={}}={}) {
  return new NextRequest(`https://shop.example/api/checkout/${action}`, {method,headers:{origin,cookie,'Content-Type':'application/json'}, ...(method==='POST'?{body:JSON.stringify(body)}:{})});
}
async function run() {
  assert.equal((await POST(request('draft',{origin:'https://attacker.example'}),ctx('draft'))).status,403);
  assert.equal((await POST(request('draft'),ctx('draft'))).status,401);
  assert.equal((await POST(request('callback'),ctx('callback'))).status,404);
  const session=await POST(request('session'),ctx('session'));
  const cookie=session.headers.get('set-cookie');
  assert.match(cookie,/HttpOnly/i); assert.match(cookie,/Secure/i); assert.match(cookie,/SameSite=lax/i);
  const sessionCookie=cookie.split(';')[0];
  let call;
  global.fetch=async(url,options)=>{call={url,options};return Response.json({number:'NP-test',totalMinor:12000});};
  const response=await POST(request('draft',{cookie:sessionCookie,body:{step:'cart',items:[]}}),ctx('draft'));
  assert.equal(response.status,200); assert.equal(response.headers.get('cache-control'),'no-store');
  assert.equal(call.url,'http://cms.internal:1337/api/checkout/draft');
  assert.equal(call.options.headers['x-checkout-key'],process.env.CHECKOUT_API_SECRET);
  assert.match(call.options.headers['x-checkout-session'],/^[a-f0-9]{64}$/);
  assert.doesNotMatch(await response.text(),/secret|checkout-session/);
  assert.equal((await GET(request('status',{method:'GET',cookie:sessionCookie}),ctx('status'))).status,200);
  const existing=await POST(request('session',{cookie:sessionCookie}),ctx('session'));
  assert.equal(existing.headers.get('set-cookie').split(';')[0],sessionCookie);
  const next=await POST(request('new',{cookie:sessionCookie}),ctx('new'));
  assert.notEqual(next.headers.get('set-cookie').split(';')[0],sessionCookie);
  console.log('PASS checkout proxy: CSRF, HttpOnly secure session, server-only credentials, no-store, session reuse/reset.');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
