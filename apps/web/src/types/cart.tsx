import type { ProductAddon } from "./product";

type CartItemType = {
  id: string;
  variationSlug?: string;
  basePrice?: number;
  addons?: ProductAddon[];
  /** Chosen door size; for a non-standard one the price already includes the surcharge. */
  size?: { width: number; height: number; custom?: boolean; percent?: number };
  name: string;
  mods: string[];
  price: number;
  image: string;
  qty: number
}

export default CartItemType;
