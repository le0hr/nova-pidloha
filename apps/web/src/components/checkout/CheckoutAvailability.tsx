"use client";

import Link from "next/link";
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
  const { phone } = useCheckoutAvailability();
  return (
    <div className={`flex flex-col gap-2 border border-[#e0e0e0] bg-[#fafafa] ${compact ? "p-3" : "p-4"}`} role="note">
      <p className="font-['Outfit',sans-serif] text-[15px] font-bold text-[#1a1a1a]">Онлайн-оформлення — скоро</p>
      <p className="text-[13px] leading-relaxed text-[#555]">
        Поки що замовлення приймаємо за телефоном або у виставкових залах. Кошик збережеться — назвіть менеджеру товари з нього.
      </p>
      {phone && (
        <a href={`tel:${phone.replace(/[^+\d]/g, "")}`}
          className="flex h-[44px] items-center justify-center bg-[#e53935] font-['Inter',sans-serif] text-[15px] font-bold text-white transition-colors hover:bg-[#c62828]">
          Зателефонувати {phone}
        </a>
      )}
      <Link href="/#contacts" onClick={onNavigate} className="text-center text-[13px] font-semibold text-[#1a1a1a] underline">
        Адреси магазинів
      </Link>
    </div>
  );
}
