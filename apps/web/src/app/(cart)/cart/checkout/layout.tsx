import Link from "next/link";
import { checkoutEnabled, getSiteContacts, telHref } from "@/lib/site-contacts";

/** While online checkout is off (CHECKOUT_ENABLED), every checkout page shows "скоро" with the shop contacts. */
export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  if (checkoutEnabled()) return children;
  const { phone } = await getSiteContacts();
  return (
    <section className="checkout-container flex flex-col items-start gap-4 py-12 lg:py-20">
      <h1 className="font-['Outfit',sans-serif] text-[28px] font-bold text-[#1a1a1a] lg:text-[32px]">Онлайн-оформлення — скоро</h1>
      <p className="max-w-[560px] text-[15px] leading-relaxed text-[#555]">
        Ми ще підключаємо оплату й оформлення замовлень на сайті. Поки що замовити можна за телефоном або
        у виставкових залах у Черкасах — товари з кошика збережуться, просто назвіть їх менеджеру.
      </p>
      <div className="flex flex-wrap gap-3">
        {phone && (
          <a href={telHref(phone)} className="flex h-[48px] items-center bg-[#e53935] px-6 font-bold text-white transition-colors hover:bg-[#c62828]">
            Зателефонувати {phone}
          </a>
        )}
        <Link href="/cart" className="flex h-[48px] items-center border border-[#1a1a1a] px-6 font-semibold text-[#1a1a1a] hover:bg-[#f7f7f7]">
          Повернутися до кошика
        </Link>
        <Link href="/#contacts" className="flex h-[48px] items-center px-2 font-semibold text-[#1a1a1a] underline">
          Адреси магазинів
        </Link>
      </div>
    </section>
  );
}
