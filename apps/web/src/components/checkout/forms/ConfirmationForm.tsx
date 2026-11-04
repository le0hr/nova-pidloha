"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
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
  const { contacts, delivery, payment, comment, setComment } = useCheckoutStore();
  const items = useCartStore((state) => state.items);
  const contactsReady = Boolean(contacts?.firstName.trim() && contacts?.lastName.trim() && contacts?.phone.trim() && contacts?.email.trim() && (!contacts.isCompany || (contacts.companyName.trim() && contacts.edrpou.trim())));
  const deliveryReady = Boolean(delivery && (
    delivery.method === "pickup" ? delivery.pickupShop :
    delivery.method === "nova" ? delivery.city && delivery.warehouse && delivery.warehouse.cityRef === delivery.city.ref :
    delivery.address?.trim()
  ));
  const ready = contactsReady && deliveryReady && Boolean(payment) && items.length > 0;

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
        <button type="button" disabled={!ready} onClick={() => { if (ready) router.push("/cart/checkout/success"); }} className="min-h-11 w-full bg-[#e53935] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#d32f2f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e53935] disabled:cursor-not-allowed disabled:bg-[#bdbdbd] sm:w-auto">
          Підтвердити замовлення
        </button>
      </div>
    </div>
  );
}
