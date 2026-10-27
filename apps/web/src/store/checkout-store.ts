import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DeliveryCity, DeliveryWarehouse } from "@/lib/services/nova-poshta.service";

export type DeliveryMethod = "pickup" | "nova" | "courier" | "address";
type Delivery = {
  method: DeliveryMethod;
  city: DeliveryCity | null;
  warehouse: DeliveryWarehouse | null;
};

export const useCheckoutStore = create<{
  delivery: Delivery | null;
  setDelivery: (delivery: Delivery) => void;
}>()(
  persist(
    (set) => ({ delivery: null, setDelivery: (delivery) => set({ delivery }) }),
    { name: "checkout-delivery", storage: createJSONStorage(() => sessionStorage) },
  ),
);
