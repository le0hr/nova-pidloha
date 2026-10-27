import Breadcrumb from "@/components/layout/shop/Breadcrumps";
import CartPageClient from "@/components/cart/CartPageClient";

export default function CartPage() {
  return (
    <main className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          {
            label: "Головна",
            href: "/",
          },
          {
            label: "Кошик",
          },
        ]}
      />

      <div className="flex flex-col self-stretch px-[80px] pb-[80px] pt-[24px]">
        <div className="flex pb-[32px] items-baseline gap-[16px]">
          <h1 className="font-['Outfit',sans-serif] text-[32px] font-bold leading-normal text-[#1A1A1A]">
            Кошик
          </h1>
        </div>

        <CartPageClient />
      </div>
    </main>
  );
}