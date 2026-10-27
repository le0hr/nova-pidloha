"use client";

import { useState } from "react";

const TABS = [
  { id: "description", label: "Опис" },
  { id: "characteristics", label: "Характеристики" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ProductTabsClient({
  description,
  characteristics,
  documents,
  reviews,
  reviewsCount = 0,
}: {
  description: React.ReactNode;
  characteristics: React.ReactNode;
  documents: React.ReactNode;
  reviews: React.ReactNode;
  reviewsCount?: number;
}) {
  const [active, setActive] = useState<TabId>("characteristics");

  return (
    <div className="w-full mt-12 md:mt-16">
      {/* Tabs */}
      <div className="border-b border-[#e5e5e5]">
        <nav className="flex gap-6 md:gap-8 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = active === tab.id;
            const label = tab.label;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={`
                  relative pb-3 font-['Outfit',sans-serif] text-[15px] whitespace-nowrap transition-colors
                  ${isActive
                    ? "text-[#e53935] font-semibold"
                    : "text-[#666] hover:text-[#1a1a1a]"
                  }
                `}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e53935]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-6">
        <div className={active === "description" ? "block" : "hidden"}>
          {description}
        </div>
        <div className={active === "characteristics" ? "block" : "hidden"}>
          {characteristics}
        </div>
      </div>
    </div>
  );
}