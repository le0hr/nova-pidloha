import { useState } from "react";
import ItemReceipt from "@/components/cart/Receipt";
import { money } from "@/lib/catalog/receipt";
import { useCartStore } from "@/store/cart-store";
import { imageSrc } from "@/lib/image";


export default function MobileOrderSummary() {
  const [isOpen, setIsOpen] = useState(false);
  const items = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice())
  const totalItems = useCartStore((s) => s.totalItems())
  return (
    <div className="relative flex flex-col self-stretch bg-white lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="checkout-container flex items-center justify-between border-y border-[#E0E0E0] py-5 text-left"
      >
        <div className="flex items-center gap-4">
          <h2 className="font-outfit text-4 font-bold leading-[1.1] text-[#1A1A1A]">
            Ваше замовлення ({totalItems})
          </h2>

          <span
            className={`font-outfit text-3 leading-none transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ⌄
          </span>
        </div>

        <span className="font-outfit text-4 font-bold leading-[1.1] text-[#E53935]">
          {money(totalPrice)}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 flex max-h-[70dvh] w-full flex-col overflow-y-auto gap-6 border-b border-[#E0E0E0] bg-white px-4 py-6 shadow-lg md:px-10">
          {/* товар */}
          {items.map((item) =>{
            return(
                <div key={item.id} className="flex items-start gap-4 self-stretch">
                  <img
                    src={imageSrc(item.image, 256)}
                    alt={item.name}
                    className="size-16 shrink-0 rounded-[3px] border border-[#D9D9D9] object-cover"
                  />

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <ItemReceipt item={item} qty={item.qty} />
                    {!!item.addons?.length && <div className="flex justify-between gap-3 font-outfit text-sm font-bold text-[#1A1A1A]">
                      <span className="font-inter text-xs font-normal text-[#666]">Кількість: {item.qty}</span>
                      <span>{money(Math.round(item.price * item.qty * 100) / 100)}</span>
                    </div>}
                  </div>
                </div>
            );


          })}
        </div>
      )}
    </div>
  );
}