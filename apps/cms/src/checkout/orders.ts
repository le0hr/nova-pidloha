import { randomUUID } from 'node:crypto';
import { contacts, ensure, hash, money, text, paymentState, canTransition } from './domain';
import * as catalog from './catalog';
import * as liqpay from './liqpay';

export const ORDER = 'api::order.order';
export const PAYMENT = 'api::payment-attempt.payment-attempt';
const now = () => new Date().toISOString();
const documentId = () => randomUUID().replace(/-/g, '').slice(0, 24);
const history = (order: any, event: string) => [...(order.history || []), {at: now(), event}].slice(-200);
export function view(order: any) {
  return {number: order.number, checkoutStep: order.checkoutStep, orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus, paymentMethod: order.paymentMethod, totalMinor: order.totalMinor,
    currency: order.currency, testMode: order.paymentTestMode === true, items: order.items, submittedAt: order.submittedAt};
}
export async function find(strapi: any, token: string) {
  return strapi.db.query(ORDER).findOne({where: {sessionHash: hash(token)}});
}
async function locked(strapi: any, id: number, fn: (order: any) => Promise<any>) {
  return strapi.db.transaction(async ({trx}: any) => {
    // Database lock works across CMS workers; SQLite serializes writes itself.
    await trx(strapi.db.metadata.get(ORDER).tableName).where({id}).forUpdate().first();
    const order = await strapi.db.query(ORDER).findOne({where: {id}});
    ensure(order, 'Замовлення не знайдено', 404);
    return fn(order);
  });
}
async function getOrCreate(strapi: any, token: string) {
  const existing = await find(strapi, token);
  if (existing) return existing;
  try {
    return await strapi.db.query(ORDER).create({data: {
      documentId: documentId(), number: `NP-${new Date().getFullYear()}-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`,
      sessionHash: hash(token), orderStatus: 'draft', paymentStatus: 'unpaid', checkoutStep: 'cart',
      currency: 'UAH', items: [], history: [{at: now(), event: 'checkout_started'}], lastActivityAt: now(),
    }});
  } catch (error) {
    const raced = await find(strapi, token);
    if (raced) return raced;
    throw error;
  }
}
export async function save(strapi: any, token: string, body: any) {
  ensure(body && ['cart', 'contacts', 'delivery', 'payment', 'confirmation'].includes(body.step), 'Некоректний крок');
  const order = await getOrCreate(strapi, token);
  return locked(strapi, order.id, async (current) => {
    ensure(current.orderStatus === 'draft', 'Замовлення вже оформлено. Перейдіть до його статусу.', 409);
    const items = Array.isArray(body.items) && body.items.length === 0 ? [] : await catalog.snapshot(strapi, body.items);
    const totalMinor = items.reduce((sum, item) => sum + item.unit * item.qty, 0);
    const data: any = {items, totalMinor, totalAmount: totalMinor / 100, lastActivityAt: now(), comment: text(body.comment || '', 2000)};
    if (body.contacts) Object.assign(data, contacts(body.contacts));
    if (body.delivery) { data.delivery = await catalog.delivery(strapi, body.delivery); data.deliveryMethod = data.delivery.method; }
    if (body.payment) {
      ensure(['card', 'cod', 'invoice'].includes(body.payment), 'Некоректний спосіб оплати');
      data.paymentMethod = body.payment; data.paymentProvider = body.payment === 'card' ? 'liqpay' : 'manual';
    }
    const combined = {...current, ...data};
    if (body.step !== 'cart') ensure(combined.email, 'Спочатку заповніть контакти');
    if (['delivery','payment','confirmation'].includes(body.step)) ensure(combined.delivery, 'Спочатку оберіть доставку');
    if (['payment','confirmation'].includes(body.step)) ensure(body.payment, 'Оберіть спосіб оплати');
    const steps = ['cart','contacts','delivery','payment','confirmation'];
    data.checkoutStep = steps[Math.max(steps.indexOf(current.checkoutStep), steps.indexOf(body.step))];
    data.itemsSummary = items.map(i => `${i.name} [${i.sku || i.variationSlug}] × ${i.qty} — ${(i.unit * i.qty / 100).toFixed(2)} грн\n${[...i.mods, ...i.addons.map(a => a.name)].join('; ')}`).join('\n\n');
    data.history = history(current, `checkout_saved:${body.step}`);
    return view(await strapi.db.query(ORDER).update({where: {id: current.id}, data}));
  });
}
export async function submit(strapi: any, token: string, expectedTotal: unknown) {
  const order = await find(strapi, token);
  ensure(order, 'Замовлення не знайдено', 404);
  return locked(strapi, order.id, async current => {
    if (current.orderStatus !== 'draft') {
      if (current.paymentMethod === 'card' && current.activeAttemptId) {
        const attempt = await strapi.db.query(PAYMENT).findOne({where: {providerOrderId: current.activeAttemptId}});
        if (attempt?.status === 'pending' && Date.parse(attempt.checkoutExpiresAt) > Date.now()) return {order: view(current), checkout: liqpay.checkout(current, attempt)};
      }
      return {order: view(current)};
    }
    ensure(current.checkoutStep === 'confirmation', 'Перевірте всі дані замовлення');
    contacts(current); ensure(current.delivery, 'Оберіть доставку');
    const items = await catalog.snapshot(strapi, current.items);
    const totalMinor = items.reduce((sum, i) => sum + i.unit * i.qty, 0);
    ensure(Number.isInteger(expectedTotal) && totalMinor === expectedTotal && totalMinor === current.totalMinor, 'Ціни змінилися. Оновіть сторінку та перевірте суму.', 409);
    let attempt: any;
    if (current.paymentMethod === 'card') {
      const config = liqpay.settings();
      attempt = await strapi.db.query(PAYMENT).create({data: {
        documentId: documentId(), order: current.id, providerOrderId: randomUUID(), provider: 'liqpay', action: 'hold',
        amountMinor: totalMinor, amount: totalMinor / 100, currency: 'UAH', status: 'pending', providerStatus: 'created',
        publicKey: config.publicKey, testMode: config.testMode, events: [],
        checkoutExpiresAt: new Date(Date.now() + 3600000).toISOString(),
      }});
    }
    const updated = await strapi.db.query(ORDER).update({where: {id: current.id}, data: {
      submittedAt: now(), orderStatus: attempt ? 'awaiting_payment' : 'awaiting_confirmation',
      paymentStatus: attempt ? 'pending' : 'unpaid', paymentTestMode: attempt?.testMode || false, activeAttemptId: attempt?.providerOrderId || null,
      history: history(current, attempt ? 'payment_started' : 'order_submitted'), lastActivityAt: now(),
    }});
    return {order: view(updated), ...(attempt ? {checkout: liqpay.checkout(updated, attempt)} : {})};
  });
}
export async function retryPayment(strapi: any, token: string) {
  const order = await find(strapi, token);
  ensure(order?.activeAttemptId && order.orderStatus === 'awaiting_payment', 'Повторна оплата недоступна', 409);
  const previous = await strapi.db.query(PAYMENT).findOne({where: {providerOrderId: order.activeAttemptId}});
  // Never create a second authorization while the outcome of the first is unknown.
  const confirmed: any = await liqpay.status(previous);
  ensure(confirmed.order_id === previous.providerOrderId && ['failure','error'].includes(confirmed.status) && confirmed.amount !== undefined, 'Не вдалося підтвердити відмову попереднього платежу. Спробуйте пізніше.', 409);
  await applyPayment(strapi, confirmed);
  return locked(strapi, order.id, async current => {
    const fresh = await strapi.db.query(PAYMENT).findOne({where: {providerOrderId: current.activeAttemptId}});
    if (fresh.providerOrderId !== previous.providerOrderId) {
      return {order: view(current), ...(fresh.status === 'pending' ? {checkout: liqpay.checkout(current, fresh)} : {})};
    }
    ensure(fresh.status === 'failed' && current.orderStatus === 'awaiting_payment', 'Спочатку потрібно підтвердити завершення попереднього платежу. Зверніться до магазину.', 409);
    const config = liqpay.settings();
    const attempt = await strapi.db.query(PAYMENT).create({data: {
      documentId: documentId(), order: current.id, providerOrderId: randomUUID(), provider: 'liqpay', action: 'hold',
      amountMinor: current.totalMinor, amount: current.totalMinor / 100, currency: 'UAH', status: 'pending', providerStatus: 'created',
      publicKey: config.publicKey, testMode: config.testMode, events: [], checkoutExpiresAt: new Date(Date.now() + 3600000).toISOString(),
    }});
    const updated = await strapi.db.query(ORDER).update({where: {id: current.id}, data: {
      activeAttemptId: attempt.providerOrderId, paymentStatus: 'pending', history: history(current, 'payment_retried'),
    }});
    return {order: view(updated), checkout: liqpay.checkout(updated, attempt)};
  });
}

