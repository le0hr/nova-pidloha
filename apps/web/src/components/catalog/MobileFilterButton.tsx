"use client";

import { useFilterDrawer } from "./FilterDrawerContext";

export default function MobileFilterButton() {
  const { open } = useFilterDrawer();

  return (
    <button
      onClick={open}
      className="flex items-center gap-[6px] border border-[#e0e0e0] px-[12px] py-[8px] hover:border-[#1a1a1a] transition-colors duration-200"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 4h12M4 8h8M6 12h4"
          stroke="#1A1A1A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-['Outfit',sans-serif] font-medium text-[#1a1a1a] text-[13px]">
        Фільтри
      </span>
    </button>
  );
}