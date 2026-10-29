"use client";

import { useState } from "react";
import { SHOP_LOCATIONS, shopDirectionsUrl, shopMapEmbedUrl, type ShopLocation } from "@/lib/catalog/shop-locations";

export default function ShopMap({ interactive, shops = SHOP_LOCATIONS }: { interactive: boolean; shops?: ShopLocation[] }) {
  const [selected, setSelected] = useState(0);
  const locations = shops.length ? shops : SHOP_LOCATIONS;
  const shop = locations[selected] ?? locations[0];

  return (
    <div className="absolute inset-0 z-0 bg-[#dfe3dc]" inert={!interactive}>
      <iframe title={`Google Maps — ${shop.name}`} src={shopMapEmbedUrl(shop)}
        className={`absolute inset-x-0 bottom-0 w-full border-0 ${interactive ? "top-36 h-[calc(100%-9rem)] md:top-20 md:h-[calc(100%-5rem)]" : "top-0 h-full pointer-events-none"}`}
        tabIndex={interactive ? 0 : -1} allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
      {interactive && <div className="absolute inset-x-0 top-16 flex items-center gap-2 bg-white px-4 py-2 text-[#333] md:top-0 md:min-h-20 md:pl-52">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold">
          <span className="sr-only">Оберіть магазин</span>
          <select value={Math.min(selected, locations.length - 1)} onChange={(event) => setSelected(Number(event.target.value))}
            className="min-h-11 w-full min-w-0 border border-[#ddd] bg-white px-3 md:max-w-sm">
            {locations.map((location, index) => <option key={`${location.lat}:${location.lng}:${index}`} value={index}>{location.name}</option>)}
          </select>
        </label>
        <a href={shopDirectionsUrl(shop)} target="_blank" rel="noopener noreferrer"
          aria-label={`Прокласти маршрут: ${shop.name} (нова вкладка)`}
          className="flex min-h-11 items-center bg-[#e53935] px-4 text-sm font-bold text-white hover:bg-[#c62828]">Маршрут ↗</a>
      </div>}
    </div>
  );
}
