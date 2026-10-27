import { useState } from "react";
import ItemOptions from "@/components/cart/ItemOptions";
import { useCartStore } from "@/store/cart-store";


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
          {totalPrice} ₴
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 flex w-full flex-col gap-6 border-b border-[#E0E0E0] bg-white px-4 py-6 shadow-lg md:px-10">
          {/* товар */}
          {items.map((item) =>{
            return(
                <div key={item.id} className="flex items-center gap-6 self-stretch">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-[94px] w-[94px] shrink-0 rounded-[3px] border border-[#D9D9D9] object-cover"
                  />

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate font-inter text-3 font-medium leading-[1.25] text-[#1A1A1A]">
                      {item.name}
                    </span>

                    <ItemOptions mods={item.mods} />
                    <span className="font-inter text-[10px] font-normal leading-[1.25] text-[#666666]">
                      {item.qty} шт
                    </span>
                  </div>

                  <span className="shrink-0 font-outfit text-3 font-bold leading-[1.2] text-[#1A1A1A]">
                    {(item.price * item.qty).toLocaleString("uk-UA")} ₴
                  </span>
                </div>
            );


          })}
        </div>
      )}
    </div>
  );
}