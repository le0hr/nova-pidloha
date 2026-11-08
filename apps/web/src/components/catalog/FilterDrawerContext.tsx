"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import MobileDrawer from "./MobileDrawer";

// ——— Types (під те, що приходить з API) ———
export type FilterValue = {
  name: string;
  slug: string;
  hex?: string;
};

export type FilterGroup = {
  name: string;
  slug: string;
  type: "color" | "select" | "price";
  filter_values: FilterValue[];
  min?: number;
  max?: number;
};

type SelectedFilters = Record<string, string[] | string | [number, number]>;

type FilterDrawerContextType = {
  open: () => void;
  close: () => void;

  filterGroups: FilterGroup[];
  selected: SelectedFilters;

  toggleCheckbox: (groupSlug: string, optionSlug: string) => void;
  setColor: (groupSlug: string, optionSlug: string) => void;
  setPrice: (groupSlug: string, index: 0 | 1, value: number) => void;
  
  removeFilter: (groupSlug: string, optionSlug: string) => void;
  
  resetFilters: () => void;
  applyFilters: () => void;

  /** Last changed option ("group:option", or the price group slug) and how many products the pending selection finds. */
  preview: { anchor: string; total: number | null } | null;


};


const FilterDrawerContext = createContext<FilterDrawerContextType | null>(null);

// ——— Helpers ———
function selectedToSearchParams(selected: SelectedFilters): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(selected).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return;

      // price [min, max]
      if (typeof value[0] === "number") {
        params.set(`${key}_min`, String(value[0]));
        params.set(`${key}_max`, String(value[1]));
      } else {
        // select (checkbox)
        params.set(key, value.join(","));
      }
    } else if (typeof value === "string" && value) {
      params.set(key, value);
    }
  });

  return params;
}

function searchParamsToSelected(
  searchParams: URLSearchParams,
  filterGroups: FilterGroup[]
): SelectedFilters {
  const selected: SelectedFilters = {};

  filterGroups.forEach((group) => {
    if (group.type === "select") {
      const value = searchParams.get(group.slug);
      selected[group.slug] = value ? value.split(",") : [];
    }

    if (group.type === "color") {
      selected[group.slug] = searchParams.get(group.slug) || "";
    }

    if (group.type === "price") {
      const read = (key: string, fallback: number) => {
        const raw = searchParams.get(key);
        const value = raw === null || raw.trim() === "" ? fallback : Number(raw);
        return Number.isFinite(value) ? Math.min(group.max ?? 0, Math.max(group.min ?? 0, value)) : fallback;
      };
      const from = read(`${group.slug}_min`, group.min ?? 0);
      const to = read(`${group.slug}_max`, group.max ?? 0);
      const min = Math.min(from, to);
      const max = Math.max(from, to);
      selected[group.slug] = [min, max];
    }
  });

  return selected;
}

function getEmptySelected(filterGroups: FilterGroup[]): SelectedFilters {
  const selected: SelectedFilters = {};

  filterGroups.forEach((group) => {
    if (group.type === "select") selected[group.slug] = [];
    if (group.type === "color") selected[group.slug] = "";
    if (group.type === "price") {
      selected[group.slug] = [group.min ?? 0, group.max ?? 0];
    }
  });

  return selected;
}

/** URL query for a selection (price bounds equal to the full range are left out). */
function selectionQuery(selected: SelectedFilters, filterGroups: FilterGroup[]): URLSearchParams {
  const params = selectedToSearchParams(selected);
  for (const group of filterGroups) {
    if (group.type !== "price") continue;
    const range = selected[group.slug] as [number, number];
    if (range?.[0] === group.min) params.delete(`${group.slug}_min`);
    if (range?.[1] === group.max) params.delete(`${group.slug}_max`);
  }
  return params;
}

// ——— Provider ———
type ProviderProps = {
  children: ReactNode;
  filterGroups: FilterGroup[];
};

