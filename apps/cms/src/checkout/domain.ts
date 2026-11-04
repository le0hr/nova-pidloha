import { createHash, timingSafeEqual } from 'node:crypto';

export class CheckoutError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function ensure(condition: unknown, message: string, status = 400): asserts condition {
  if (!condition) throw new CheckoutError(message, status);
}
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export const equal = (a: string, b: string) => Buffer.byteLength(a) === Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a), Buffer.from(b));
export function money(value: unknown): number {
  ensure((typeof value === 'string' && value.trim() !== '') || typeof value === 'number', 'Некоректна ціна');
  const amount = Number(value);
  ensure(Number.isFinite(amount) && Math.abs(amount) <= 10000000, 'Некоректна ціна');
  return Math.round(amount * 100);
}
export type Item = { id: string; variationSlug: string; name: string; qty: number; unit: number; addons: {id: string; name: string; price: number}[]; mods: string[]; sku?: string; productId?: string; variationId?: string };
export function text(value: unknown, max = 200) {
  ensure(typeof value === 'string' && value.length <= max, 'Некоректне текстове поле');
  return value.trim();
}
export function contacts(input: any) {
  ensure(input && typeof input === 'object', 'Заповніть контакти');
  const firstName = text(input.firstName), lastName = text(input.lastName);
  const phone = text(input.phone, 40).replace(/[\s()\-]/g, '');
  const email = text(input.email, 254);
  ensure(firstName && lastName && /^\+380\d{9}$/.test(phone) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Перевірте ім’я, телефон та email');
  const isCompany = input.isCompany === true;
  const companyName = text(input.companyName || ''), edrpou = text(input.edrpou || '', 20);
  ensure(!isCompany || (companyName && /^\d{8}$/.test(edrpou)), 'Перевірте назву компанії та ЄДРПОУ');
  return {firstName, lastName, customerName: `${lastName} ${firstName}`, phone, email, isCompany, companyName: isCompany ? companyName : '', edrpou: isCompany ? edrpou : ''};
}
export function paymentState(status: string, testMode = false) {
  if (status === 'sandbox') return testMode ? 'test' : 'pending';
  if (status === 'hold_wait') return 'held';
  if (['success', 'wait_compensation'].includes(status)) return 'paid';
  if (['failure', 'error'].includes(status)) return 'failed';
  if (status === 'reversed') return 'reversed';
  if (status === 'refund') return 'refunded';
  return 'pending';
}
// Delayed callbacks must not downgrade an already settled/authorized payment.
export function canTransition(from: string, to: string) {
  if (from === to) return true;
  if (['refunded', 'reversed'].includes(from)) return false;
  if (from === 'paid') return ['refunded', 'reversed'].includes(to);
  if (from === 'held') return ['paid', 'reversed', 'refunded'].includes(to);
  if (from === 'test') return false;
  if (from === 'failed') return ['held', 'paid', 'reversed', 'refunded'].includes(to);
  return true;
}
