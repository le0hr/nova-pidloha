import type { ProductAddon } from "./product";

type CartItemType = {
  id: string;
  variationSlug?: string;
  basePrice?: number;
  addons?: ProductAddon[];
  /** Non-standard door size; the price already includes the size surcharge. */
  size?: { width: number; height: number };
  name: string;
  mods: string[];
  price: number;
  image: string;
  qty: number
}

export default CartItemType;
