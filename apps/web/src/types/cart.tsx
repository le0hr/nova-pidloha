import type { ProductAddon } from "./product";

type CartItemType = {
  id: string;
  variationSlug?: string;
  /** Product page address; missing in carts saved before it was added. */
  productSlug?: string;
  /** A floor add-on (skirting) bought on its own line: `qty` is pieces, priced per piece. */
  addonId?: string;
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
