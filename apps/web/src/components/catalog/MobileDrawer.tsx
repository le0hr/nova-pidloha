"use client";

import Filters from "./Filters";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ isOpen, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden xl:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-320"
        style={{ opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative bg-white w-[300px] max-w-full min-w-0 h-dvh max-h-full overflow-y-auto overflow-x-hidden overscroll-contain p-[16px] transition-transform duration-320 ease-out"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div className="flex items-center justify-between mb-[20px]">
          <span className="font-['Outfit',sans-serif] font-bold text-[#1a1a1a] text-[16px]">
            Фільтри
          </span>
          <button
            aria-label="Закрити фільтри"
            onClick={onClose}
            className="size-[36px] flex items-center justify-center hover:bg-[#f7f7f7] transition-colors duration-150"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="#1A1A1A"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <Filters />
      </div>
    </div>
  );
}