"use client";
import { useState, useSyncExternalStore } from "react";
import { useCartStore } from "@/store/cart-store";
import { configuredItem } from "@/lib/catalog/configured-item";
import { addonLineTotal } from "@/lib/catalog/addons";
import { cartItemHref, lineKey } from "@/lib/catalog/item-link";
import { addonDetail, money } from "@/lib/catalog/receipt";
import { ReceiptLine } from "@/components/cart/Receipt";
import { ProductVariation, ProductAddon } from "@/types/product";
import { trackAddToCart } from "@/lib/analytics";
import type CartItemType from "@/types/cart";

const subscribe = () => () => {};

interface AddToCartButtonProps {
  variation: ProductVariation;
  productName: string;
  productSlug: string;
  /** Key of the cart line opened for editing. */
  editLine?: string;
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
  productSlug,
  editLine,
  inStock = true,
  addons = [],
  size,
  pack,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  // Only what the catalog says; nothing when the supplier gives no data.
  const stock = variation.availability === "in_stock" ? { inStock: true, label: "Є в наявності" }
    : variation.availability === "on_order" ? { inStock: false, label: "Під замовлення" }
    : !inStock ? { inStock: false, label: "Немає в наявності" } : null;
  const cartStore = useCartStore();
  // Floors are counted in packs: their add-ons (skirting) go on separate lines with their own piece count,
  // otherwise every pack would carry the whole skirting price again.
  const separate = Boolean(pack) && addons.length > 0;
  const item = configuredItem(variation, productName, separate ? [] : addons, size, pack?.area);
  const qty = pack?.qty ?? 1;
  const extraLines: (Omit<CartItemType, "qty"> & { qty: number })[] = separate ? addons.map((addon) => ({
    id: `${variation.slug}:addon:${addon.id}`,
    variationSlug: variation.slug,
    productSlug,
    addonId: addon.id,
    name: addon.name,
    basePrice: addon.price,
    price: addon.price,
    mods: [`До: ${productName}`],
    image: variation.image,
    qty: addon.qty ?? 1,
  })) : [];
  const total = Math.round((item.price * qty + extraLines.reduce((sum, line) => sum + line.price * line.qty, 0)) * 100) / 100;

  // The product itself: the chosen options only, without the add-ons (they are separate receipt lines).
  // A floor's decor is only its covering type ("Ламінат"), never a choice.
  const main = configuredItem(pack ? { ...variation, decor: null } : variation, productName, [], size);
  const basePrice = item.basePrice ?? item.price;
  const details = [...main.mods];
  if (pack) {
    details.push(pack.area
      ? `${qty} уп. × ${money(basePrice)} · ${(+(qty * pack.area).toFixed(3)).toLocaleString("uk-UA")} м²`
      : `${qty} шт × ${money(basePrice)}`);
  }

  // Editing only while the line is still in this browser's cart (the cart is unknown on the server).
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [editKey, setEditKey] = useState(editLine);
  const edited = hydrated && editKey ? cartStore.items.find((line) => !line.addonId && lineKey(line.id) === editKey) : undefined;

  const handleUpdate = () => {
    if (!edited) return;
    // Floors choose the quantity here; doors keep the one set in the cart.
    const next: CartItemType = { ...item, productSlug, qty: pack ? qty : edited.qty };
    cartStore.replaceItem(edited.id, [next, ...extraLines]);
    setEditKey(lineKey(next.id));
    const items = useCartStore.getState().items;
    const href = cartItemHref(items.find((line) => line.id === next.id) ?? next, items);
    // Reloading the page keeps the saved configuration.
    if (href) window.history.replaceState(null, "", href);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);

    cartStore.addItem({ ...item, productSlug }, qty);
    for (const { qty: pieces, ...line } of extraLines) cartStore.addItem(line, pieces);
    trackAddToCart({ item_id: variation.slug, item_name: productName, item_variant: [variation.decor_color?.name, variation.decor_glass?.name].filter(Boolean).join(", ") || undefined,
      price: item.price, quantity: qty });
  };

  return (
    <div className="bg-[#f7f7f7] border border-[#e0e0e0]  flex flex-col gap-[16px] p-[20px] w-full">
      {/* Stock status */}
      {stock && <div className="flex items-center gap-[8px]">
        <span className={`w-[8px] h-[8px] ${stock.inStock ? "bg-[#43a047]" : "bg-[#f57c00]"}`} />
        <span className={`font-['Outfit',sans-serif] font-semibold text-fs14 ${stock.inStock ? "text-[#43a047]" : "text-[#e65100]"}`}>
          {stock.label}
        </span>
      </div>}

      {/* Receipt: the product, then every add-on */}
      <div className="flex flex-col">
        <ReceiptLine title={productName} details={details} price={Math.round(basePrice * qty * 100) / 100} />
        {addons.map((addon) => <ReceiptLine key={addon.id} title={addon.name} details={[addonDetail(addon)]} price={addonLineTotal(addon)} />)}
      </div>

      {/* Total row */}
      <div className="flex items-center justify-between">
        <span className="font-['Outfit',sans-serif] font-semibold text-[#1a1a1a] text-[clamp(18px,1rem+0.4vw,24px)]">
          Разом:
        </span>
        <span className="font-['Outfit',sans-serif] font-bold text-[#e53935] whitespace-nowrap text-[clamp(28px,1.2rem+1vw,38px)]">
          {money(total)}
        </span>
      </div>

      {/* Add to cart button */}
      <button
        onClick={edited ? handleUpdate : handleAdd}
        disabled={!inStock}
        className={`w-full py-[14px] font-['Outfit',sans-serif] font-bold text-white transition-colors ${
          added
            ? "bg-[#43a047]"
            : "bg-[#e53935] hover:bg-[#c62828] active:bg-[#b71c1c] disabled:bg-[#bdbdbd] disabled:cursor-not-allowed"
        }`}
      >
        {edited ? (added ? "Кошик оновлено ✓" : "Оновити в кошику") : added ? "Додано в кошик ✓" : "Додати в кошик"}
      </button>
      {edited && (
        <button type="button" onClick={handleAdd} disabled={!inStock}
          className="w-full border border-[#1a1a1a] bg-white py-[12px] font-['Outfit',sans-serif] text-fs14 font-semibold text-[#1a1a1a] transition-colors hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-50">
          Додати окремо
        </button>
      )}
    </div>
  );
}