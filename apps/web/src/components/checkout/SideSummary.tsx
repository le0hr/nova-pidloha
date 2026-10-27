import Image from "next/image";
import { useCartStore } from "@/store/cart-store";
import ItemOptions from "@/components/cart/ItemOptions";

export default function SideSummary() {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice());

  return (
    <section aria-labelledby="order-summary-title" className="w-full min-w-0 rounded-[2px] border border-[#e0e0e0] bg-white">
      <div className="border-b border-[#e0e0e0] p-4 lg:p-6">
        <h2 id="order-summary-title" className="font-outfit text-xl font-bold text-[#1a1a1a]">Ваше замовлення</h2>
      </div>
      {items.length > 0 && <ul className="divide-y divide-[#e0e0e0] px-4 lg:px-6">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 py-4">
            <Image src={item.image} alt={item.name} width={64} height={64} unoptimized className="size-16 shrink-0 border border-[#e0e0e0] object-cover" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="break-words font-inter text-sm font-medium leading-snug text-[#1a1a1a]">{item.name}</p>
              <ItemOptions mods={item.mods} />
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="font-inter text-xs text-[#666]">Кількість: {item.qty}</span>
                <span className="font-outfit text-sm font-bold text-[#1a1a1a]">{(item.price * item.qty).toLocaleString("uk-UA")} ₴</span>
              </div>
            </div>
          </li>
        ))}
      </ul>}
      <div className={`flex flex-wrap items-baseline justify-between gap-2 bg-[#f7f7f7] p-4 lg:p-6 ${items.length ? "border-t border-[#e0e0e0]" : ""}`}>
        <span className="font-outfit text-base font-bold text-[#1a1a1a]">Всього до сплати</span>
        <span className="font-outfit text-2xl font-bold text-[#e53935]">{totalPrice.toLocaleString("uk-UA")} ₴</span>
      </div>
    </section>
  );
}
