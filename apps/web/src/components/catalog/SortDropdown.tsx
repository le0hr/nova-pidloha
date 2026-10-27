"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = ["За популярністю", "Від дешевих", "Від дорогих", "Новинки"];

interface Props {
  mobile?: boolean;
}

export default function SortDropdown({ mobile = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const values = ["", "price_asc", "price_desc", "newest"];
  const sort = SORT_OPTIONS[Math.max(0, values.indexOf(searchParams.get("sort") ?? ""))];
  const setSort = (label: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const value = values[SORT_OPTIONS.indexOf(label)];
    if (value) params.set("sort", value);
    else params.delete("sort");
    params.delete("page");
    router.push(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  };
  const [open, setOpen] = useState(false);

  if (mobile) {
    return (
      <div className="relative w-full">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-[6px] border border-[#e0e0e0] px-[12px] py-[8px] w-full justify-between hover:border-[#1a1a1a] transition-colors duration-200"
        >
          <span className="font-['Outfit',sans-serif] font-medium text-[#1a1a1a] text-[13px]">
            {sort}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="M0 0L6 12L12 0" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full mt-[2px] bg-white border border-[#e0e0e0] z-10 animate-fade-up shadow-lg">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o}
                onClick={() => {
                  setSort(o);
                  setOpen(false);
                }}
                className={`w-full px-[12px] py-[8px] text-left font-['Outfit',sans-serif] text-[13px]
                            hover:bg-[#f7f7f7] transition-colors duration-150
                            ${sort === o ? "font-semibold text-[#e53935]" : "font-normal text-[#1a1a1a]"}`}
              >
                {o}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop
  return (
    <div className="flex items-center gap-[8px]">
      <span className="font-['Outfit',sans-serif] font-normal text-[#9e9e9e] catalog-additional">
        Сортування:
      </span>
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-[6px] border border-[#e0e0e0] hover:border-[#1a1a1a] px-[12px] py-[6px] transition-colors duration-200"
        >
          <span className="font-['Outfit',sans-serif] font-medium text-[#1a1a1a] text-[13px]">
            {sort}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="M0 0L6 12L12 0" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-[2px] bg-white border border-[#e0e0e0] z-10 w-[180px] animate-fade-up shadow-lg">
            {SORT_OPTIONS.map((o, i) => (
              <button
                key={o}
                onClick={() => {
                  setSort(o);
                  setOpen(false);
                }}
                className={`w-full px-[12px] py-[8px] text-left font-['Outfit',sans-serif] catalog-additional
                            hover:bg-[#f7f7f7] transition-colors duration-150
                            ${sort === o ? "font-semibold text-[#e53935]" : "font-normal text-[#1a1a1a]"}`}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                {o}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}