"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { checkoutRequest, newCheckout, submitCheckout, openPayment, type OrderView, type PaymentCheckout } from '@/lib/checkout/client';
import { useCheckoutStore } from '@/store/checkout-store';
import { useCartStore } from '@/store/cart-store';

const messages: Record<string, string> = {
  pending: 'Очікуємо результат оплати. Якщо ви закрили платіжну сторінку, можна повернутися до неї.',
  held: 'Кошти зарезервовано на картці. Замовлення очікує підтвердження менеджера.',
  paid: 'Оплату отримано. Менеджер уточнить деталі замовлення.',
  unpaid: 'Замовлення прийнято. Менеджер зв’яжеться з вами для підтвердження наявності та деталей оплати.',
  failed: 'Оплата не вдалася. Кошти не підтверджено. Зверніться до магазину для уточнення або повторної оплати.',
  reversed: 'Банк повідомив про скасування платежу / розблокування коштів. Зверніться до магазину.',
  refunded: 'LiqPay повідомив про повернення коштів.',
  test: 'Тестовий платіж завершено. Це не підтвердження резервування реальних коштів.',
};
export default function SuccessPage() {
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const result = await checkoutRequest<OrderView>('status');
        if (active) { setOrder(result); setError(''); useCheckoutStore.getState().setOrder(result); }
      } catch (error) { if (active) setError((error as Error).message); }
    };
    void refresh(); const timer = setInterval(refresh, 10000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  const resume = async () => {
    if (!order) return;
    setBusy(true); setError('');
    try {
      const result = order.paymentStatus === 'failed'
        ? await checkoutRequest<{order: OrderView; checkout?: PaymentCheckout}>('retry')
        : await submitCheckout(order.totalMinor);
      if (result.checkout) openPayment(result.checkout);
      else { setOrder(result.order); setError('Платіжну сторінку вже закрито або строк оплати завершився. Зверніться до магазину.'); }
    } catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  };
  const startNew = async () => {
    setBusy(true);
    try {
      await newCheckout();
      // Remove only the submitted lines; preserve products added since submission.
      const cart = useCartStore.getState();
      for (const item of order?.items || []) {
        const current = cart.items.find(line => line.id === item.id);
        if (current) cart.updateQty(item.id, current.qty - item.qty);
      }
      router.push('/');
    } catch (error) { setError((error as Error).message); setBusy(false); }
  };
  return <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center gap-5 px-5 py-16 text-center">
    <h1 className="text-3xl font-bold">{order?.submittedAt ? 'Ваше замовлення' : 'Статус замовлення'}</h1>
    {order ? <>
      <p className="text-lg font-semibold">№ {order.number}</p>
      {order.testMode && <p className="font-semibold text-amber-800">Тестовий режим: реальні кошти не резервуються.</p>}
      <p>{order.submittedAt ? messages[order.paymentStatus] || 'Перевіряємо статус оплати.' : 'Оформлення ще не завершене.'}</p>
      <p className="font-semibold">{(order.totalMinor / 100).toLocaleString('uk-UA')} ₴</p>
      {['pending','failed'].includes(order.paymentStatus) && <button disabled={busy} onClick={resume} className="bg-[#e53935] px-6 py-3 font-semibold text-white">{order.paymentStatus === 'failed' ? 'Спробувати оплатити ще раз' : 'Продовжити оплату'}</button>}
      {!order.submittedAt && <Link href="/cart/checkout/contacts" className="underline">Повернутися до оформлення</Link>}
      {order.submittedAt && <button disabled={busy} onClick={startNew} className="border px-6 py-3">Продовжити покупки</button>}
    </> : !error && <p role="status">Перевіряємо замовлення…</p>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <Link href="/" className="text-sm underline">На головну</Link>
  </main>;
}
