'use client'

import { useRouter } from 'next/navigation'
import CartDrawer from './Drawer'

export default function CartDrawerWrapper() {
  const router = useRouter()

  return (
    <CartDrawer
      onGoToCart={() => router.push('/cart')}
      onCheckout={() => router.push('/cart/checkout/contacts')}
    />
  )
}
