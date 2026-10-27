"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PaymentMethod = "cod" | "card" | "invoice";

export default function PaymentForm() {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("cod");

  const handleBack = () => {
    router.push("/cart/checkout/delivery");
  };

  const handleSubmit = () => {
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

              <span className="rounded bg-[#2e7d32] px-2 py-0.5 text-[12px] font-medium text-white">
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
            <div className="flex items-start justify-between gap-4">
              <div className="font-medium leading-tight">
                Оплата карткою онлайн (LiqPay / Portmone)
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <span className="border border-[#ddd] bg-white px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-[#1a1f71]">
                  VISA
                </span>
                <span className="border border-[#ddd] bg-white px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-[#eb001b]">
                  MC
                </span>
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
          Продовжити
        </button>
      </div>
    </>
  );
}