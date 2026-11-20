"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { Suggestion } from "@/lib/services/search.service";
import { trackEvent } from "@/lib/analytics";

const EMPTY: Suggestion = { categories: [], products: [], total: 0 };
const price = (value: number, unit?: string) => `${Math.round(value).toLocaleString("uk-UA")} ₴${unit ? ` /${unit}` : ""}`;

/**
 * Search field with live suggestions (categories + first products). Enter or "Усі результати" opens /search.
 * Keyboard: ↑/↓ moves through suggestions, Enter opens the highlighted one, Esc closes.
 */
export default function SearchBox({ initialQuery = "", variant = "header", autoFocus = false, onNavigate }: {
  initialQuery?: string;
  variant?: "header" | "page";
  autoFocus?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState(initialQuery);
  // The answer remembers its query: a stale answer is never shown, "loading" is simply "no answer for this query yet".
  const [answer, setAnswer] = useState<{ q: string; data: Suggestion }>({ q: "", data: EMPTY });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  const result = trimmed.length >= 2 && answer.q === trimmed ? answer.data : EMPTY;
  const loading = trimmed.length >= 2 && answer.q !== trimmed;
  const links = [...result.categories.map(c => c.href), ...result.products.map(p => p.href)];

  useEffect(() => {
    if (trimmed.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then(response => response.json())
        .then((data: Suggestion) => { setAnswer({ q: trimmed, data }); setActive(-1); })
        .catch(() => { if (!controller.signal.aborted) setAnswer({ q: trimmed, data: EMPTY }); });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [trimmed]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => { if (!box.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (href: string) => { setOpen(false); onNavigate?.(); router.push(href); };
  const submit = () => {
    if (trimmed.length < 2) return;
    trackEvent("search", { search_term: trimmed });
    go(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const showList = open && trimmed.length >= 2;
  const page = variant === "page";
  return (
    <div ref={box} className="relative w-full">
      <form role="search" onSubmit={(event) => { event.preventDefault(); if (active >= 0 && links[active]) go(links[active]); else submit(); }}
        className={`flex w-full items-center border bg-white transition-colors focus-within:border-[#e53935] ${page ? "h-12 border-[#d0d0d0]" : "h-11 border-[#e0e0e0]"}`}>
        <svg className="ml-3 shrink-0 text-[#9e9e9e]" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" /><path d="m14 14 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="search" value={query} autoFocus={autoFocus} placeholder="Пошук: ламінат Egger, двері Korfad, ручка…"
          aria-label="Пошук по каталогу" role="combobox" aria-expanded={showList} aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActive(i => Math.min(i + 1, links.length - 1)); }
            else if (event.key === "ArrowUp") { event.preventDefault(); setActive(i => Math.max(i - 1, -1)); }
            else if (event.key === "Escape") { setOpen(false); setActive(-1); if (!trimmed) onNavigate?.(); }
          }}
          className="h-full min-w-0 flex-1 bg-transparent px-3 font-['Inter',sans-serif] text-[15px] text-[#1a1a1a] outline-none placeholder:text-[#9e9e9e] [&::-webkit-search-cancel-button]:hidden"
        />
        {query && <button type="button" aria-label="Очистити пошук" onClick={() => setQuery("")}
          className="flex size-11 shrink-0 items-center justify-center text-[#9e9e9e] hover:text-[#1a1a1a]">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>}
        <button type="submit" className="h-full shrink-0 bg-[#e53935] px-4 font-['Inter',sans-serif] text-sm font-bold text-white transition-colors hover:bg-[#c62828] sm:px-5">
          Знайти
        </button>
      </form>

      {showList && (
        <div id={listId} role="listbox" aria-label="Підказки пошуку"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[70vh] overflow-y-auto border border-[#e0e0e0] bg-white shadow-[0_12px_32px_#0000001a]">
          {loading && !result.total && !result.categories.length && <p className="px-4 py-3 text-sm text-[#9e9e9e]">Шукаємо…</p>}
          {!loading && !result.total && !result.categories.length && (
            <p className="px-4 py-3 text-sm text-[#666]">Нічого не знайдено за «{trimmed}». Спробуйте назву, бренд або колір.</p>
          )}
          {result.categories.length > 0 && (
            <div className="border-b border-[#f0f0f0] py-2">
              <p className="px-4 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9e9e9e]">Категорії</p>
              {result.categories.map((category, index) => (
                <Link key={category.href} id={`${listId}-${index}`} role="option" aria-selected={active === index} href={category.href}
                  onClick={(event) => { event.preventDefault(); go(category.href); }}
                  className={`flex items-center justify-between px-4 py-2 text-sm font-semibold ${active === index ? "bg-[#fff4f3] text-[#e53935]" : "text-[#1a1a1a] hover:bg-[#f7f7f7]"}`}>
                  {category.name}<span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          )}
          {result.products.map((product, i) => {
            const index = result.categories.length + i;
            return (
              <Link key={product.href} id={`${listId}-${index}`} role="option" aria-selected={active === index} href={product.href}
                onClick={(event) => { event.preventDefault(); go(product.href); }}
                className={`flex items-center gap-3 px-4 py-2 ${active === index ? "bg-[#fff4f3]" : "hover:bg-[#f7f7f7]"}`}>
                <span className="relative size-12 shrink-0 overflow-hidden border border-[#f0f0f0] bg-[#f7f7f7]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- CMS thumbnails, already sized */}
                  {product.image && <img src={product.image} alt="" loading="lazy" className="size-full object-contain" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm font-semibold ${active === index ? "text-[#e53935]" : "text-[#1a1a1a]"}`}>{product.name}</span>
                  {product.category && <span className="block truncate text-xs text-[#9e9e9e]">{product.category}</span>}
                </span>
                {product.price > 0 && <span className="shrink-0 text-sm font-bold text-[#1a1a1a]">{price(product.price, product.unit)}</span>}
              </Link>
            );
          })}
          {result.total > 0 && (
            <button type="button" onClick={submit}
              className="flex w-full items-center justify-center gap-2 border-t border-[#f0f0f0] px-4 py-3 text-sm font-semibold text-[#e53935] hover:bg-[#fff4f3]">
              Усі результати ({result.total}) →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
