"use client";

import { useCartStore } from "@/store/cart-store";
import EmptyCart from "./EmptyCart";
import FilledCart from "./FilledCart";

export default function CartPageClient() {
  const items = useCartStore((s) => s.items);

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return <FilledCart />;
}