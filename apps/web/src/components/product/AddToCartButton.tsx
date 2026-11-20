"use client";
import { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { configuredItem } from "@/lib/catalog/configured-item";
import ItemOptions from "@/components/cart/ItemOptions";
import { ProductVariation, ProductAddon } from "@/types/product";
import { trackAddToCart } from "@/lib/analytics";

interface AddToCartButtonProps {
  variation: ProductVariation;
  productName: string;
  addons?: ProductAddon[];
  /** Chosen door size; for a non-standard one `variation.price` already includes its surcharge. */
  size?: { width: number; height: number; custom?: boolean; percent?: number };
  inStock?: boolean;
  leadDays?: number;
  /** Floor: price per pack of `area` m² (null = per piece), `qty` packs at once. */
  pack?: { area: number | null; qty: number };
}

export default function AddToCartButton({
  variation,
  productName,
  inStock = true,
  addons = [],
  size,
  pack,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  // Only what the catalog says ("Наявність": склад / під замовлення); nothing when the supplier gives no data.
  const availability = Object.entries(variation.catalog_attributes ?? {}).find(([key]) => /наявн/i.test(key))?.[1];
  const stock = typeof availability === "string" && availability.trim()
    ? /^\s*(склад|в наявн|є(\s|$)|так(\s|$))/i.test(availability) ? { inStock: true, label: "Є в наявності" }
      : /замовл/i.test(availability) ? { inStock: false, label: "Під замовлення" }
      : { inStock: false, label: availability.trim() }
    : !inStock ? { inStock: false, label: "Немає в наявності" } : null;
  const cartStore = useCartStore();
  const item = configuredItem(variation, productName, addons, size, pack?.area);
  const qty = pack?.qty ?? 1;
  const total = Math.round(item.price * qty * 100) / 100;

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);

    cartStore.addItem(item, qty);
    trackAddToCart({ item_id: variation.slug, item_name: productName, item_variant: [variation.decor_color?.name, variation.decor_glass?.name].filter(Boolean).join(", ") || undefined,
      price: item.price, quantity: qty });
  };

  return (
    <div className="bg-[#f7f7f7] border border-[#e0e0e0]  flex flex-col gap-[16px] p-[20px] w-full">
      {/* Stock status */}
      {stock && <div className="flex items-center gap-[8px]">
        <span className={`w-[8px] h-[8px] ${stock.inStock ? "bg-[#43a047]" : "bg-[#f57c00]"}`} />
        <span className={`font-['Outfit',sans-serif] font-semibold text-[14px] ${stock.inStock ? "text-[#43a047]" : "text-[#e65100]"}`}>
          {stock.label}
        </span>
      </div>}

      {/* Price row */}
      <span className="font-['Outfit',sans-serif] font-bold text-[#e53935] text-[32px]">
        ₴ {total.toLocaleString("uk-UA")}
      </span>

      <div className="border-t border-[#e0e0e0]" />

      <ItemOptions mods={item.mods} />

      {/* Total row */}
      <div className="flex items-center justify-between">
        <span className="font-['Outfit',sans-serif] font-semibold text-[#1a1a1a] text-[16px]">
          Разом:
        </span>
        <span className="font-['Outfit',sans-serif] font-bold text-[#1a1a1a] text-[24px]">
          ₴ {total.toLocaleString("uk-UA")}
        </span>
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAdd}
        disabled={!inStock}
        className={`w-full py-[14px] font-['Outfit',sans-serif] font-bold text-white transition-colors ${
          added
            ? "bg-[#43a047]"
            : "bg-[#e53935] hover:bg-[#c62828] active:bg-[#b71c1c] disabled:bg-[#bdbdbd] disabled:cursor-not-allowed"
        }`}
      >
        {added ? "Додано в кошик ✓" : "Додати в кошик"}
      </button>
    </div>
  );
}