"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import CartItem from "./CartItem";
import { useRouter } from "next/navigation";
export default function FilledCart() {
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const router = useRouter();
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="flex flex-col gap-[32px] lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 border border-[#E0E0E0]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
              {/* Table  Header */}
            <thead>
              <tr className="hidden border-b border-[#E0E0E0] md:table-row">
                <th className="w-[100px] px-[24px] py-[14px] text-left font-['Inter',sans-serif] text-[12px] font-medium uppercase text-[#9E9E9E]">
                  Фото
                </th>
                <th className="px-[12px] py-[14px] text-left font-['Inter',sans-serif] text-[12px] font-medium uppercase text-[#9E9E9E]">
                  Назва
                </th>
                <th className="min-w-[160px] px-[12px] py-[14px] text-left font-['Inter',sans-serif] text-[12px] font-medium uppercase text-[#9E9E9E]">
                  Модифікації
                </th>
                <th className="w-[110px] px-[12px] py-[14px] text-center font-['Inter',sans-serif] text-[12px] font-medium uppercase text-[#9E9E9E]">
                  Ціна
                </th>
                <th className="w-[140px] px-[12px] py-[14px] text-center font-['Inter',sans-serif] text-[12px] font-medium uppercase text-[#9E9E9E]">
                  Кількість
                </th>
                <th className="w-[110px] px-[12px] py-[14px] text-right font-['Inter',sans-serif] text-[12px] font-medium uppercase text-[#9E9E9E]">
                  Сума
                </th>
                <th className="w-[40px] px-[12px] py-[14px]" />
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Continue shopping */}
        <div className="border-t border-[#E0E0E0] px-[24px] py-[16px]">
          <Link
            href="/catalog"
            className="font-['Outfit',sans-serif] text-[13px] font-semibold text-[#1A1A1A] transition-colors hover:text-[#E53935]"
          >
            ← Продовжити покупки
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="w-full shrink-0 border border-[#E0E0E0] lg:w-[360px]">
        <div className="border-b border-[#E0E0E0] px-[24px] py-[18px]">
          <h2 className="font-['Outfit',sans-serif] text-[20px] font-bold text-[#1A1A1A]">
            Підсумок
          </h2>
        </div>

        <div className="flex flex-col gap-[14px] px-[24px] py-[20px]">
          <div className="flex items-center justify-between">
            <span className="font-['Inter',sans-serif] text-[14px] text-[#666666]">
              Товари
            </span>
            <span className="font-['Outfit',sans-serif] text-[14px] font-semibold text-[#1A1A1A]">
              {totalQty}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-['Inter',sans-serif] text-[14px] text-[#666666]">
              Доставка
            </span>
            <span className="font-['Inter',sans-serif] text-[14px] text-[#666666]">
              За домовленістю
            </span>
          </div>

          <div className="my-[4px] border-t border-[#E0E0E0]" />

          <div className="flex items-center justify-between">
            <span className="font-['Inter',sans-serif] text-[15px] font-medium text-[#1A1A1A]">
              Разом
            </span>
            <span className="font-['Outfit',sans-serif] text-[22px] font-extrabold text-[#E53935]">
              ₴{totalPrice.toLocaleString("uk-UA")}
            </span>
          </div>

          <button
            onClick={() => {router.push('/cart/checkout/contacts')}}
            type="button"
            className="mt-[8px] w-full bg-[#E53935] py-[14px] font-['Outfit',sans-serif] text-[15px] font-bold text-white transition-colors hover:bg-[#C62828]"
          >
            Оформити замовлення
          </button>
        </div>
      </div>
    </div>
  );
}