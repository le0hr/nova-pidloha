import type { ProductAddon } from "./product";

type CartItemType = {
  id: string;
  variationSlug?: string;
  basePrice?: number;
  addons?: ProductAddon[];
  name: string;
  mods: string[];
  price: number;
  image: string;
  qty: number
}

export default CartItemType;
