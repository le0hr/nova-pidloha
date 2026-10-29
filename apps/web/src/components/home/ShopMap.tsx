"use client";

import { useState } from "react";
import GoogleShopMap from "./GoogleShopMap";
import { SHOP_LOCATIONS, shopDirectionsUrl, shopMapEmbedUrl, shopsMapEmbedUrl, type ShopLocation } from "@/lib/catalog/shop-locations";

export default function ShopMap({ interactive, shops = SHOP_LOCATIONS, onClose }: { interactive: boolean; shops?: ShopLocation[]; onClose: () => void }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [selected, setSelected] = useState("all");
  const locations = shops.length ? shops : SHOP_LOCATIONS;
  const shop = selected === "all" ? undefined : locations[Number(selected)];

  return (
    <div className="absolute inset-0 z-0 bg-[#dfe3dc]" inert={!interactive}>
      {apiKey ? <GoogleShopMap apiKey={apiKey} locations={locations} shop={shop} interactive={interactive} onSelect={setSelected} /> : <iframe title={`Google Maps — ${shop?.name ?? "Усі магазини"}`} src={shop ? shopMapEmbedUrl(shop) : shopsMapEmbedUrl(locations)}
        className={`absolute inset-0 h-full w-full border-0 ${interactive ? "" : "pointer-events-none"}`}
        tabIndex={interactive ? 0 : -1} allowFullScreen referrerPolicy="no-referrer-when-downgrade" />}
      {interactive && <div className="absolute inset-x-4 top-4 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 text-[#333] md:flex md:items-center">
        <button type="button" onClick={onClose} className="flex min-h-11 shrink-0 items-center justify-center rounded-none bg-[#35332e] px-3 text-sm font-bold text-white shadow md:px-4">Закрити мапу ×</button>
        <label className="min-w-0 shadow-lg md:ml-auto md:w-80">
          <span className="sr-only">Оберіть магазин</span>
          <select value={shop ? selected : "all"} onChange={(event) => setSelected(event.target.value)}
            className="min-h-11 w-full min-w-0 rounded-none border border-[#ddd] bg-white px-3 text-sm font-semibold">
            <option value="all">Усі магазини</option>
            {locations.map((location, index) => <option key={`${location.lat}:${location.lng}:${index}`} value={index}>{location.address ?? location.name}</option>)}
          </select>
        </label>
        {shop && <a href={shopDirectionsUrl(shop)} target="_blank" rel="noopener noreferrer"
          aria-label={`Прокласти маршрут: ${shop.name} (нова вкладка)`}
          className="col-start-2 flex min-h-11 shrink-0 items-center justify-center justify-self-end rounded-none bg-[#e53935] px-4 text-sm font-bold text-white shadow-lg hover:bg-[#c62828]">Маршрут ↗</a>}
      </div>}
    </div>
  );
}
