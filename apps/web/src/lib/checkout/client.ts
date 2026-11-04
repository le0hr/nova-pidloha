import { useCartStore } from '@/store/cart-store';
import { useCheckoutStore } from '@/store/checkout-store';

export type OrderView = {
  number: string; checkoutStep: string; orderStatus: string; paymentStatus: string;
  testMode: boolean; paymentMethod: string; totalMinor: number; currency: string; submittedAt: string | null;
  items: {id: string; name: string; unit: number; qty: number}[];
};
export type PaymentCheckout = {url: string; data: string; signature: string};
export async function checkoutRequest<T>(action: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/checkout/${action}`, {
    method: action === 'status' ? 'GET' : 'POST', headers: {'Content-Type': 'application/json'},
    ...(action !== 'status' ? {body: JSON.stringify(body || {})} : {}), cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(typeof data.error === 'string' ? data.error : 'Не вдалося зберегти замовлення. Спробуйте ще раз.'), {status: response.status});
  return data;
}
let session: Promise<unknown> | undefined;
let queue: Promise<unknown> = Promise.resolve();
export function saveCheckout(step: 'cart' | 'contacts' | 'delivery' | 'payment' | 'confirmation') {
  // Serialize saves so that a slower previous step cannot overwrite newer data.
  const task = queue.catch(() => {}).then(async () => {
    if (!session) session = checkoutRequest('session').then(async () => {
      // Recover a submitted order after a lost response or browser reload.
      try {
        const existing = await checkoutRequest<OrderView>('status');
        if (existing.submittedAt) useCheckoutStore.getState().setOrder(existing);
      } catch { /* A new session has no order yet; saving below creates it. */ }
    }).catch(error => { session = undefined; throw error; });
    await session;
    const state = useCheckoutStore.getState();
    if (state.order?.submittedAt) return state.order;
    const order = await checkoutRequest<OrderView>('draft', {step, items: useCartStore.getState().items,
      contacts: state.contacts, delivery: state.delivery, payment: state.payment, comment: state.comment}).catch(async error => {
      if (error.status === 409) {
        const existing = await checkoutRequest<OrderView>('status');
        if (existing.submittedAt) return existing;
      }
      throw error;
    });
    useCheckoutStore.getState().setOrder(order);
    return order;
  });
  queue = task;
  return task;
}
export async function submitCheckout(expectedTotal: number) {
  await queue.catch(() => {});
  return checkoutRequest<{order: OrderView; checkout?: PaymentCheckout}>('submit', {expectedTotal});
}
export function openPayment(payment: PaymentCheckout) {
  if (payment.url !== 'https://www.liqpay.ua/api/3/checkout') throw new Error('Невірна адреса оплати');
  const form = document.createElement('form');
  form.method = 'POST'; form.action = payment.url;
  for (const name of ['data','signature'] as const) {
    const input = document.createElement('input'); input.type = 'hidden'; input.name = name; input.value = payment[name]; form.appendChild(input);
  }
  document.body.appendChild(form); form.submit();
}
export async function newCheckout() {
  await checkoutRequest('new'); session = undefined;
  useCheckoutStore.getState().resetCheckout();
}
