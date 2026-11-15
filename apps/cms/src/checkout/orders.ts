import { randomUUID } from 'node:crypto';
import { contacts, ensure, hash, money, text, paymentState, canTransition } from './domain';
import * as catalog from './catalog';
import * as liqpay from './liqpay';
import * as telegram from './telegram';

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
const STEPS = ['cart','contacts','delivery','payment','confirmation'];
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
    const row = await strapi.db.query(ORDER).update({where: {id: current.id}, data});
    // Manager sees each stage once, from the contacts on (before that there is nobody to call).
    const reached = STEPS.indexOf(data.checkoutStep) > STEPS.indexOf(current.checkoutStep) && data.checkoutStep !== 'cart';
    return {result: view(row), row, stage: reached ? data.checkoutStep : null};
  }).then(({result, row, stage}: any) => {
    if (stage) void telegram.notify(strapi, row, stage);
    return result;
  });
}
export async function submit(strapi: any, token: string, expectedTotal: unknown) {
  const order = await find(strapi, token);
  ensure(order, 'Замовлення не знайдено', 404);
  let submittedRow: any = null;
  const result = await locked(strapi, order.id, async current => {
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
    const updated = submittedRow = await strapi.db.query(ORDER).update({where: {id: current.id}, data: {
      submittedAt: now(), orderStatus: attempt ? 'awaiting_payment' : 'awaiting_confirmation',
      paymentStatus: attempt ? 'pending' : 'unpaid', paymentTestMode: attempt?.testMode || false, activeAttemptId: attempt?.providerOrderId || null,
      history: history(current, attempt ? 'payment_started' : 'order_submitted'), lastActivityAt: now(),
    }});
    return {order: view(updated), ...(attempt ? {checkout: liqpay.checkout(updated, attempt)} : {})};
  });
  if (submittedRow) void telegram.notify(strapi, submittedRow, 'submitted',
    submittedRow.paymentMethod === 'card' ? 'Клієнта перенаправлено на оплату. Чекаємо резерв коштів.' : '');
  return result;
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
  let changed: any = null;
  await locked(strapi, attempt.order.id, async order => {
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
      changed = {row: await strapi.db.query(ORDER).update({where: {id: order.id}, data: {
        paymentStatus: next,
        ...(ready && order.orderStatus === 'awaiting_payment' ? {orderStatus: 'awaiting_confirmation'} : {}),
        history: history(order, `payment:${next}${fresh.testMode ? ':test' : ''}`),
      }}), next};
    }
  });
  if (changed) void telegram.notify(strapi, changed.row, `payment:${changed.next}`,
    changed.row.orderStatus === 'cancelled' && ['held', 'paid'].includes(changed.next)
      ? '⚠️ Замовлення вже скасоване, а оплата пройшла. Зніміть резерв / поверніть кошти в кабінеті LiqPay.'
      : changed.next === 'held' ? 'Зателефонуйте клієнту, підтвердіть наявність і натисніть «Підтвердити» — кошти буде списано. Якщо товару немає — «Скасувати», резерв знімемо.' : '');
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

/**
 * Manager confirmation (Telegram button). A card hold is captured at LiqPay first (hold_completion); only a confirmed
 * capture marks the payment paid. COD / invoice orders are just marked confirmed. Returns nothing: the result is sent
 * as a stage message.
 */
export async function confirmOrder(strapi: any, number: string, who: string) {
  const order = await strapi.db.query(ORDER).findOne({where: {number}});
  ensure(order, 'Замовлення не знайдено', 404);
  ensure(order.orderStatus === 'awaiting_confirmation',
    order.orderStatus === 'confirmed' ? 'Замовлення вже підтверджено' : 'Замовлення зараз не очікує підтвердження', 409);
  let attempt: any = null, note = '';
  if (order.paymentMethod === 'card') {
    attempt = await strapi.db.query(PAYMENT).findOne({where: {providerOrderId: order.activeAttemptId}});
    ensure(attempt && ['held', 'test'].includes(attempt.status), 'Активного резерву немає (скасований або не пройшов)', 409);
    if (attempt.status === 'held') {
      const result: any = await liqpay.complete(attempt);
      ensure(result?.status === 'success', `LiqPay не списав кошти: ${result?.err_description || result?.status || 'невідома відповідь'}`, 502);
      note = `Кошти списано: ${(attempt.amountMinor / 100).toFixed(2)} ₴.`;
    } else note = 'Тестовий платіж — реальне списання не виконувалось.';
  }
  const updated = await locked(strapi, order.id, async current => {
    if (attempt?.status === 'held') {
      const fresh = await strapi.db.query(PAYMENT).findOne({where: {id: attempt.id}});
      await strapi.db.query(PAYMENT).update({where: {id: fresh.id}, data: {status: 'paid', providerStatus: 'success', paidAt: fresh.paidAt || now(),
        events: [...(fresh.events || []), {at: now(), status: 'hold_completion', source: 'manager'}].slice(-200)}});
    }
    return strapi.db.query(ORDER).update({where: {id: current.id}, data: {
      orderStatus: 'confirmed', confirmedAt: now(), confirmedBy: String(who).slice(0, 200),
      ...(attempt?.status === 'held' ? {paymentStatus: 'paid'} : {}),
      history: history(current, `confirmed:${String(who).slice(0, 60)}`), lastActivityAt: now(),
    }});
  });
  await telegram.notify(strapi, updated, 'confirmed', `Підтвердив(ла): ${String(who).replace(/[<>&]/g, '')}. ${note}`);
  return '';
}