// Both verified callbacks and authenticated status responses enter this path.
export async function applyPayment(strapi: any, payload: any) {
  ensure(payload && typeof payload.order_id === 'string', 'Немає ідентифікатора платежу');
  const attempt = await strapi.db.query(PAYMENT).findOne({where: {providerOrderId: payload.order_id}, populate: ['order']});
  ensure(attempt?.order, 'Платіж не знайдено', 404);
  ensure(payload.public_key === attempt.publicKey && payload.currency === attempt.currency && money(payload.amount) === attempt.amountMinor, 'Параметри платежу не збігаються', 400);
  ensure(typeof payload.status === 'string', 'Немає статусу платежу');
  return locked(strapi, attempt.order.id, async order => {
    const fresh = await strapi.db.query(PAYMENT).findOne({where: {id: attempt.id}});
    const next = paymentState(payload.status, fresh.testMode);
    if (!canTransition(fresh.status, next)) return;
    if (fresh.providerStatus === payload.status && fresh.status === next) return;
    const at = now();
    const data: any = {status: next, providerStatus: payload.status.slice(0, 100),
      paymentId: String(payload.payment_id || fresh.paymentId || '').slice(0, 100),
      transactionId: String(payload.transaction_id || fresh.transactionId || '').slice(0, 100),
      errorCode: String(payload.err_code || '').slice(0, 100),
      events: [...(fresh.events || []), {at, status: payload.status.slice(0, 100), source: 'liqpay'}].slice(-200)};
    if (next === 'held' && !fresh.heldAt) {
      data.heldAt = at;
      // Conservative operational reminder; not a claim that the bank released funds.
      data.holdReviewAt = new Date(new Date(fresh.createdAt).getTime() + 6 * 86400000).toISOString();
    }
    if (next === 'paid' && !fresh.paidAt) data.paidAt = at;
    await strapi.db.query(PAYMENT).update({where: {id: fresh.id}, data});
    if (order.activeAttemptId === fresh.providerOrderId) {
      const ready = ['held','paid','test'].includes(next);
      await strapi.db.query(ORDER).update({where: {id: order.id}, data: {
        paymentStatus: next,
        ...(ready && order.orderStatus === 'awaiting_payment' ? {orderStatus: 'awaiting_confirmation'} : {}),
        history: history(order, `payment:${next}${fresh.testMode ? ':test' : ''}`),
      }});
    }
  });
}
export async function reconcile(strapi: any, attempt: any) {
  await strapi.db.query(PAYMENT).update({where: {id: attempt.id}, data: {lastCheckedAt: now()}});
  const result: any = await liqpay.status(attempt);
  // A missing/unfinished checkout does not prove that a previous authorization was released.
  if (result.order_id && result.amount !== undefined && result.currency) await applyPayment(strapi, result);
  await strapi.db.query(PAYMENT).update({where: {id: attempt.id}, data: {lastCheckedAt: now()}});
}
export async function getStatus(strapi: any, token: string) {
  let order = await find(strapi, token);
  ensure(order, 'Замовлення не знайдено', 404);
  if (order.activeAttemptId) {
    const attempt = await strapi.db.query(PAYMENT).findOne({where: {providerOrderId: order.activeAttemptId}});
    if (attempt && (!attempt.lastCheckedAt || Date.now() - Date.parse(attempt.lastCheckedAt) > 30000)) {
      try { await reconcile(strapi, attempt); } catch { strapi.log.warn(`Payment reconciliation pending: ${attempt.providerOrderId}`); }
      order = await find(strapi, token);
    }
  }
  return view(order);
}
export async function reconcilePending(strapi: any) {
  const attempts = await strapi.db.query(PAYMENT).findMany({where: {
    status: {$in: ['pending','held','paid']},
    createdAt: {$gt: new Date(Date.now() - 35 * 86400000).toISOString()},
    $or: [{lastCheckedAt: {$null: true}}, {lastCheckedAt: {$lt: new Date(Date.now() - 300000).toISOString()}}],
  }, orderBy: {lastCheckedAt: 'asc'}, limit: 25});
  for (const attempt of attempts) {
    try { await reconcile(strapi, attempt); }
    catch { strapi.log.warn(`Payment reconciliation pending: ${attempt.providerOrderId}`); }
  }
}
