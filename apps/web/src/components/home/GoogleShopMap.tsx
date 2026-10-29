"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { ShopLocation } from "@/lib/catalog/shop-locations";

export default function GoogleShopMap({ apiKey, locations, shop, interactive, onSelect }: {
  apiKey: string;
  locations: ShopLocation[];
  shop?: ShopLocation;
  interactive: boolean;
  onSelect: (index: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!map) return;
    map.setOptions({
      gestureHandling: interactive ? "cooperative" : "none",
      keyboardShortcuts: interactive,
    });
  }, [map, interactive]);

  useEffect(() => {
    if (!map) return;
    const markers = locations.map((location, index) => {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map, position: { lat: location.lat, lng: location.lng },
        title: location.address ?? location.name,
      });
      const listener = marker.addListener("click", () => onSelect(String(index)));
      return { marker, listener };
    });
    return () => markers.forEach(({ marker, listener }) => {
      listener.remove();
      marker.map = null;
    });
  }, [map, locations, onSelect]);

  useEffect(() => {
    if (!map || !container.current) return;
    const frameLocations = () => {
      const target = shop ?? (locations.length === 1 ? locations[0] : undefined);
      if (target) {
        map.setCenter({ lat: target.lat, lng: target.lng });
        map.setZoom(16);
      } else {
        const bounds = new google.maps.LatLngBounds();
        locations.forEach((location) => bounds.extend({ lat: location.lat, lng: location.lng }));
        map.fitBounds(bounds, { top: 130, right: 50, bottom: 40, left: 50 });
      }
    };
    frameLocations();
    const observer = new ResizeObserver(frameLocations);
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [map, locations, shop]);

  return <>
    <Script id="google-shop-maps" strategy="afterInteractive"
      src={`https://maps.googleapis.com/maps/api/js?${new URLSearchParams({ key: apiKey, v: "weekly", libraries: "marker", language: "uk", region: "UA" })}`}
      onReady={() => {
        if (!container.current || map) return;
        setMap(new google.maps.Map(container.current, {
          center: { lat: locations[0].lat, lng: locations[0].lng }, zoom: 13,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID",
          disableDefaultUI: true, clickableIcons: false,
          gestureHandling: interactive ? "cooperative" : "none", keyboardShortcuts: interactive,
        }));
      }}
      onError={() => setFailed(true)} />
    <div ref={container} aria-label="Мапа магазинів" className={`absolute inset-0 ${interactive ? "" : "pointer-events-none"}`} />
    {failed && <p role="status" className="absolute inset-x-4 bottom-8 bg-white p-3 text-center text-sm text-[#333]">Не вдалося завантажити карту. Оберіть адресу та натисніть «Маршрут».</p>}
  </>;
}
