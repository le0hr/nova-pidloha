'use client'

import { useEffect, useState } from 'react'
import ItemOptions from "@/components/cart/ItemOptions";
import { useCartStore } from '@/store/cart-store'
interface Props {
  onGoToCart: () => void;
  onCheckout: () => void;
}

function QtyControl({
  qty,
  onMinus,
  onPlus,
}: {
  qty: number
  onMinus: () => void
  onPlus: () => void
}) {
  return (
    <div className="flex items-center border border-[#e0e0e0]">
      <button
        onClick={onMinus}
        className="flex items-center justify-center size-[28px] hover:bg-[#f7f7f7] transition-colors duration-150 shrink-0"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6h7"
            stroke="#1A1A1A"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <span className="flex items-center justify-center w-[36px] h-[28px] font-['Inter',sans-serif] font-semibold text-[#1a1a1a] text-[13px] border-x border-[#e0e0e0]">
        {qty}
      </span>
      <button
        onClick={onPlus}
        className="flex items-center justify-center size-[28px] hover:bg-[#f7f7f7] transition-colors duration-150 shrink-0"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 2.5v7M2.5 6h7"
            stroke="#1A1A1A"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  )
}

export default function CartDrawer({ onGoToCart, onCheckout }: Props) {
  const items = useCartStore((s) => s.items)
  const isOpen = useCartStore((s) => s.isOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQty = useCartStore((s) => s.updateQty)
  const totalPrice = useCartStore((s) => s.totalPrice())

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => setMounted(false), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 200)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  if (!mounted) return null

  const isEmpty = items.length === 0
  const totalQty = items.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="cart-drawer fixed inset-0 z-50 flex justify-end" data-state={isOpen ? "open" : "closed"}>
      {/* Backdrop */}
      <div
        className="cart-drawer-backdrop absolute inset-0 bg-black/40"
        onClick={closeCart}
      />

      {/* Panel */}
      <div
        id="cart-drawer" role="dialog" aria-modal="true" aria-label="Кошик"
        className="cart-drawer-panel relative flex w-[min(100vw,440px)] flex-col bg-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] h-[60px] border-b border-[#e0e0e0] shrink-0">
          <span className="font-['Outfit',sans-serif] font-bold text-[#1a1a1a] text-[20px]">
            Кошик
          </span>
          <button
            onClick={closeCart}
            aria-label="Закрити кошик"
            className="flex items-center justify-center size-[36px] hover:bg-[#f7f7f7] transition-colors duration-150"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="#1A1A1A"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Subtitle */}
        {!isEmpty && (
          <div className="px-[24px] pt-[14px] pb-[8px] shrink-0">
            <span className="font-['Inter',sans-serif] font-normal text-[#9e9e9e] text-[13px]">
              {totalQty} {totalQty === 1 ? 'товар' : 'товарів'} у кошику
            </span>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-[16px] h-full px-[24px] py-[48px]">
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                <path
                  d="M14 8L9 14v28a3 3 0 0 0 3 3h28a3 3 0 0 0 3-3V14l-5-6H14zM9 14h34M34 20a8 8 0 0 1-16 0"
                  stroke="#9E9E9E"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-center flex flex-col gap-[8px]">
                <p className="font-['Outfit',sans-serif] font-bold text-[#1a1a1a] text-[18px]">
                  Кошик порожній
                </p>
                <p className="font-['Inter',sans-serif] font-normal text-[#666] text-[13px]">
                  Додайте товари з каталогу
                </p>
              </div>
              <button
                onClick={()=> {
                  closeCart()
                }}
                className="bg-[#e53935] hover:bg-[#c62828] px-[24px] py-[11px] font-['Outfit',sans-serif] font-bold text-white text-[14px] transition-colors duration-200"
              >
                Перейти до каталогу
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-[12px] px-[24px] py-[14px] border-b border-[#e0e0e0]"
                >
                  <div className="shrink-0 size-[64px] bg-[#f7f7f7] border border-[#e0e0e0] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-[8px] flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-[8px]">
                      <p className="font-['Inter',sans-serif] font-semibold text-[#1a1a1a] text-[13px] leading-[1.4] line-clamp-2">
                        {item.name}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 p-[4px] hover:text-[#e53935] text-[#9e9e9e] transition-colors duration-150"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M2 4h12M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>

                    <ItemOptions mods={item.mods} />
                    <div className="flex items-center justify-between gap-[8px]">
                      <span className="font-['Outfit',sans-serif] font-semibold text-[#1a1a1a] text-[13px]">
                        ₴{item.price.toLocaleString()}/шт
                      </span>
                      <QtyControl
                        qty={item.qty}
                        onMinus={() => updateQty(item.id, item.qty - 1)}
                        onPlus={() => updateQty(item.id, item.qty + 1)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="border-t border-[#e0e0e0] px-[24px] py-[16px] flex flex-col gap-[10px] shrink-0 bg-white">
            <div className="flex items-center justify-between">
              <span className="font-['Inter',sans-serif] font-normal text-[#666] text-[14px]">
                Разом:
              </span>
              <span className="font-['Outfit',sans-serif] font-extrabold text-[#e53935] text-[18px]">
                ₴{totalPrice.toLocaleString()}
              </span>
            </div>

            <button 
              onClick={() => {
                closeCart()
                onCheckout()
              }}
            className="w-full h-[48px] bg-[#e53935] hover:bg-[#c62828] font-['Inter',sans-serif] font-bold text-white text-[15px] transition-colors duration-200">
              Оформити замовлення
            </button>

            <button
              onClick={() => {
                closeCart()
                onGoToCart()
              }}
              className="w-full h-[44px] border border-[#1a1a1a] hover:bg-[#f7f7f7] font-['Inter',sans-serif] font-semibold text-[#1a1a1a] text-[14px] transition-colors duration-200"
            >
              Перейти до корзини
            </button>
          </div>
        )}
      </div>
    </div>
  )
}