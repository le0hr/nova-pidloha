"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

import { SHOP_LOCATIONS } from "@/lib/catalog/shop-locations";

export default function ShopMap({ interactive }: { interactive: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const interactiveRef = useRef(interactive);
  useEffect(() => { interactiveRef.current = interactive; }, [interactive]);

  useEffect(() => {
    let disposed = false;
    let resize: ResizeObserver | undefined;
    import("leaflet").then((L) => {
      if (disposed || !container.current) return;
      const map = L.map(container.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: false });
      mapRef.current = map;
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);
      SHOP_LOCATIONS.forEach((shop, index) => {
        const link = document.createElement("a");
        link.textContent = `${shop.name} — прокласти маршрут`;
        link.href = `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        L.marker([shop.lat, shop.lng], {
          title: shop.name, alt: shop.name,
          icon: L.divIcon({
            className: "",
            html: `<span style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#e53935;box-shadow:0 3px 12px #0005;color:white;font:bold 16px sans-serif"><span style="transform:rotate(45deg)">${index + 1}</span></span>`,
            iconSize: [38, 38], iconAnchor: [19, 38],
          }),
        }).addTo(map).bindPopup(link);
      });
      const fit = () => {
        map.invalidateSize();
        const width = container.current?.clientWidth ?? 0;
        const desktop = width >= 768;
        map.fitBounds(SHOP_LOCATIONS.map((shop) => [shop.lat, shop.lng] as [number, number]), {
          paddingTopLeft: !interactiveRef.current && desktop ? [width * 0.53, 70] : [45, 60],
          paddingBottomRight: [55, 70], maxZoom: 14, animate: false,
        });
      };
      fit();
      resize = new ResizeObserver(fit);
      resize.observe(container.current);
    });
    return () => { disposed = true; resize?.disconnect(); mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !container.current) return;
    const width = container.current.clientWidth;
    map.fitBounds(SHOP_LOCATIONS.map((shop) => [shop.lat, shop.lng] as [number, number]), {
      paddingTopLeft: !interactive && width >= 768 ? [width * 0.53, 70] : [45, 60],
      paddingBottomRight: [55, 70], maxZoom: 14, animate: false,
    });
  }, [interactive]);

  return <div ref={container} role="region" aria-label="Мапа двох магазинів у Черкасах"
    inert={!interactive} className={`absolute inset-0 z-0 bg-[#dfe3dc] ${interactive ? "" : "[&_.leaflet-control-container]:hidden"}`} />;
}
