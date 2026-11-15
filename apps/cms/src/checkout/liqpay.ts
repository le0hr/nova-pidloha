import { createHash } from 'node:crypto';
import { ensure, equal } from './domain';

export function settings() {
  const publicKey = process.env.LIQPAY_PUBLIC_KEY || '';
  const privateKey = process.env.LIQPAY_PRIVATE_KEY || '';
  const web = process.env.WEB_PUBLIC_URL || '';
  const cms = process.env.PUBLIC_URL || '';
  ensure(publicKey && privateKey && web && cms, 'Оплата карткою тимчасово недоступна. Оберіть інший спосіб або спробуйте пізніше.', 503);
  const testMode = process.env.LIQPAY_TEST_MODE === 'true';
  ensure(testMode === publicKey.startsWith('sandbox_'), 'Перевірте режим та ключі LiqPay', 503);
  for (const url of [web, cms]) ensure(new URL(url).protocol === 'https:' || process.env.NODE_ENV !== 'production', 'Для оплати потрібен HTTPS', 503);
  return { publicKey, privateKey, web, cms, testMode };
}
export function signature(data: string, key: string) {
  return createHash('sha3-256').update(key + data + key).digest('base64');
}
export function signed(payload: object, key: string) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  return { data, signature: signature(data, key) };
}
export function decode(body: any) {
  const config = settings();
  ensure(typeof body?.data === 'string' && body.data.length < 32768 && typeof body.signature === 'string', 'Некоректний callback');
  ensure(equal(signature(body.data, config.privateKey), body.signature), 'Невірний підпис', 403);
  try { return JSON.parse(Buffer.from(body.data, 'base64').toString('utf8')); }
  catch { throw new Error('Invalid LiqPay JSON'); }
}
export function checkout(order: any, attempt: any) {
  const config = settings();
  ensure(attempt.publicKey === config.publicKey && attempt.testMode === config.testMode, 'Змінилися налаштування платежу. Зверніться до магазину.', 409);
  return { url: 'https://www.liqpay.ua/api/3/checkout', ...signed({
    version: 7, public_key: config.publicKey, action: 'hold', amount: (attempt.amountMinor / 100).toFixed(2),
    currency: 'UAH', order_id: attempt.providerOrderId, description: `Замовлення ${order.number}`,
    language: 'uk', paytypes: 'card', sender_email: order.email,
    server_url: new URL('/api/checkout/liqpay/callback', config.cms).toString(),
    result_url: new URL('/cart/checkout/success', config.web).toString(),
    expired_date: new Date(attempt.checkoutExpiresAt).toISOString().slice(0, 19).replace('T', ' '),
  }, config.privateKey) };
}
export async function status(attempt: any) {
  const config = settings();
  ensure(attempt.publicKey === config.publicKey, 'Ключ платежу змінився', 409);
  const response = await fetch('https://www.liqpay.ua/api/request', {
    method: 'POST', body: new URLSearchParams(signed({ version: 7, public_key: config.publicKey, action: 'status', order_id: attempt.providerOrderId }, config.privateKey)),
    signal: AbortSignal.timeout(10000),
  });
  ensure(response.ok, 'LiqPay тимчасово недоступний', 502);
  return response.json();
}
/**
 * Two-step payment, step 2: capture the held amount (LiqPay action hold_completion). Called only when the manager
 * confirms the order. The caller treats anything except status "success" (or "sandbox" in test mode) as not captured.
 */
export async function complete(attempt: any) {
  const config = settings();
  ensure(attempt.publicKey === config.publicKey && attempt.testMode === config.testMode, 'Ключ платежу змінився', 409);
  const response = await fetch('https://www.liqpay.ua/api/request', {
    method: 'POST', body: new URLSearchParams(signed({ version: 7, public_key: config.publicKey, action: 'hold_completion',
      order_id: attempt.providerOrderId, amount: (attempt.amountMinor / 100).toFixed(2) }, config.privateKey)),
    signal: AbortSignal.timeout(20000),
  });
  ensure(response.ok, 'LiqPay тимчасово недоступний', 502);
  return response.json();
}
/**
 * Release a hold that will not be captured (order cancelled): LiqPay action refund on the held payment.
 * The caller treats only status "reversed" / "success" (or "sandbox" in test mode) as released.
 */
export async function release(attempt: any) {
  const config = settings();
  ensure(attempt.publicKey === config.publicKey && attempt.testMode === config.testMode, 'Ключ платежу змінився', 409);
  const response = await fetch('https://www.liqpay.ua/api/request', {
    method: 'POST', body: new URLSearchParams(signed({ version: 7, public_key: config.publicKey, action: 'refund',
      order_id: attempt.providerOrderId, amount: (attempt.amountMinor / 100).toFixed(2) }, config.privateKey)),
    signal: AbortSignal.timeout(20000),
  });
  ensure(response.ok, 'LiqPay тимчасово недоступний', 502);
  return response.json();
}
