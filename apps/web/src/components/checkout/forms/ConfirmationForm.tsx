"use client"

import { useRouter } from "next/navigation";


export default function ConfirmationForm() {

    const router = useRouter();

  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-8">
      <div className="flex w-full flex-col items-start gap-6">
        <div className="flex w-full items-start justify-between  border border-[#D9D9D9]  p-5">
          <div className="flex flex-col items-start gap-2">
            <h2 className="font-inter text-[16px] font-bold leading-normal text-[#1A1A1A]">
              Контактні дані
            </h2>
            <div className="flex flex-col items-start gap-1 self-stretch">
                <p className="font-inter text-[14px] font-normal leading-normal text-[#1A1A1A]">
                Ковальчук Андрій Миколайович
                </p>

                <p className="font-inter text-[14px] font-normal leading-normal text-[#666666]">
                +38 (097) 123-45-67 · andriy@gmail.com
                </p>

                <p className="font-inter text-[13px] font-normal leading-normal text-[#999999]">
                ТОВ «БУД-МОНТАЖ» (ЄДРПОУ 43918231)
                </p>
            </div>
          </div>

          <button className="font-inter text-[14px] font-semibold leading-normal text-[#EF3434] underline">
            Змінити
          </button>
        </div>

        <div className="flex w-full items-start justify-between  border border-[#D9D9D9]  p-5">
          <div className="flex flex-col items-start gap-2">
            <h2 className="font-inter text-[16px] font-bold leading-normal text-[#1A1A1A]">
              Спосіб доставки
            </h2>
            <div className="flex flex-col items-start gap-1 self-stretch">
                <p className="font-inter text-[14зx] font-normal leading-normal text-[#1A1A1A]">
                Нова Пошта (відділення)
                </p>

                <p className="font-inter text-[13px] font-normal leading-normal text-[#666666]">
                Київ, Відділення №25, вул. Коновальця, 36
                </p>
            </div>
          </div>

          <button className="font-inter text-[14px] font-semibold leading-normal text-[#EF3434] underline">
            Змінити
          </button>
        </div>

        <div className="flex w-full items-start justify-between  border border-[#D9D9D9]  p-5">
          <div className="flex flex-col items-start gap-2">
            <h2 className="font-inter text-[16px] font-bold leading-normal text-[#1A1A1A]">
              Спосіб оплати
            </h2>
            <div className="flex flex-col items-start gap-1 self-stretch">
                <p className="font-inter text-[14px] font-normal leading-normal text-[#1A1A1A]">
                Накладений платіж (при отриманні)
                </p>
            </div>
          </div>

          <button className="font-inter text-[14px] font-semibold leading-normal text-[#EF3434] underline">
            Змінити
          </button>
        </div>

        <div className="flex w-full flex-col items-start gap-3">
          <label className="font-inter text-[14px] font-bold leading-normal text-[#1A1A1A]">
            Коментар до замовлення (необов'язково)
          </label>

          <textarea
            className="flex h-[100px] p-4 flex-col items-start self-stretch border border-[#E0E0E0] bg-white"
            placeholder="Бажаний час дзвінка, особливості під'їзду тощо..."
          />
        </div>
      </div>

      <div className="h-px w-full bg-[#D9D9D9]" />



      <button 
        type="button"
        onClick={() => router.push("/cart/checkout/success")}
        className="flex h-[86px] w-full items-center justify-center  bg-[#EF3434] font-inter text-[28px] font-bold leading-normal text-white">
        <a className="text-white font-outfit text-lg font-bold leading-normal">
            Підтвердити замовлення
        </a>
      </button>
    </div>
  );
}