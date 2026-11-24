import type CartItemType from "@/types/cart";
import { itemReceipt, money, type ReceiptRow } from "@/lib/catalog/receipt";

/** Receipt line: what it is, its details, its price on the right. */
export function ReceiptLine({ title, details, price, compact = false, showPrice = true }: ReceiptRow & { compact?: boolean; showPrice?: boolean }) {
  return (
    <div className={`flex items-start justify-between border-b border-[#e0e0e0] font-['Outfit',sans-serif] ${compact ? "gap-3 py-2 last:border-b-0 last:pb-0" : "gap-4 py-3"} first:pt-0`}>
      <div className="min-w-0 flex-1">
        <p title={compact ? title : undefined} className={`${compact ? "text-fs13" : "text-base"} font-semibold leading-snug text-[#1a1a1a] ${compact ? "truncate" : "[overflow-wrap:anywhere]"}`}>{title}</p>
        {details.map((detail, index) => <p key={`${index}-${detail}`} title={compact ? detail : undefined} className={`mt-0.5 ${compact ? "text-fs12" : "text-fs14"} leading-snug text-[#666] ${compact ? "truncate" : "[overflow-wrap:anywhere]"}`}>{detail}</p>)}
      </div>
      {showPrice && <span className={`shrink-0 whitespace-nowrap ${compact ? "text-fs13" : "text-base"} font-semibold text-[#1a1a1a]`}>{money(price)}</span>}
    </div>
  );
}

/** A cart item as a receipt. `qty`: prices for that many items (1 = per item, next to a quantity control). */
export default function ItemReceipt({ item, qty = 1, singlePrice = true }: { item: CartItemType; qty?: number;
  /** Show the price of a lone row (off where the price stands next to it anyway). */
  singlePrice?: boolean }) {
  const rows = itemReceipt(item, qty);
  return (
    <div className="flex min-w-0 flex-col">
      {rows.map((row, index) => <ReceiptLine key={index} {...row} compact showPrice={singlePrice || rows.length > 1} />)}
    </div>
  );
}
