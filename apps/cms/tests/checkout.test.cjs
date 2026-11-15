const assert = require('node:assert/strict');
const {randomBytes} = require('node:crypto');
const path = require('node:path');
// Uses an isolated database. Never opens the developer or production database.
process.env.DATABASE_CLIENT = 'sqlite';
process.env.DATABASE_FILENAME = `.tmp/checkout-test-${randomBytes(6).toString('hex')}.db`;
process.env.DATABASE_URL = '';
process.env.NODE_ENV = 'test';
process.env.STRAPI_TELEMETRY_DISABLED = 'true';
// Never message the real manager chat from tests (apps/cms/.env may hold a live bot).
for (const key of ['TELEGRAM_BOT_TOKEN','TELEGRAM_CHAT_ID','TELEGRAM_MANAGER_IDS','TELEGRAM_WEBHOOK_SECRET']) process.env[key] = '';
process.env.LIQPAY_PUBLIC_KEY = 'sandbox_checkout_test';
process.env.LIQPAY_PRIVATE_KEY = 'test-private-key-not-a-real-secret';
process.env.LIQPAY_TEST_MODE = 'true';
process.env.WEB_PUBLIC_URL = 'http://localhost:3000';
process.env.PUBLIC_URL = 'http://localhost:1337';
process.env.CHECKOUT_API_SECRET = 'test-shared-secret'.repeat(3);
const {createStrapi} = require('@strapi/strapi');
const orders = require('../dist/src/checkout/orders');
const liqpay = require('../dist/src/checkout/liqpay');
const domain = require('../dist/src/checkout/domain');
async function run() {
  const app = await createStrapi({appDir: path.resolve(__dirname, '..'), distDir: path.resolve(__dirname, '../dist')}).load();
  try {
    const addon = await app.documents('api::architrave-type.architrave-type').create({data: {name:'Коробка', additionalCost: 100, group:'Коробка'}, status:'published'});
    const product = await app.documents('api::product.product').create({data: {name:'Двері', slug:'test-door', active:true}, status:'published'});
    const variation = await app.documents('api::product-variation.product-variation').create({data: {slug:'test-door-oak', price:'1000.50', active:true, products:[product.documentId], addons:[addon.documentId]}, status:'published'});
    const token = 'a'.repeat(64);
    const item = {id:'test-door-oak:box', variationSlug:variation.slug, qty:2, price:1, addons:[{id:addon.documentId, price:0}]};
    const body = {step:'cart', items:[item]};
    let saved = await orders.save(app, token, body);
    assert.equal(saved.totalMinor, 220100, 'server prices override the browser');
    assert.equal(saved.checkoutStep, 'cart');
    body.contacts = {firstName:'Іван', lastName:'Тест', phone:'+38 (067) 123-45-67', email:'test@example.com', isCompany:true, companyName:'ТОВ Тест', edrpou:'12345678'};
    body.step = 'contacts';
    saved = await orders.save(app, token, body);
    const number = saved.number;
    body.step='delivery'; body.delivery={method:'address',address:'Черкаси, вул. Тестова 1'};
    await orders.save(app, token, body);
    body.step='payment'; body.payment='card'; await orders.save(app,token,body);
    body.step='confirmation'; body.comment='Зателефонуйте'; saved=await orders.save(app,token,body);
    assert.equal(saved.number,number);
    const row = await orders.find(app,token);
    assert.equal(row.phone,'+380671234567'); assert.equal(row.edrpou,'12345678'); assert.equal(row.comment,'Зателефонуйте');
    assert.equal(row.items[0].addons[0].price,10000); assert.equal(row.history.length,6);
    await assert.rejects(orders.submit(app, token, 1), /Ціни змінилися/);
    const submitted = await orders.submit(app, token, saved.totalMinor);
    const repeated = await orders.submit(app, token, saved.totalMinor);
    assert.deepEqual(submitted.checkout, repeated.checkout, 'repeat submit uses the same authorization');
    const request=JSON.parse(Buffer.from(submitted.checkout.data,'base64').toString());
    assert.equal(request.action,'hold'); assert.equal(request.amount,'2201.00'); assert.equal(request.version,7);
    assert.equal(request.server_url,'http://localhost:1337/api/checkout/liqpay/callback');
    assert.equal('private_key' in request,false);
    await assert.rejects(orders.save(app,token,body), /вже оформлено/);
    let payload={public_key:process.env.LIQPAY_PUBLIC_KEY, order_id:request.order_id, amount:2201, currency:'UAH', status:'hold_wait', payment_id:123, transaction_id:456};
    const signed=liqpay.signed(payload,process.env.LIQPAY_PRIVATE_KEY);
    assert.deepEqual(liqpay.decode(signed),payload);
    assert.throws(()=>liqpay.decode({...signed,signature:'x'}), /підпис/);
    assert.throws(()=>liqpay.decode({...signed,data:Buffer.from('{}').toString('base64')}), /підпис/);
    await assert.rejects(orders.applyPayment(app,{...payload,amount:1}), /не збігаються/);
    await assert.rejects(orders.applyPayment(app,{...payload,currency:'USD'}), /не збігаються/);
    await assert.rejects(orders.applyPayment(app,{...payload,public_key:'another'}), /не збігаються/);
    await orders.applyPayment(app,payload); await orders.applyPayment(app,payload);
    let paidOrder=await orders.find(app,token);
    assert.equal(paidOrder.paymentStatus,'held'); assert.equal(paidOrder.orderStatus,'awaiting_confirmation');
    const eventCount=paidOrder.history.length;
    await orders.applyPayment(app,{...payload,status:'processing'});
    paidOrder=await orders.find(app,token); assert.equal(paidOrder.paymentStatus,'held'); assert.equal(paidOrder.history.length,eventCount);
    await orders.applyPayment(app,{...payload,status:'success'});
    assert.equal((await orders.find(app,token)).paymentStatus,'paid');
    await orders.applyPayment(app,{...payload,status:'reversed'});
    await orders.applyPayment(app,payload);
    assert.equal((await orders.find(app,token)).paymentStatus,'reversed');
    const other='b'.repeat(64);
    assert.equal(await orders.find(app,other),null,'another session cannot read the order');
    for(const method of ['cod','invoice']) {
      const session=randomBytes(32).toString('hex');
      const draft=await orders.save(app,session,{...body,payment:method});
      const result=await orders.submit(app,session,draft.totalMinor);
      assert.equal(result.checkout,undefined); assert.equal(result.order.paymentStatus,'unpaid'); assert.equal(result.order.orderStatus,'awaiting_confirmation');
    }
    await assert.rejects(orders.save(app,other,{...body,items:[{...item,qty:-1}]}), /кількість/);
    await assert.rejects(orders.save(app,other,{...body,items:[{...item,addons:[{id:'forged'}]}]}), /Доповнення/);
    await assert.rejects(orders.save(app,other,{...body,items:[{...item,addons:[{id:addon.documentId},{id:addon.documentId}]}]}), /Доповнення/);
    const retryToken = randomBytes(32).toString('hex');
    const retryDraft = await orders.save(app,retryToken,body);
    const firstTry = await orders.submit(app,retryToken,retryDraft.totalMinor);
    const firstId=JSON.parse(Buffer.from(firstTry.checkout.data,'base64').toString()).order_id;
    const failedPayload={...payload,order_id:firstId,status:'failure'};
    await orders.applyPayment(app,failedPayload);
    const originalFetch=global.fetch;
    try {
      global.fetch=async()=>({ok:true,json:async()=>({...failedPayload,status:'processing'})});
      await assert.rejects(orders.retryPayment(app,retryToken),/підтвердити відмову/);
      global.fetch=async()=>({ok:true,json:async()=>failedPayload});
      const nextTry=await orders.retryPayment(app,retryToken);
      const nextId=JSON.parse(Buffer.from(nextTry.checkout.data,'base64').toString()).order_id;
      assert.notEqual(firstId,nextId);
      assert.equal((await orders.find(app,retryToken)).paymentStatus,'pending');
      assert.equal(await app.db.query(orders.PAYMENT).count({where:{order:(await orders.find(app,retryToken)).id}}),2);
    } finally {global.fetch=originalFetch;}
    const changedToken = randomBytes(32).toString('hex');
    const changed = await orders.save(app,changedToken,body);
    await app.documents('api::product-variation.product-variation').update({documentId:variation.documentId,data:{price:'1001.50'},status:'published'});
    await assert.rejects(orders.submit(app,changedToken,changed.totalMinor),/Ціни змінилися/);
    assert.equal((await orders.find(app,changedToken)).orderStatus,'draft');
    const shadow=app.plugin('graphql').service('extension').shadowCRUD(orders.ORDER);
    assert.equal(shadow.isEnabled(),false);
    const checkoutController=app.controller('api::order.checkout');
    const ctx={get:()=>'',set:()=>{},request:{body:{}}};
    await checkoutController.status(ctx); assert.equal(ctx.status,403);
    const otherCtx={get:name=>name==='x-checkout-key'?process.env.CHECKOUT_API_SECRET:'c'.repeat(64),set:()=>{},request:{body:{}}};
    await checkoutController.status(otherCtx); assert.equal(otherCtx.status,404);
    const noKeysToken=randomBytes(32).toString('hex');
    const noKeysDraft=await orders.save(app,noKeysToken,body);
    const key=process.env.LIQPAY_PRIVATE_KEY;
    delete process.env.LIQPAY_PRIVATE_KEY;
    try {await assert.rejects(orders.submit(app,noKeysToken,noKeysDraft.totalMinor),/тимчасово недоступна/);}
    finally {process.env.LIQPAY_PRIVATE_KEY=key;}
    assert.equal((await orders.find(app,noKeysToken)).orderStatus,'draft');
    const emptied=await orders.save(app,noKeysToken,{...body,step:'cart',items:[]});
    assert.equal(emptied.totalMinor,0);assert.deepEqual(emptied.items,[]);
    await assert.rejects(orders.submit(app,noKeysToken,0),/Кошик порожній/);
    const config=await app.plugin('content-manager').service('content-types').findConfiguration(app.contentTypes[orders.ORDER]);
    assert.equal(config.settings.mainField,'number'); assert.equal(config.metadatas.paymentStatus.edit.editable,false);
    assert.equal(config.metadatas.managerNotes.edit.editable,true);
    const payment = await app.db.query(orders.PAYMENT).findOne({where:{providerOrderId:request.order_id}});
    assert.ok(payment.heldAt && payment.holdReviewAt); assert.equal(payment.events.length,3);
    assert.equal(domain.paymentState('sandbox',true),'test'); assert.equal(domain.paymentState('sandbox',false),'pending');

    // --- floor: price per m² × pack area; doors: size rules from the CMS -------------------------------------------
    const floor = await app.documents('api::product.product').create({data:{name:'Ламінат', slug:'test-floor', active:true}, status:'published'});
    const floorRow = await app.documents('api::product-variation.product-variation').create({data:{slug:'test-floor-oak', price:'500', active:true,
      products:[floor.documentId], catalog_attributes:{'Площа в пачці, м2':'2,13'}}, status:'published'});
    const sized = await app.documents('api::product.product').create({data:{name:'Двері розмір', slug:'test-door-size', active:true,
      size_rules:[{dimension:'height', min:1700, max:1990, step:10, percent:15}]}, status:'published'});
    const sizedRow = await app.documents('api::product-variation.product-variation').create({data:{slug:'test-door-size-white', price:'1000', active:true,
      products:[sized.documentId]}, status:'published'});
    const sizeToken = randomBytes(32).toString('hex');
    const sizeBody = {step:'cart', items:[
      {id:'floor', variationSlug:floorRow.slug, qty:3, price:1},
      {id:'door-std', variationSlug:sizedRow.slug, qty:1, price:1, size:{width:800, height:2000}},
      {id:'door-low', variationSlug:sizedRow.slug, qty:1, price:1, size:{width:800, height:1950, custom:true, percent:15}},
    ]};
    const sizeDraft = await orders.save(app, sizeToken, sizeBody);
    const lines = (await orders.find(app, sizeToken)).items;
    assert.equal(lines[0].unit, 106500, 'floor pack = 500 ₴/m² × 2.13 m²'); assert.equal(lines[0].packArea, 2.13);
    assert.equal(lines[1].unit, 100000, 'standard size costs the standard price');
    assert.equal(lines[2].unit, 115000, 'non-standard height +15%');
    assert.deepEqual(lines[2].size, {width:800, height:1950, percent:15});
    assert.ok(lines[2].mods.includes('Нестандартний розмір: 800×1950 мм (+15%)')); assert.ok(lines[1].mods.includes('Розмір: 800×2000 мм'));
    assert.equal(sizeDraft.totalMinor, 3 * 106500 + 100000 + 115000);
    await assert.rejects(orders.save(app, sizeToken, {step:'cart', items:[{id:'x', variationSlug:sizedRow.slug, qty:1, size:{width:800, height:1955}}]}), /розмір/i, 'off the 10 mm step');
    await assert.rejects(orders.save(app, sizeToken, {step:'cart', items:[{id:'x', variationSlug:sizedRow.slug, qty:1, size:{width:750, height:2000}}]}), /розмір/i, 'no width rule');

    // --- manager confirmation: card hold is captured first, COD is just confirmed ------------------------------------
    const holdToken = randomBytes(32).toString('hex');
    const holdDraft = await orders.save(app, holdToken, body);
    const holdSubmit = await orders.submit(app, holdToken, holdDraft.totalMinor);
    const holdId = JSON.parse(Buffer.from(holdSubmit.checkout.data,'base64').toString()).order_id;
    await orders.applyPayment(app, {...payload, order_id:holdId, amount:holdDraft.totalMinor / 100, status:'hold_wait'});
    const holdOrder = await orders.find(app, holdToken);
    assert.equal(holdOrder.paymentStatus, 'held');
    const realFetch = global.fetch;
    try {
      global.fetch = async () => ({ok:true, json:async()=>({status:'error', err_description:'hold expired'})});
      await assert.rejects(orders.confirmOrder(app, holdOrder.number, 'Менеджер'), /не списав/);
      assert.equal((await orders.find(app, holdToken)).orderStatus, 'awaiting_confirmation', 'failed capture leaves the order waiting');
      let sent;
      global.fetch = async (url, init) => { if (String(url).includes('liqpay')) sent = Object.fromEntries(new URLSearchParams(init.body)); return {ok:true, json:async()=>({ok:true, status:'success'})}; };
      await orders.confirmOrder(app, holdOrder.number, 'Менеджер');
      assert.equal(JSON.parse(Buffer.from(sent.data,'base64').toString()).action, 'hold_completion');
    } finally { global.fetch = realFetch; }
    const confirmed = await orders.find(app, holdToken);
    assert.equal(confirmed.orderStatus, 'confirmed'); assert.equal(confirmed.paymentStatus, 'paid'); assert.equal(confirmed.confirmedBy, 'Менеджер');
    assert.equal((await app.db.query(orders.PAYMENT).findOne({where:{providerOrderId:holdId}})).status, 'paid');
    await assert.rejects(orders.confirmOrder(app, holdOrder.number, 'Менеджер'), /вже підтверджено/);
    await assert.rejects(orders.cancelOrder(app, holdOrder.number, 'Менеджер'), /вже підтверджено/);
    // cancel: the card hold is released at LiqPay first; a COD order is just cancelled
    const cancelToken = randomBytes(32).toString('hex');
    const cancelDraft = await orders.save(app, cancelToken, body);
    const cancelSubmit = await orders.submit(app, cancelToken, cancelDraft.totalMinor);
    const cancelId = JSON.parse(Buffer.from(cancelSubmit.checkout.data,'base64').toString()).order_id;
    await assert.rejects(orders.cancelOrder(app, (await orders.find(app, cancelToken)).number, 'Менеджер'), /оплата ще в процесі/);
    await orders.applyPayment(app, {...payload, order_id:cancelId, amount:cancelDraft.totalMinor / 100, status:'hold_wait'});
    try {
      let released;
      global.fetch = async (url, init) => { if (String(url).includes('liqpay')) released = Object.fromEntries(new URLSearchParams(init.body)); return {ok:true, json:async()=>({ok:true, status:'reversed'})}; };
      await orders.cancelOrder(app, (await orders.find(app, cancelToken)).number, 'Менеджер');
      assert.equal(JSON.parse(Buffer.from(released.data,'base64').toString()).action, 'refund');
    } finally { global.fetch = realFetch; }
    const cancelled = await orders.find(app, cancelToken);
    assert.equal(cancelled.orderStatus, 'cancelled'); assert.equal(cancelled.paymentStatus, 'reversed');
    assert.equal((await app.db.query(orders.PAYMENT).findOne({where:{providerOrderId:cancelId}})).status, 'reversed');
    await assert.rejects(orders.confirmOrder(app, cancelled.number, 'Менеджер'), /не очікує/);
    const codCancelToken = randomBytes(32).toString('hex');
    const codCancelDraft = await orders.save(app, codCancelToken, {...body, payment:'cod'});
    await orders.submit(app, codCancelToken, codCancelDraft.totalMinor);
    await orders.cancelOrder(app, (await orders.find(app, codCancelToken)).number, 'Менеджер');
    assert.equal((await orders.find(app, codCancelToken)).orderStatus, 'cancelled');
    const codToken = randomBytes(32).toString('hex');
    const codDraft = await orders.save(app, codToken, {...body, payment:'cod'});
    await orders.submit(app, codToken, codDraft.totalMinor);
    await orders.confirmOrder(app, (await orders.find(app, codToken)).number, 'Менеджер');
    assert.equal((await orders.find(app, codToken)).orderStatus, 'confirmed');

    // --- Telegram: a message per reached stage with what is known, HTML escaped, button only when confirmable --------
    const messages = [];
    process.env.TELEGRAM_BOT_TOKEN = 'test-token'; process.env.TELEGRAM_CHAT_ID = '42';
    try {
      global.fetch = async (url, init) => { if (String(url).includes('api.telegram.org')) messages.push(JSON.parse(init.body)); return {ok:true, json:async()=>({ok:true, result:{}})}; };
      const tgToken = randomBytes(32).toString('hex');
      const tgBody = {...body, step:'cart', payment:'cod', comment:'<b>дзвонити</b>'};
      await orders.save(app, tgToken, tgBody);
      await orders.save(app, tgToken, {...tgBody, step:'contacts'});
      await orders.save(app, tgToken, {...tgBody, step:'contacts'});
      await orders.save(app, tgToken, {...tgBody, step:'confirmation'});
      const tgDraft = await orders.save(app, tgToken, {...tgBody, step:'confirmation'});
      await orders.submit(app, tgToken, tgDraft.totalMinor);
      await new Promise(resolve => setTimeout(resolve, 50));
      assert.deepEqual(messages.map(m => m.text.split('\n')[0]), ['<b>👤 Залишив контакти</b>', '<b>📝 На сторінці підтвердження</b>', '<b>✅ Замовлення оформлено</b>'], 'cart is silent, repeats are silent');
      assert.equal(messages[0].chat_id, '42'); assert.match(messages[0].text, /\+380671234567/); assert.match(messages[0].text, /&lt;b&gt;дзвонити/);
      assert.equal(messages[0].reply_markup, undefined); assert.match(messages[2].reply_markup.inline_keyboard[0][0].callback_data, /^confirm:NP-/);
      assert.match(messages[2].reply_markup.inline_keyboard[1][0].callback_data, /^cancel:NP-/);
    } finally { global.fetch = realFetch; delete process.env.TELEGRAM_BOT_TOKEN; delete process.env.TELEGRAM_CHAT_ID; }
    console.log('PASS checkout integration: persisted steps, CMS layout, authoritative totals, private sessions, card hold, duplicate submits/callbacks, invalid signatures/amounts, monotonic states, COD and invoice, floor packs, door size rules, manager confirmation with hold capture, cancel with hold release, Telegram stages.');
  } finally { await app.destroy(); }
}
run().catch(error=>{console.error(error); process.exitCode=1;});
