"use client"

import SideSummary from "@/components/checkout/SideSummary";
import StatBar from "@/components/layout/cart/StatBar";
import { usePathname } from "next/navigation";
import MobileOrderSummary from "@/components/checkout/MobileSummary";

export default function CheckoutStepsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const step =
    pathname.includes("/contact") ? 1 :
    pathname.includes("/delivery") ? 2 :
    pathname.includes("/payment") ? 3 :
    pathname.includes("/confirmation") ? 4 :
    1;

  return (
    <>
      <MobileOrderSummary />

      <div className="hidden lg:block">
        <StatBar currentStep={step}/>
      </div>
      <div className="checkout-container grid grid-cols-1 items-start gap-6 pt-6 pb-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:pt-10 lg:pb-20 xl:gap-10">
        {children}
        <aside className="hidden min-w-0 lg:block">
          <SideSummary />
        </aside>
      </div>
    </>
  );
}
