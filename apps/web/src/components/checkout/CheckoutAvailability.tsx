"use client";

import Link from "next/link";
import LineIcon from "@/components/LineIcon";
import { SHOP_LIST_HREF, SHOP_MAP_HREF } from "@/lib/catalog/shop-locations";
import { createContext, useContext, type ReactNode } from "react";

type Availability = { enabled: boolean; phone?: string };
const Context = createContext<Availability>({ enabled: false });

/** Server layouts pass the checkout switch and the shop phone down to the cart buttons. */
export function CheckoutAvailabilityProvider({ value, children }: { value: Availability; children: ReactNode }) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useCheckoutAvailability = () => useContext(Context);

/** Shown instead of "Оформити замовлення" while online checkout is off. */
export function CheckoutComingSoon({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  return (
    <div className={`flex flex-col gap-2 border border-[#e0e0e0] bg-[#fafafa] ${compact ? "p-3" : "p-4"}`} role="note">
      <p className="font-['Outfit',sans-serif] text-fs15 font-bold text-[#1a1a1a]">Онлайн-оформлення — скоро</p>
      <p className="text-fs13 leading-relaxed text-[#555]">
        Поки що замовлення приймаємо за телефоном або у виставкових залах. Кошик збережеться — назвіть менеджеру товари з нього.
      </p>
      <Link href={SHOP_LIST_HREF} onClick={onNavigate}
        className="flex min-h-[44px] items-center justify-center bg-[#e53935] px-3 py-2 text-center font-['Inter',sans-serif] text-fs15 font-bold leading-tight text-white transition-colors hover:bg-[#c62828]">
        Зателефонувати
      </Link>
      <Link href={SHOP_MAP_HREF} onClick={onNavigate}
        className="flex min-h-[44px] items-center justify-center gap-2 border border-[#1a1a1a] bg-white px-3 py-2 text-center font-['Inter',sans-serif] text-fs15 font-semibold leading-tight text-[#1a1a1a] transition-colors hover:bg-[#f7f7f7]">
        <LineIcon name="pin" className="w-5 text-[#e53935]" />Адреси магазинів
      </Link>
    </div>
  );
}
