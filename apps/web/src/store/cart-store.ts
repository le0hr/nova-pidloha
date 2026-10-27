import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type CartItemType from '@/types/cart'

type CartState = {
  items: CartItemType[]
  isOpen: boolean

  addItem: (item: Omit<CartItemType, 'qty'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void

  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  totalPrice: () => number
  totalItems: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id)

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, ...item, qty: i.qty + 1 } : i
            ),
          })
        } else {
          set({
            items: [...get().items, { ...item, qty: 1 }],
          })
        }

        set({ isOpen: true })
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((i) => i.id !== id),
        })
      },

      updateQty: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id)
          return
        }

        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, qty } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      totalPrice: () =>
        get().items.reduce((sum, item) => sum + item.price * item.qty, 0),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.qty, 0),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)