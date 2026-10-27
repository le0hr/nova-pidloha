"use client";

import { useId, useState } from "react";
import { useFilterDrawer } from "./FilterDrawerContext";

type FilterValue = {
  id?: string | number;
  name: string;
  slug?: string;
  value?: string;
  hex?: string;
};

type FilterGroup = {
  name: string;
  slug: string;
  type: "color" | "select" | "price";
  filter_values: FilterValue[];
  min?: number;
  max?: number;
};

const VISIBLE_VALUES = 4;

function FilterOptions({ group, renderOption }: {
  group: FilterGroup;
  renderOption: (option: FilterValue) => React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const values = group.filter_values;
  const layout = group.type === "color" ? "flex flex-wrap gap-3" : "flex flex-col gap-2.5";

  return (
    <div className="flex w-full min-w-0 flex-col gap-2.5">
      <div className={layout}>{values.slice(0, VISIBLE_VALUES).map(renderOption)}</div>
      {values.length > VISIBLE_VALUES && (
        <>
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded(value => !value)}
            className="self-start font-outfit text-sm text-[#E53935] underline"
          >
            {expanded ? "Згорнути" : `Показати ще (${values.length - VISIBLE_VALUES})`}
          </button>
          <div id={listId} hidden={!expanded}>
            {expanded && (
              <div
                tabIndex={0}
                role="region"
                aria-label={`Інші значення: ${group.name}`}
                className={`${layout} max-h-48 overflow-y-auto overscroll-contain border-l border-[#E0E0E0] py-1 pl-3 pr-2`}
              >
                {values.slice(VISIBLE_VALUES).map(renderOption)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function Filters() {
  const {
    filterGroups,
    selected,
    toggleCheckbox,
    setColor,
    setPrice,
    resetFilters,
    applyFilters
  } = useFilterDrawer();

  
  const getOptionId = (opt: FilterValue): string => {
    return String(opt.slug ?? opt.value ?? opt.id ?? opt.name);
  };

  return (
    <div className="catalog-filters flex w-full min-w-0 flex-col items-start gap-5 border border-[#E0E0E0] bg-white p-4">
      <div className="flex items-center justify-between self-stretch">
        <h2 className="font-outfit text-base font-bold text-[#1A1A1A]">
          Параметри
        </h2>
        <button
          onClick={resetFilters}
          className="font-outfit text-xs font-medium text-[#E53935] underline"
        >
          Скинути
        </button>
      </div>

      {filterGroups.map((group: FilterGroup) => (
        <div
          key={group.slug}
          className="flex min-w-0 flex-col items-start gap-3 self-stretch border-b border-[#E0E0E0] pb-5 last:border-b-0 last:pb-0"
        >
          <h3 className="max-w-full [overflow-wrap:anywhere] font-outfit text-sm font-bold uppercase text-[#1A1A1A]">
            {group.name}
          </h3>

          {/* SELECT → чекбокси */}
          {group.type === "select" && group.filter_values?.length > 0 && (
            <FilterOptions group={group} renderOption={(opt) => {
                const optionId = getOptionId(opt);
                const isChecked = (
                  (selected[group.slug] as string[]) || []
                ).includes(optionId);

                return (
                  <label
                    key={optionId}
                    className="flex min-w-0 cursor-pointer items-center gap-2"
                    onClick={() => toggleCheckbox(group.slug, optionId)}
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                        isChecked
                          ? "border-[#E53935] bg-[#E53935]"
                          : "border-[#BDBDBD] bg-white"
                      }`}
                    >
                      {isChecked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`min-w-0 [overflow-wrap:anywhere] font-outfit text-sm ${
                        isChecked
                          ? "font-medium text-[#E53935]"
                          : "text-[#1A1A1A]"
                      }`}
                    >
                      {opt.name}
                    </span>
                  </label>
                );
              }} />
          )}

          {/* COLOR */}
          {group.type === "color" && group.filter_values?.length > 0 && (
            <FilterOptions group={group} renderOption={(opt) => {
                const optionId = getOptionId(opt);
                const isSelected = selected[group.slug] === optionId;

                return (
                  <button
                    key={optionId}
                    type="button"
                    onClick={() => setColor(group.slug, optionId)}
                    className={`flex max-w-full min-w-0 items-center gap-1 p-1 border
                              ${isSelected ? "border-[#E53935]" : "border-transparent"}
                    `}
                  >
                    <div
                      className={`h-6 w-6 shrink-0 border-2 transition-colors border-transparent`}
                      style={{
                        backgroundColor: opt.hex || "#ccc",
                        boxShadow:
                          opt.hex?.toLowerCase() === "#ffffff" ||
                          opt.hex?.toLowerCase() === "#fff"
                            ? "inset 0 0 0 1px #E0E0E0"
                            : undefined,
                      }}
                      />
                    <span
                      className={`min-w-0 [overflow-wrap:anywhere] font-outfit text-xs ${
                        isSelected
                          ? "font-medium text-[#E53935]"
                          : "text-[#1A1A1A]"
                      }`}
                    >
                      {opt.name}
                    </span>
                  </button>
                );
              }} />
          )}

          {/* PRICE */}
          {group.type === "price" && (
            <>
              <div className="flex w-full items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 font-outfit text-sm text-[#1A1A1A]">
                    ₴
                  </span>
                  <input
                    type="number"
                    value={
                      (selected[group.slug] as [number, number])?.[0] ??
                      group.min
                    }
                    onChange={(e) =>
                      setPrice(group.slug, 0, Number(e.target.value))
                    }
                    className="w-full min-w-0 rounded border border-[#E0E0E0] py-1.5 pl-5 pr-2 font-outfit text-sm text-[#1A1A1A] outline-none focus:border-[#E53935]"
                  />
                </div>
                <div className="relative min-w-0 flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 font-outfit text-sm text-[#1A1A1A]">
                    ₴
                  </span>
                  <input
                    type="number"
                    value={
                      (selected[group.slug] as [number, number])?.[1] ??
                      group.max
                    }
                    onChange={(e) =>
                      setPrice(group.slug, 1, Number(e.target.value))
                    }
                    className="w-full min-w-0 rounded border border-[#E0E0E0] py-1.5 pl-5 pr-2 font-outfit text-sm text-[#1A1A1A] outline-none focus:border-[#E53935]"
                  />
                </div>
              </div>

              <div className="relative mt-3 h-1.5 w-full rounded-full bg-[#E0E0E0]">
                {(() => {
                  const [from, to] = (selected[group.slug] as [
                    number,
                    number,
                  ]) || [group.min!, group.max!];
                  const min = group.min ?? 0;
                  const max = group.max ?? min;
                  const left = max > min ? ((from - min) / (max - min)) * 100 : 0;
                  const right = max > min ? 100 - ((to - min) / (max - min)) * 100 : 0;

                  return (
                    <>
                      <div
                        className="absolute z-0 h-full rounded-full bg-[#E53935]"
                        style={{ left: `${left}%`, right: `${right}%` }}
                      />

                      <input
                        type="range"
                        min={min}
                        max={max}
                        aria-label="Мінімальна ціна"
                        disabled={min === max}
                        step="0.01"
                        value={from}
                        onChange={(e) =>
                          setPrice(group.slug, 0, Number(e.target.value))
                        }
                        className="absolute inset-0 z-10 h-full w-full appearance-none bg-transparent pointer-events-none
                          [&::-webkit-slider-runnable-track]:bg-transparent
                          [&::-webkit-slider-thumb]:pointer-events-auto
                          [&::-webkit-slider-thumb]:h-4
                          [&::-webkit-slider-thumb]:w-4
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:bg-[#E53935]
                          [&::-webkit-slider-thumb]:shadow
                          [&::-moz-range-track]:bg-transparent
                          [&::-moz-range-thumb]:pointer-events-auto
                          [&::-moz-range-thumb]:h-4
                          [&::-moz-range-thumb]:w-4
                          [&::-moz-range-thumb]:rounded-full
                          [&::-moz-range-thumb]:border-0
                          [&::-moz-range-thumb]:bg-[#E53935]"
                      />

                      <input
                        type="range"
                        min={min}
                        max={max}
                        aria-label="Максимальна ціна"
                        disabled={min === max}
                        step="0.01"
                        value={to}
                        onChange={(e) =>
                          setPrice(group.slug, 1, Number(e.target.value))
                        }
                        className="absolute inset-0 z-20 h-full w-full appearance-none bg-transparent pointer-events-none
                          [&::-webkit-slider-runnable-track]:bg-transparent
                          [&::-webkit-slider-thumb]:pointer-events-auto
                          [&::-webkit-slider-thumb]:h-4
                          [&::-webkit-slider-thumb]:w-4
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:bg-[#E53935]
                          [&::-webkit-slider-thumb]:shadow
                          [&::-moz-range-track]:bg-transparent
                          [&::-moz-range-thumb]:pointer-events-auto
                          [&::-moz-range-thumb]:h-4
                          [&::-moz-range-thumb]:w-4
                          [&::-moz-range-thumb]:rounded-full
                          [&::-moz-range-thumb]:border-0
                          [&::-moz-range-thumb]:bg-[#E53935]"
                      />
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      ))}

      <button
        onClick={() => applyFilters()}
        className="flex flex-col items-center justify-center self-stretch bg-[#E53935] py-3 transition-opacity hover:opacity-90"
      >
        <span className="font-outfit text-sm font-bold text-white">
          Застосувати
        </span>
      </button>
    </div>
  );
}