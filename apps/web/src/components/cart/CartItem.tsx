"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import CartItemType from "@/types/cart"

function QtyControl({
  qty,
  onMinus,
  onPlus,
}: {
  qty: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="flex items-center border border-[#E0E0E0]">
      <button
        type="button"
        onClick={onMinus}
        className="flex size-[32px] items-center justify-center transition-colors hover:bg-[#F7F7F7]"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6H9.5"
            stroke="#1A1A1A"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <span className="flex h-[32px] w-[40px] items-center justify-center border-x border-[#E0E0E0] font-['Inter',sans-serif] text-[13px] font-semibold text-[#1A1A1A]">
        {qty}
      </span>

      <button
        type="button"
        onClick={onPlus}
        className="flex size-[32px] items-center justify-center transition-colors hover:bg-[#F7F7F7]"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 2.5V9.5M2.5 6H9.5"
            stroke="#1A1A1A"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}



export default function CartItem( {item}:{item:CartItemType} ) {
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);

  return (
    <tr className="border-b border-[#E0E0E0] last:border-b-0 md:table-row block">
      {/*Image */}
      <td className="px-[16px] pt-[16px] pb-[8px] md:px-[24px] md:py-[20px] block md:table-cell md:w-[100px]">
        <div className="size-[72px] md:size-[80px] overflow-hidden border border-[#E0E0E0] bg-[#F7F7F7]">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>
      </td>

      {/* Name */}
      <td className="px-[16px] py-[4px] md:px-[12px] md:py-[20px] block md:table-cell">
        <Link
          href={`/product/${item.id}`}
          className="line-clamp-2 font-['Outfit',sans-serif] text-[14px] md:text-[15px] font-semibold text-[#1A1A1A] transition-colors hover:text-[#E53935]"
        >
          {item.name}
        </Link>
      </td>

      {/* Mods */}
      <td className="px-[16px] py-[4px] md:px-[12px] md:py-[20px] block md:table-cell md:min-w-[160px]">
        {item.mods && item.mods.length > 0 ? (
          <div className="flex flex-col gap-[1px]">
            {item.mods.map((mod, index) => (
              <span
                key={`${item.id}-mod-${index}`}
                className="font-['Inter',sans-serif] text-[12px] text-[#9E9E9E]"
              >
                {mod}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[12px] text-[#BDBDBD]">—</span>
        )}
      </td>

      {/* Price */}
      <td className="px-[16px] py-[8px] md:px-[12px] md:py-[20px] block md:table-cell md:w-[110px] md:text-center">
        <div className="flex items-center justify-between md:block">
          <span className="font-['Inter',sans-serif] text-[12px] text-[#9E9E9E] md:hidden">
            Ціна
          </span>
          <span className="font-['Outfit',sans-serif] text-[14px] font-semibold text-[#1A1A1A]">
            ₴{item.price.toLocaleString("uk-UA")}
          </span>
        </div>
      </td>

      {/* Qty */}
      <td className="px-[16px] py-[8px] md:px-[12px] md:py-[20px] block md:table-cell md:w-[140px]">
        <div className="flex items-center justify-between md:justify-center">
          <span className="font-['Inter',sans-serif] text-[12px] text-[#9E9E9E] md:hidden">
            Кількість
          </span>
          <QtyControl
            qty={item.qty}
            onMinus={() => updateQty(item.id, item.qty - 1)}
            onPlus={() => updateQty(item.id, item.qty + 1)}
          />
        </div>
      </td>

      {/* Sum */}
      <td className="px-[16px] py-[8px] md:px-[12px] md:py-[20px] block md:table-cell md:w-[110px] md:text-right">
        <div className="flex items-center justify-between md:block">
          <span className="font-['Inter',sans-serif] text-[12px] text-[#9E9E9E] md:hidden">
            Сума
          </span>
          <span className="font-['Outfit',sans-serif] text-[15px] font-bold text-[#1A1A1A]">
            ₴{(item.price * item.qty).toLocaleString("uk-UA")}
          </span>
        </div>
      </td>

      {/* Dlt */}
      <td className="px-[16px] pb-[16px] pt-[4px] md:px-[12px] md:py-[20px] block md:table-cell md:w-[40px] md:text-center">
        <div className="flex justify-end md:justify-center">
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="inline-flex size-[32px] items-center justify-center text-[#9E9E9E] transition-colors hover:text-[#E53935]"
            aria-label="Видалити товар"
          >
            <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
              <path d="M2 4H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M6 7V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M10 7V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M3 4L4 13C4.0625 13.5625 4.53959 14 5.10608 14H10.8939C11.4604 14 11.9375 13.5625 12 13L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}