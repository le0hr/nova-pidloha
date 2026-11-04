"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { useCheckoutStore } from '@/store/checkout-store';
import { saveCheckout } from '@/lib/checkout/client';

export default function CheckoutSync() {
  const items = useCartStore(state => state.items);
  const order = useCheckoutStore(state => state.order);
  const router = useRouter();
  const hasOrder = Boolean(order);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (useCheckoutStore.getState().order?.submittedAt) router.replace('/cart/checkout/success');
  }, [router]);
  useEffect(() => {
    if (order?.submittedAt) return;
    if (!items.length && !hasOrder) return;
    let active = true;
    const timer = setTimeout(() => {
      saveCheckout('cart').then(() => { if (active) setError(''); }).catch(error => { if (active) setError(error.message); });
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [items, hasOrder, order?.submittedAt, retry, router]);
  return error ? <div role="alert" className="checkout-container py-3 text-sm text-red-700">{error} <button className="underline" onClick={() => setRetry(value => value + 1)}>Повторити збереження</button></div> : null;
}
