"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Card from "./Card";
import type { CatalogProduct } from "@/types/catalog";

type Page = { page: number; pageSize: number; pageCount: number; total: number };

/** 1 товар, 2 товари, 5 товарів, 21 товар. */
function products(count: number): string {
  const mod10 = count % 10, mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} товар`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} товари`;
  return `${count} товарів`;
}

/** Product grid with "Показати ще": appends the next page and keeps the URL page in sync with pagination. */
export default function CatalogGrid({ category, products: initial, pagination }: {
  category: string;
  products: CatalogProduct[];
  pagination: Page;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [items, setItems] = useState(initial);
  const [page, setPage] = useState(pagination.page);
  const [batchStart, setBatchStart] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [announcement, setAnnouncement] = useState("");

  const shownUntil = Math.min(pagination.total, page * pagination.pageSize);
  const remaining = Math.max(0, pagination.total - shownUntil);

  const loadMore = async () => {
    if (status === "loading" || page >= pagination.pageCount) return;
    setStatus("loading");
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page + 1));
    try {
      const response = await fetch(`/api/catalog/${encodeURIComponent(category)}?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as { products: CatalogProduct[]; pagination: Page };
      const known = new Set(items.map(product => product.slug));
      const fresh = data.products.filter(product => !known.has(product.slug));
      setBatchStart(items.length);
      setItems(current => [...current, ...fresh]);
      setPage(data.pagination.page);
      setStatus("idle");
      setAnnouncement(`Завантажено ще ${products(fresh.length)}`);
      // Pagination reads ?page=, so it shows the last loaded page and "Вперед" continues from it.
      window.history.replaceState(null, "", `${pathname}?${params}`);
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <div className="catalog-grid grid grid-cols-2 gap-4 w-full">
        {items.map((product, i) => (
          // New cards animate as their own batch instead of waiting for the whole list's stagger.
          <Card key={product.slug ?? i} product={product} index={i >= batchStart ? i - batchStart : i} />
        ))}
      </div>
      {remaining > 0 && (
        <div className="flex w-full flex-col items-center gap-2">
          <button type="button" onClick={loadMore} disabled={status === "loading"} aria-busy={status === "loading"}
            className="flex min-h-11 w-full items-center justify-center gap-2 border border-[#E53935] px-6 py-3 font-['Outfit'] text-sm font-semibold text-[#E53935] transition-colors hover:bg-[#ffebee] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E53935] disabled:cursor-wait disabled:opacity-60 sm:w-auto">
            {status === "loading" ? "Завантаження…" : `Показати ще ${products(Math.min(remaining, pagination.pageSize))}`}
          </button>
          {status === "error" && <p role="alert" className="text-sm text-[#E53935]">Не вдалося завантажити товари. Спробуйте ще раз.</p>}
        </div>
      )}
      <p className="sr-only" aria-live="polite">{announcement}</p>
    </>
  );
}