/**
 * Manager cancellation (Telegram button, asked twice). A card hold is released at LiqPay first (refund on the hold);
 * only a confirmed release marks the payment reversed. Allowed while the order waits for the manager, or when its
 * card payment has failed. Not while a card payment is still pending: the customer may still be paying.
 */
export async function cancelOrder(strapi: any, number: string, who: string) {
  const order = await strapi.db.query(ORDER).findOne({where: {number}});
  ensure(order, 'Замовлення не знайдено', 404);
  ensure(order.orderStatus !== 'cancelled', 'Замовлення вже скасовано', 409);
  ensure(order.orderStatus === 'awaiting_confirmation' || (order.orderStatus === 'awaiting_payment' && ['failed', 'reversed'].includes(order.paymentStatus)),
    order.orderStatus === 'confirmed' ? 'Замовлення вже підтверджено й оплачено — повернення робиться в кабінеті LiqPay' : 'Зараз скасувати не можна: оплата ще в процесі', 409);
  let attempt: any = null, note = '';
  if (order.paymentMethod === 'card' && order.activeAttemptId) {
    attempt = await strapi.db.query(PAYMENT).findOne({where: {providerOrderId: order.activeAttemptId}});
    if (attempt?.status === 'held') {
      const result: any = await liqpay.release(attempt);
      ensure(['reversed', 'success'].includes(result?.status), `LiqPay не зняв резерв: ${result?.err_description || result?.status || 'невідома відповідь'}`, 502);
      note = `Резерв ${(attempt.amountMinor / 100).toFixed(2)} ₴ знято, кошти повертаються клієнту.`;
    } else if (attempt?.status === 'test') note = 'Тестовий платіж — реальних коштів не було.';
  }
  const updated = await locked(strapi, order.id, async current => {
    ensure(current.orderStatus !== 'cancelled' && current.orderStatus !== 'confirmed', 'Замовлення вже змінено', 409);
    if (attempt?.status === 'held') {
      const fresh = await strapi.db.query(PAYMENT).findOne({where: {id: attempt.id}});
      await strapi.db.query(PAYMENT).update({where: {id: fresh.id}, data: {status: 'reversed', providerStatus: 'reversed',
        events: [...(fresh.events || []), {at: now(), status: 'hold_release', source: 'manager'}].slice(-200)}});
    }
    return strapi.db.query(ORDER).update({where: {id: current.id}, data: {
      orderStatus: 'cancelled', confirmedAt: now(), confirmedBy: String(who).slice(0, 200),
      ...(attempt?.status === 'held' ? {paymentStatus: 'reversed'} : {}),
      history: history(current, `cancelled:${String(who).slice(0, 60)}`), lastActivityAt: now(),
    }});
  });
  await telegram.notify(strapi, updated, 'cancelled', `Скасував(ла): ${String(who).replace(/[<>&]/g, '')}. ${note}`);
}

/** Daily reminder for card holds the manager has not confirmed yet (the customer paid and is waiting). */
export async function remindHolds(strapi: any) {
  if (!telegram.enabled()) return;
  const dayAgo = new Date(Date.now() - 86400000).toISOString();
  const attempts = await strapi.db.query(PAYMENT).findMany({where: {
    status: 'held', heldAt: {$lt: dayAgo},
    $or: [{reminderSentAt: {$null: true}}, {reminderSentAt: {$lt: dayAgo}}],
  }, populate: ['order'], limit: 20});
  for (const attempt of attempts) {
    const order = attempt.order && await strapi.db.query(ORDER).findOne({where: {id: attempt.order.id}});
    if (!order || order.orderStatus !== 'awaiting_confirmation' || order.activeAttemptId !== attempt.providerOrderId) continue;
    const until = attempt.holdReviewAt ? new Date(attempt.holdReviewAt).toLocaleString('uk-UA', {timeZone: 'Europe/Kyiv'}) : '';
    await telegram.notify(strapi, order, 'reminder', `Кошти зарезервовано ${new Date(attempt.heldAt).toLocaleString('uk-UA', {timeZone: 'Europe/Kyiv'})}.` +
      (until ? ` Підтвердіть або скасуйте до ${until}, інакше банк може розблокувати резерв.` : ''));
    await strapi.db.query(PAYMENT).update({where: {id: attempt.id}, data: {reminderSentAt: now()}});
  }
}
