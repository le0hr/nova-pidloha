"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFilterDrawer } from "./FilterDrawerContext";

type ActiveFilter = {
  group: string;
  value: string;
};

export default function ActiveFilters() {
  const [removingFilter, setRemovingFilter] = useState<string | null>(null);

  const { removeFilter } = useFilterDrawer();

  const searchParams = useSearchParams();

  const activeFilters: ActiveFilter[] = Array.from(searchParams.entries()).flatMap(
    ([key, value]) => {
      // price
      if (key.endsWith("_min") || key.endsWith("_max")) {
        return [];
      }

      // checkbox
      if (value.includes(",")) {
        return value.split(",").map((v) => ({ group: key, value: v }));
      }

      // color / single value
      return value ? [{ group: key, value }] : [];
    }
  );

  const startFilterRemove = (group: string, value: string) => {
    const id = `${group}:${value}`;
    setRemovingFilter(id);
    setTimeout(() => {
      removeFilter(group, value);
      setRemovingFilter(null);
    }, 180);
  };

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex items-center gap-3 self-stretch flex-wrap">
      <span className="font-outfit catalog-additional font-medium text-[#9E9E9E]">
        Активні фільтри
      </span>

      {activeFilters.map(({ group, value }) => {
        const id = `${group}:${value}`;
        return (
          <button
            key={id}
            onClick={() => startFilterRemove(group, value)}
            className={`flex items-center gap-1 border border-[#E53935] px-[10px] py-[6px]
                        transition-all duration-180
                        ${
                          removingFilter === id
                            ? "scale-75 opacity-0"
                            : "animate-chip-in scale-100 opacity-100 hover:bg-[#ffebee]"
                        }`}
          >
            <span className="font-outfit catalog-additional font-semibold leading-normal text-[#E53935]">
              {value} ×
            </span>
          </button>
        );
      })}
    </div>
  );
}