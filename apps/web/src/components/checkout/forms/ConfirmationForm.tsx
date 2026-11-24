"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { saveCheckout, submitCheckout, openPayment } from "@/lib/checkout/client";
import { useCheckoutStore, DELIVERY_LABELS, PAYMENT_LABELS } from "@/store/checkout-store";
import { useCartStore } from "@/store/cart-store";

function DetailSection({ title, step, children }: { title: string; step: string; children: ReactNode }) {
  const setEditing = useCheckoutStore((state) => state.setEditing);
  return (
    <section className="w-full border border-[#e0e0e0] p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-[#1a1a1a]">{title}</h2>
        <Link href={`/cart/checkout/${step}`} onClick={() => setEditing(true)} aria-label={`Змінити: ${title.toLowerCase()}`} className="shrink-0 text-sm font-medium text-[#e53935] underline underline-offset-4 hover:text-[#c62828]">Змінити</Link>
      </div>
      <div className="space-y-1 break-words text-sm leading-relaxed text-[#666]">{children}</div>
    </section>
  );
}

export default function ConfirmationForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const order = useCheckoutStore(state => state.order);
  const { contacts, delivery, payment, comment, setComment } = useCheckoutStore();
  const items = useCartStore((state) => state.items);
  const contactsReady = Boolean(contacts?.firstName.trim() && contacts?.lastName.trim() && contacts?.phone.trim() && contacts?.email.trim() && (!contacts.isCompany || (contacts.companyName.trim() && contacts.edrpou.trim())));
  const deliveryReady = Boolean(delivery && (
    delivery.method === "pickup" ? delivery.pickupShop :
    delivery.method === "nova" ? delivery.city && delivery.warehouse && delivery.warehouse.cityRef === delivery.city.ref :
    delivery.address?.trim()
  ));
  const ready = contactsReady && deliveryReady && Boolean(payment) && items.length > 0;

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      saveCheckout('confirmation').catch(error => setSaveError(error.message));
    }, 500);
    return () => clearTimeout(timer);
  }, [ready, comment]);

  const submit = async () => {
    if (!ready || saving || !order) return;
    setSaving(true); setSaveError("");
    try {
      const saved = await saveCheckout('confirmation');
      if (saved.totalMinor !== order.totalMinor) throw new Error('Ціни змінилися. Перевірте оновлену суму та підтвердіть ще раз.');
      const result = await submitCheckout(saved.totalMinor);
      useCheckoutStore.getState().setOrder(result.order);
      if (result.checkout) openPayment(result.checkout);
      else router.push('/cart/checkout/success');
    } catch (error) { setSaveError((error as Error).message); setSaving(false); }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <DetailSection title="Контактні дані" step="contacts">
        {contacts ? <>
          <p className="font-medium text-[#1a1a1a]">{contacts.lastName} {contacts.firstName}</p>
          <p>{contacts.phone}</p>
          <p>{contacts.email}</p>
          {contacts.isCompany && <p>{contacts.companyName} · ЄДРПОУ {contacts.edrpou}</p>}
        </> : <p>Заповніть контактні дані.</p>}
      </DetailSection>

      <DetailSection title="Спосіб доставки" step="delivery">
        {delivery ? <>
          <p className="font-medium text-[#1a1a1a]">{DELIVERY_LABELS[delivery.method]}</p>
          {delivery.method === "pickup" && delivery.pickupShop && <>
            <p>{delivery.pickupShop.name}</p>
            {delivery.pickupShop.address && <p>{delivery.pickupShop.address}</p>}
            {delivery.pickupShop.hours && <p>{delivery.pickupShop.hours}</p>}
            <p>Безкоштовно</p>
          </>}
          {delivery.method === "nova" && <>
            <p>{[delivery.city?.name, delivery.city?.area].filter(Boolean).join(", ")}</p>
            <p>{delivery.warehouse?.description}</p>
            <p>За тарифами перевізника</p>
          </>}
          {(delivery.method === "courier" || delivery.method === "address") && <>
            <p>{delivery.address}</p>
            <p>{delivery.method === "courier" ? "Від 450 ₴" : "За тарифами перевізника"}</p>
          </>}
          {!deliveryReady && <p className="text-red-700">Уточніть дані доставки.</p>}
        </> : <p>Оберіть спосіб доставки.</p>}
      </DetailSection>

      <DetailSection title="Спосіб оплати" step="payment">
        <p className="font-medium text-[#1a1a1a]">{payment ? PAYMENT_LABELS[payment] : "Оберіть спосіб оплати."}</p>
      </DetailSection>

      <div>
        <label htmlFor="order-comment" className="mb-2 block text-sm font-medium text-[#1a1a1a]">Коментар до замовлення (необов’язково)</label>
        <textarea id="order-comment" value={comment} onChange={(event) => setComment(event.target.value)} rows={3} className="w-full resize-y border border-[#e0e0e0] p-3 text-sm outline-none focus:border-[#e53935]" placeholder="Бажаний час дзвінка, особливості під’їзду тощо…" />
      </div>
      <div className="border-t border-[#e0e0e0] pt-5">
        {!ready && <p role="status" className="mb-3 text-sm text-red-700">{items.length ? "Заповніть контактні дані та оберіть доставку й оплату перед підтвердженням." : "Додайте товари до кошика перед підтвердженням."}</p>}
        {order && <p className="mb-3 font-semibold">До {payment === 'card' ? 'резервування' : 'сплати'}: {(order.totalMinor / 100).toLocaleString('uk-UA')} ₴</p>}
        <p className="mb-3 text-sm text-[#666]">Доставка, крім самовивозу, оплачується окремо. Її вартість уточнить менеджер.</p>
        {saveError && <p role="alert" className="mb-3 text-sm text-red-700">{saveError}</p>}
        <button type="button" disabled={!ready || saving || !order} onClick={submit} className="min-h-11 w-full bg-[#e53935] px-6 py-3 text-fs15 font-semibold text-white transition-colors hover:bg-[#d32f2f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e53935] disabled:cursor-not-allowed disabled:bg-[#bdbdbd] sm:w-auto">
          {saving ? "Зачекайте…" : payment === "card" ? "Перейти до оплати" : "Підтвердити замовлення"}
        </button>
      </div>
    </div>
  );
}
