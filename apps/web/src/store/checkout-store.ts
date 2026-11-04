import type { ShopLocation } from "@/lib/catalog/shop-locations";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DeliveryCity, DeliveryWarehouse } from "@/lib/services/nova-poshta.service";

export type DeliveryMethod = "pickup" | "nova" | "courier" | "address";
export type PaymentMethod = "cod" | "card" | "invoice";
export type CheckoutContacts = {
  lastName: string; firstName: string; phone: string; email: string;
  isCompany: boolean; companyName: string; edrpou: string;
};
export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: "Накладений платіж (при отриманні)",
  card: "Оплата карткою онлайн",
  invoice: "Безготівковий розрахунок (для юр. осіб)",
};
export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  pickup: "Самовивіз з магазину", nova: "Нова Пошта (відділення або поштомат)",
  courier: "Кур’єрська доставка по місту", address: "Адресна доставка по Україні",
};

type Delivery = {
  address?: string;
  method: DeliveryMethod;
  pickupShop: ShopLocation | null;
  city: DeliveryCity | null;
  warehouse: DeliveryWarehouse | null;
};

export const useCheckoutStore = create<{
  contacts: CheckoutContacts | null;
  payment: PaymentMethod | null;
  comment: string;
  editing: boolean;
  setContacts: (contacts: CheckoutContacts) => void;
  setPayment: (payment: PaymentMethod) => void;
  setComment: (comment: string) => void;
  setEditing: (editing: boolean) => void;
  delivery: Delivery | null;
  setDelivery: (delivery: Delivery) => void;
}>()(
  persist(
    (set) => ({
      contacts: null, payment: null, comment: "", editing: false, delivery: null,
      setContacts: (contacts) => set({ contacts }),
      setPayment: (payment) => set({ payment }),
      setComment: (comment) => set({ comment }),
      setEditing: (editing) => set({ editing }),
      setDelivery: (delivery) => set({ delivery }),
    }),
    { name: "checkout-delivery", storage: createJSONStorage(() => sessionStorage) },
  ),
);
