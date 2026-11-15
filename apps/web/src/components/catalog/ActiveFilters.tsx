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

  const { removeFilter, filterGroups } = useFilterDrawer();
  // Only real catalog filters are chips; service params (page, sort, utm_*) are not.
  const filterKeys = new Set(filterGroups.filter((group) => group.type !== "price").map((group) => group.slug));

  const searchParams = useSearchParams();
  // Chips show the value name from the CMS ("Білий"), not its URL slug ("kolir-bilyi").
  const valueName = (group: string, slug: string) =>
    filterGroups.find((item) => item.slug === group)?.filter_values.find((item) => item.slug === slug)?.name ?? slug;

  const activeFilters: ActiveFilter[] = Array.from(searchParams.entries()).flatMap(
    ([key, value]) => {
      if (!filterKeys.has(key)) {
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
              {valueName(group, value)} ×
            </span>
          </button>
        );
      })}
    </div>
  );
}