
import { useCartStore } from "@/store/cart-store"

export default function CartButton(){
  const isOpen = useCartStore((state) => state.isOpen);
  const openCart = useCartStore((state) => state.openCart);
  const cartCount = useCartStore((state) => state.totalItems);
return(   
    <button type="button" aria-label="Відкрити кошик" aria-expanded={isOpen} aria-controls="cart-drawer" 
        onClick={() => openCart()}
        className={`relative flex size-11 shrink-0 items-center justify-center transition-colors duration-150 hover:text-[#e53935] focus-visible:outline-2 focus-visible:outline-[#e53935] ${isOpen ? "text-[#e53935]" : "text-[#1a1a1a]"}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {cartCount() > 0 && (
            <div className="absolute -top-0.5 -right-0.5 bg-[#e53935] flex items-center px-1.5 py-0.5 rounded-[10px]">
            <span className="font-bold text-white text-[10px]">{cartCount()}</span>
            </div>
        )}
</button>)
}