import { CheckoutError, ensure, equal } from '../../../checkout/domain';
import * as orders from '../../../checkout/orders';
import { decode } from '../../../checkout/liqpay';

function token(ctx: any) {
  const key = process.env.CHECKOUT_API_SECRET || '';
  ensure(key.length >= 32 && equal(ctx.get('x-checkout-key'), key), 'Доступ заборонено', 403);
  const value = ctx.get('x-checkout-session');
  ensure(/^[a-f0-9]{64}$/.test(value), 'Некоректна сесія', 403);
  return value;
}
async function handle(ctx: any, run: () => Promise<any>) {
  ctx.set('Cache-Control', 'no-store');
  try { ctx.body = await run(); }
  catch (error) {
    if (error instanceof CheckoutError) { ctx.status = error.status; ctx.body = {error: error.message}; }
    else { strapi.log.error('Checkout operation failed', error); ctx.status = 500; ctx.body = {error: 'Не вдалося зберегти замовлення. Спробуйте ще раз.'}; }
  }
}
export default {
  async save(ctx: any) { await handle(ctx, () => orders.save(strapi, token(ctx), ctx.request.body)); },
  async submit(ctx: any) { await handle(ctx, () => orders.submit(strapi, token(ctx), ctx.request.body?.expectedTotal)); },
  async retry(ctx: any) { await handle(ctx, () => orders.retryPayment(strapi, token(ctx))); },
  async status(ctx: any) { await handle(ctx, () => orders.getStatus(strapi, token(ctx))); },
  async callback(ctx: any) { await handle(ctx, async () => { await orders.applyPayment(strapi, decode(ctx.request.body)); return {ok: true}; }); },
};
