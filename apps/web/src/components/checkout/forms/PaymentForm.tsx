"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCheckoutStore, type PaymentMethod } from "@/store/checkout-store";

export default function PaymentForm() {
  const router = useRouter();
  const { payment, setPayment, editing, setEditing } = useCheckoutStore();
  const [method, setMethod] = useState<PaymentMethod>(payment ?? "cod");

  const handleBack = () => {
    setPayment(method);
    router.push("/cart/checkout/delivery");
  };

  const handleSubmit = () => {
    setPayment(method);
    setEditing(false);
    router.push("/cart/checkout/confirmation");
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <label
          className={`flex cursor-pointer items-start gap-3 border bg-white px-4 py-4 transition-colors ${
            method === "cod"
              ? "border-[#e53935]"
              : "border-[#e0e0e0] hover:border-[#c0c0c0]"
          }`}
        >
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
            <div
              className={`h-4 w-4 rounded-full border-2 ${
                method === "cod"
                  ? "border-[#e53935] bg-[#e53935]"
                  : "border-[#b0b0b0] bg-white"
              }`}
            >
              {method === "cod" && (
                <div className="h-full w-full rounded-full border-2 border-white" />
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium leading-tight">
                Накладений платіж (при отриманні)
              </span>

              <span className="inline-flex shrink-0 items-center whitespace-nowrap border border-[#dedede] bg-[#f5f5f5] px-2 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.06em] text-[#555]">
                Рекомендовано
              </span>
            </div>

            <div className="mt-1.5 text-[13px] leading-snug text-[#777]">
              Оплата готівкою або карткою у відділенні Нової Пошти після
              перевірки товару. Зверніть увагу, що перевізник стягує комісію за
              зворотну доставку грошей (2% + 20 ₴).
            </div>
          </div>

          <input
            type="radio"
            name="payment"
            checked={method === "cod"}
            onChange={() => setMethod("cod")}
            className="sr-only"
          />
        </label>

        <label
          className={`flex cursor-pointer items-start gap-3 border bg-white px-4 py-4 transition-colors ${
            method === "card"
              ? "border-[#e53935]"
              : "border-[#e0e0e0] hover:border-[#c0c0c0]"
          }`}
        >
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
            <div
              className={`h-4 w-4 rounded-full border-2 ${
                method === "card"
                  ? "border-[#e53935] bg-[#e53935]"
                  : "border-[#b0b0b0] bg-white"
              }`}
            >
              {method === "card" && (
                <div className="h-full w-full rounded-full border-2 border-white" />
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="font-medium leading-tight">
                Оплата карткою онлайн
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { name: "Visa", file: "visa" },
                  { name: "Mastercard", file: "mastercard" },
                  { name: "Google Pay", file: "googlepay" },
                  { name: "Apple Pay", file: "applepay" },
                ].map(({ name, file }) => (
                  <span key={file} className="flex h-8 w-[50px] items-center justify-center overflow-hidden border border-[#e0e0e0] bg-white" title={name}>
                    <Image
                      src={`/images/payments/${file}.svg`}
                      alt={name}
                      width={48}
                      height={30}
                      className="h-[30px] w-12 object-contain"
                    />
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-1.5 text-[13px] leading-snug text-[#777]">
              Миттєва оплата будь-якою банківською карткою без додаткових
              комісій. Безпечний платіжний сертифікат.
            </div>
          </div>

          <input
            type="radio"
            name="payment"
            checked={method === "card"}
            onChange={() => setMethod("card")}
            className="sr-only"
          />
        </label>

        <label
          className={`flex cursor-pointer items-start gap-3 border bg-white px-4 py-4 transition-colors ${
            method === "invoice"
              ? "border-[#e53935]"
              : "border-[#e0e0e0] hover:border-[#c0c0c0]"
          }`}
        >
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
            <div
              className={`h-4 w-4 rounded-full border-2 ${
                method === "invoice"
                  ? "border-[#e53935] bg-[#e53935]"
                  : "border-[#b0b0b0] bg-white"
              }`}
            >
              {method === "invoice" && (
                <div className="h-full w-full rounded-full border-2 border-white" />
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="font-medium leading-tight">
              Безготівковий розрахунок (для юр. осіб)
            </div>

            <div className="mt-1.5 text-[13px] leading-snug text-[#777]">
              Рахунок-фактура буде надісланий на вказану електронну адресу після
              обробки замовлення менеджером. Пакет документів надається разом із
              товаром.
            </div>
          </div>

          <input
            type="radio"
            name="payment"
            checked={method === "invoice"}
            onChange={() => setMethod("invoice")}
            className="sr-only"
          />
        </label>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="border border-[#222] bg-white px-6 py-2.5 text-[15px] font-medium text-[#222] transition hover:bg-[#f5f5f5]"
        >
          Назад
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="bg-[#e53935] px-8 py-2.5 text-[15px] font-medium text-white transition hover:bg-[#d32f2f]"
        >
          {editing ? "Зберегти зміни" : "Продовжити"}
        </button>
      </div>
    </>
  );
}