export function FilterDrawerProvider({
  children,
  filterGroups,
}: ProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ініціалізуємо з URL
  const [selected, setSelected] = useState<SelectedFilters>(() =>
    searchParamsToSelected(searchParams, filterGroups)
  );

  // The changed option, valid only for the URL it was changed on (a navigation hides the preview).
  const [anchorState, setAnchorState] = useState<{ value: string; url: string } | null>(null);
  const currentUrl = searchParams.toString();
  const anchor = anchorState?.url === currentUrl ? anchorState.value : null;
  const setAnchor = (value: string | null) => setAnchorState(value ? { value, url: currentUrl } : null);
  const [counted, setCounted] = useState<{ key: string; total: number } | null>(null);

  // Якщо filterGroups прийшли пізніше або змінилися — синхронізуємо
  useEffect(() => {
    setSelected(searchParamsToSelected(searchParams, filterGroups));
  }, [filterGroups, searchParams]);

  // "Знайдено N товарів" next to the option the user just changed (debounced count request).
  const category = pathname.split("/")[2];
  const previewQuery = anchor ? selectionQuery(selected, filterGroups).toString() : "";
  const previewKey = anchor ? `${anchor}|${previewQuery}` : "";
  useEffect(() => {
    if (!previewKey) return;
    const params = new URLSearchParams(previewQuery);
    params.set("count", "1");
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/catalog/${category}?${params}`, { signal: controller.signal })
        .then(response => response.ok ? response.json() as Promise<{ total: number }> : Promise.reject(response.status))
        .then(data => setCounted({ key: previewKey, total: data.total }))
        .catch(() => undefined);
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [previewKey, previewQuery, category]);
  const preview = anchor ? { anchor, total: counted?.key === previewKey ? counted.total : null } : null;

  // ——— Drawer ———
  const open = () => {
    setMounted(true);
    setTimeout(() => setIsOpen(true), 10);
  };

  const close = () => {
    setIsOpen(false);
    setTimeout(() => setMounted(false), 320);
  };

  // ——— Filter logic ———
  const toggleCheckbox = (groupSlug: string, optionSlug: string) => {
    setAnchor(`${groupSlug}:${optionSlug}`);
    setSelected((prev) => {
      const current = (prev[groupSlug] as string[]) || [];
      const next = current.includes(optionSlug)
        ? current.filter((s) => s !== optionSlug)
        : [...current, optionSlug];
      return { ...prev, [groupSlug]: next };
    });
  };

  const setColor = (groupSlug: string, optionSlug: string) => {
    setAnchor(`${groupSlug}:${optionSlug}`);
    setSelected((prev) => ({ ...prev, [groupSlug]: optionSlug }));
  };

  const setPrice = (groupSlug: string, index: 0 | 1, value: number) => {
    setAnchor(groupSlug);
    setSelected((prev) => {
      const group = filterGroups.find(group => group.slug === groupSlug);
      if (!group || !Number.isFinite(value)) return prev;
      const current = (prev[groupSlug] as [number, number]) || [group.min ?? 0, group.max ?? 0];
      const next: [number, number] = [...current];
      next[index] = Math.max(group.min ?? 0, Math.min(group.max ?? 0, value));

      if (index === 0 && next[0] > next[1]) next[0] = next[1];
      if (index === 1 && next[1] < next[0]) next[1] = next[0];

      return { ...prev, [groupSlug]: next };
    });
  };

  const resetFilters = () => {
    setAnchor(null);
    setSelected(getEmptySelected(filterGroups));

    router.push(pathname, {
    scroll: false,
    });

    close();
  };

  const removeFilter = (groupSlug: string, optionSlug: string) => {
    setSelected((prev) => {
      const current = prev[groupSlug];

      // checkbox
      if (Array.isArray(current) && typeof current[0] !== "number") {
        return {
          ...prev,
          [groupSlug]: current.filter((value): value is string => typeof value === "string" && value !== optionSlug),
        };
      }

      // color
      if (typeof current === "string") {
        return {
          ...prev,
          [groupSlug]: "",
        };
      }

      return prev;
    });

    // одразу застосовуємо зміни до URL
    const params = new URLSearchParams(searchParams.toString());

    const current = params.get(groupSlug);

    if (current) {
      const values = current
        .split(",")
        .filter((value) => value !== optionSlug);

      if (values.length > 0) {
        params.set(groupSlug, values.join(","));
      } else {
        params.delete(groupSlug);
      }
    }

    router.push(
      params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname,
      { scroll: false }
    );
  };

  const applyFilters = () => {
    setAnchor(null);
    const params = selectionQuery(selected, filterGroups);
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);
    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });

    close();
  };

  return (
    <FilterDrawerContext.Provider
      value={{
        open,
        close,
        filterGroups,
        selected,
        toggleCheckbox,
        setColor,
        setPrice,
        resetFilters,
        applyFilters,
        removeFilter,
        preview,
      }}
    >
      {children}
      {mounted && <MobileDrawer isOpen={isOpen} onClose={close} />}
    </FilterDrawerContext.Provider>
  );
}

export function useFilterDrawer() {
  const ctx = useContext(FilterDrawerContext);
  if (!ctx) {
    throw new Error("useFilterDrawer must be used within FilterDrawerProvider");
  }
  return ctx;
}