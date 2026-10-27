"use client";

import { useEffect, useRef, useState } from "react";
import type { DeliveryCity } from "@/lib/services/nova-poshta.service";

type Props = {
  value: string;
  cities: DeliveryCity[];
  loading: boolean;
  error: string;
  selected: boolean;
  onChange: (value: string) => void;
  onSelect: (city: DeliveryCity) => void;
};

export default function CityAutocomplete({ value, cities, loading, error, selected, onChange, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const visible = open && !selected && value.trim().length >= 2;
  const options = loading || error ? [] : cities;
  const active = visible ? options[activeIndex] : undefined;
  const status = loading ? "Шукаємо міста…" : error ? error : !options.length ? "Міст не знайдено. Спробуйте іншу назву." : `${options.length} міст у списку`;

  useEffect(() => {
    if (active) listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [active, activeIndex]);

  function select(city: DeliveryCity) {
    onSelect(city);
    setOpen(false);
    setActiveIndex(-1);
  }

  return (
    <div className="relative">
      <label htmlFor="delivery-city" className="mb-1.5 block text-[13px] text-[#444]">Місто доставки</label>
      <div className="relative">
        <input
          id="delivery-city"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={visible}
          aria-controls={visible ? "delivery-cities" : undefined}
          aria-activedescendant={active ? `delivery-city-${active.ref}` : undefined}
          aria-describedby="delivery-city-status"
          aria-invalid={Boolean(error)}
          autoComplete="off"
          placeholder="Введіть щонайменше 2 літери"
          value={value}
          onFocus={() => setOpen(true)}
          onBlur={() => { setOpen(false); setActiveIndex(-1); }}
          onChange={(event) => { setOpen(true); setActiveIndex(-1); onChange(event.target.value); }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              if (options.length) setActiveIndex((index) => event.key === "ArrowDown"
                ? (!visible || index < 0 ? 0 : (index + 1) % options.length)
                : (!visible || index < 0 ? options.length - 1 : (index - 1 + options.length) % options.length));
            } else if (event.key === "Enter" && visible) {
              event.preventDefault();
              if (active) select(active);
            } else if (event.key === "Escape") {
              setOpen(false);
              setActiveIndex(-1);
            }
          }}
          className="w-full border border-[#d0d0d0] bg-white px-3 py-2.5 pr-10 text-[15px] text-[#222] outline-none transition-colors placeholder:text-[#999] hover:border-[#999] focus:border-[#e53935] focus:ring-1 focus:ring-[#e53935]"
        />
        <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777]">
          {loading ? <span className="block h-4 w-4 rounded-full border-2 border-[#e0e0e0] border-t-[#e53935] motion-safe:animate-spin" /> :
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>}
        </span>
      </div>
      {visible && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 border border-[#e0e0e0] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
          <ul id="delivery-cities" ref={listRef} role="listbox" aria-label="Міста доставки" aria-busy={loading} className="max-h-64 overflow-y-auto overscroll-contain py-1">
            {options.map((city, index) => (
              <li
                key={city.ref}
                id={`delivery-city-${city.ref}`}
                role="option"
                aria-selected={activeIndex === index}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(city)}
                className={`cursor-pointer border-l-2 px-3 py-2.5 transition-colors ${activeIndex === index ? "border-[#e53935] bg-[#fff3f2]" : "border-transparent bg-white hover:bg-[#f5f5f5]"}`}
              >
                <span className="block text-[15px] font-medium text-[#222]">{city.name}</span>
                {city.area && <span className="mt-0.5 block text-[13px] text-[#777]">{city.area}</span>}
              </li>
            ))}
          </ul>
          {!options.length && <p className={`px-3 pb-3 pt-2 text-[13px] ${error ? "text-[#c62828]" : "text-[#777]"}`}>{status}</p>}
        </div>
      )}
      <span id="delivery-city-status" role="status" className="sr-only">{visible ? status : selected ? "Місто обрано" : "Введіть щонайменше 2 літери"}</span>
    </div>
  );
}
