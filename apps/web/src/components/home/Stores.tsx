import Image from "next/image";
import HomeIcon from "./HomeIcon";
import SectionHeader from "./SectionHeader";

import { SHOP_LOCATIONS, shopDirectionsUrl, type ShopLocation } from "@/lib/catalog/shop-locations";

export default function Stores({ shops = SHOP_LOCATIONS }: { shops?: ShopLocation[] }) {
  return (
    <section id="contacts" aria-labelledby="stores-title" className="scroll-mt-6 bg-[#f5f5f5]">
      <div className="content-container page-gutter flex flex-col gap-5 !py-8 md:gap-10 md:!py-16 lg:!py-20">
      <SectionHeader id="stores-title" eyebrow="Де нас знайти" title="Наші магазини у Черкасах" description="Завітайте у наші виставкові зали для огляду зразків наживо" />
      <div className="grid gap-6 lg:grid-cols-2">
        {shops.map((store, index) => <article data-home-reveal="" key={`${store.lat}:${store.lng}`} className="flex min-w-0 flex-col overflow-hidden sm:flex-row border border-[#e0e0e0] bg-[#f5f5f5] lg:flex-col xl:flex-row">
          <div className="relative min-h-[220px] w-full shrink-0 sm:w-[32%] lg:w-full xl:w-[32%]"><Image src={store.image ?? `/images/home/${index % 2 ? "store-southwest" : "store-center"}.png`} unoptimized={store.image?.startsWith("http")} alt={`Виставковий зал: ${store.name}`} fill sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 48vw, 32vw" className="object-cover" /></div>
          <div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
            <h3 className="text-lg font-bold leading-snug">{store.name}</h3>
            <address className="flex flex-col gap-3 text-sm not-italic">
              <p className="flex items-start gap-2"><HomeIcon name="map-pin" size={16} /><span>{store.address ?? "Черкаси — точне розташування на карті"}</span></p>
              {store.phone && <a href={`tel:${store.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2 font-semibold hover:text-[#e53935]"><HomeIcon name="phone" size={16} />{store.phone}</a>}
              {store.hours && <p className="flex items-start gap-2 text-[#666]"><HomeIcon name="clock" size={16} /><span>{store.hours}</span></p>}
            </address>
            <div className="mt-auto flex flex-wrap gap-3 pt-2 text-xs font-bold">
              <a href={shopDirectionsUrl(store)} target="_blank" rel="noopener noreferrer" aria-label={`Маршрут на карті: ${store.name} (нова вкладка)`} className="flex min-h-11 items-center border border-[#e0e0e0] bg-white px-4 py-2 transition-colors hover:border-[#e53935]">Маршрут на карті</a>
              {store.phone && <a href={`tel:${store.phone.replace(/[^+\d]/g, "")}`} className="flex min-h-11 items-center bg-[#e53935] px-4 py-2 text-white transition-colors hover:bg-[#c62828]">Зателефонувати</a>}
            </div>
          </div>
        </article>)}
      </div>
      </div>
    </section>
  );
}
