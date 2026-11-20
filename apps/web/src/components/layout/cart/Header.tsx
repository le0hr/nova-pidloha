import Image from "next/image";
import Link from "next/link";
import { telHref, type SiteContacts } from "@/lib/site-contacts";

/** Cart/checkout header: phone and the first showroom from CMS Global (nothing shown when not filled in). */
export default function Header({ contacts }: { contacts?: SiteContacts }) {
  const shop = contacts?.shops.find(item => item.address);
  return (
    <header className="w-full shrink-0 border-b border-[#e0e0e0] bg-white">
      <div className="checkout-container flex min-h-[74px] items-center justify-between gap-3 py-3 md:min-h-[84px]">
        <Link href="/" aria-label="Нова Підлога та Двері — головна" className="flex shrink-0 items-center gap-2">
          <Image src="/nova-pidloha.png" width={42} height={42} alt="" className="size-8 -scale-y-100 rotate-180 object-cover md:size-[42px]" />
          <div>
            <p className="text-sm font-bold leading-tight text-[#1a1a1a] md:text-lg">НОВА ПІДЛОГА</p>
            <p className="text-[10px] font-semibold uppercase leading-tight text-[#e53935] md:text-[11px]">ТА ДВЕРІ</p>
          </div>
        </Link>
        <div className="flex items-center gap-8">
          {contacts?.phone && (
            <a href={telHref(contacts.phone)} className="flex flex-col items-end gap-0.5 md:items-start">
              <span className="text-xs font-bold leading-tight text-[#1a1a1a] md:text-sm">{contacts.phone}</span>
              <span className="text-right text-[10px] leading-tight text-[#666]">За тарифами оператора</span>
            </a>
          )}
          {shop && (
            <div className="hidden max-w-[260px] flex-col gap-0.5 text-sm leading-tight text-[#1a1a1a] md:flex">
              <span>{shop.address}</span>
              {shop.hours && <span className="text-xs text-[#666]">{shop.hours}</span>}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
