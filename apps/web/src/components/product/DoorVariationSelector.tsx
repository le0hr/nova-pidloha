"use client";

import { useState, type ReactNode } from "react";
import DoorDecorSelector from "./DoorDecorSelector";
import { StepHeader } from "./StepHeader";
import ColorSelector from "./ColorSelector";
import AccentSelector from "./AccentSelector";
import { VariationState } from "@/types/product";
import { SIZE_SURCHARGE, type Size } from "@/lib/catalog/sizing";

/** Standard sizes from the supplier file (each its own variation and price). */
export interface SizeOptions {
  widths: number[];
  heights: number[];
  current: Partial<Size>;
  onPick: (size: Partial<Size>) => void;
}

/** Custom (non-standard) sizes are switched off for now; the pricing rule stays in lib/catalog/sizing.ts. */
export const CUSTOM_SIZES_ENABLED = false;

const chip = (active: boolean) => `min-h-9 px-3 font-['Outfit',sans-serif] text-[13px] transition-colors ${
  active ? "bg-white outline outline-1 outline-[#e53935] font-semibold text-[#e53935]" : "bg-[#f5f5f5] text-[#1a1a1a] hover:bg-[#eee]"}`;

interface Props {
  beforeDimensions?: ReactNode;
  /** When the product has sized variations: pick a standard size or enter a custom one (+surcharge). */
  sizes?: SizeOptions;
  additionalCount?: number;
  /** Doors pick a size; hardware and other non-sized goods skip the step. */
  showSize?: boolean;
  /** Note next to the colour step; omitted when colours are priced differently. */
  colorNote?: string;
  value: VariationState;
  onChange: (value: Partial<VariationState>) => void;
  options: {
    decor: string[];
    decor_color: string[];
    decor_glass: string[];
  };
}



export default function VariationSelector({ value, onChange, options, beforeDimensions, additionalCount = 0, sizes, showSize = true, colorNote }: Props) {
  const setValue = (partial: Partial<VariationState>) => onChange(partial);

  const [custom, setCustom] = useState(value.sizeMode === "custom");
  const isNonStandard = sizes
    ? value.sizeMode === "custom" && (value.width !== sizes.current.width || value.height !== sizes.current.height)
    : value.width !== 750 || value.height !== 2050;

  const baseCount = Object.values(options).filter((values) => values.length > 0).length;
  const total = baseCount + additionalCount + (showSize ? 1 : 0);

  return (
    <div className="flex flex-col gap-5 w-full">
      {options.decor.length > 0 && <DoorDecorSelector decors={options.decor} value={value} setValue={setValue} step={1} total={total} />}
      {options.decor_color.length > 0 && <ColorSelector decor_colors={options.decor_color} value={value} setValue={setValue} step={Number(options.decor.length > 0) + 1} total={total} note={colorNote} />}
      {options.decor_glass.length > 0 && <AccentSelector accents={options.decor_glass} value={value} setValue={setValue} step={baseCount} total={total} />}
      {beforeDimensions}

      {/* Крок 4: Розмір */}
      {showSize && <div className="flex flex-col gap-2.5">
        <StepHeader label={`Крок ${total}: Розмір`} step={`${total}/${total}`} />

        <div className="flex gap-1 w-fit">
          <button
            type="button"
            onClick={() => {
              setCustom(false);
              setValue(sizes
                ? { sizeMode: "standard", width: sizes.current.width ?? value.width, height: sizes.current.height ?? value.height }
                : { sizeMode: "standard", width: 750, height: 2050 });
            }}
            className={`px-4 h-9 font-['Outfit',sans-serif] text-[13px] transition-colors ${
              !custom
                ? "bg-white outline outline-1 outline-[#e0e0e0] font-semibold text-[#1a1a1a]"
                : "bg-[#f5f5f5] text-[#9e9e9e]"
            }`}
          >
            Стандарт
          </button>
          {CUSTOM_SIZES_ENABLED && <button
            type="button"
            onClick={() => {
              setCustom(true);
              setValue({ sizeMode: "custom" });
            }}
            className={`px-4 h-9 font-['Outfit',sans-serif] text-[13px] transition-colors ${
              custom
                ? "bg-white outline outline-1 outline-[#e0e0e0] font-semibold text-[#1a1a1a]"
                : "bg-[#f5f5f5] text-[#9e9e9e]"
            }`}
          >
            Нестандарт
          </button>}
        </div>

        {sizes && !custom && (
          <div className="flex flex-col gap-2">
            {sizes.widths.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="font-['Outfit',sans-serif] text-[12px] text-[#9e9e9e]">Ширина, мм</span>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.widths.map((width) => (
                    <button key={width} type="button" aria-pressed={sizes.current.width === width}
                      onClick={() => sizes.onPick({ width })} className={chip(sizes.current.width === width)}>{width}</button>
                  ))}
                </div>
              </div>
            )}
            {sizes.heights.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="font-['Outfit',sans-serif] text-[12px] text-[#9e9e9e]">Висота, мм</span>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.heights.map((height) => (
                    <button key={height} type="button" aria-pressed={sizes.current.height === height}
                      onClick={() => sizes.onPick({ height })} className={chip(sizes.current.height === height)}>{height}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {(!sizes || custom) && <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <label className="font-['Outfit',sans-serif] text-[12px] text-[#9e9e9e]">
              Ширина, мм
            </label>
            <input
              type="number"
              value={value.width}
              onChange={(e) =>
                setValue({ width: parseInt(e.target.value) || 0 })
              }
              className="w-full border border-[#e0e0e0] bg-white px-3 py-2 font-['Outfit',sans-serif] text-[13px] text-[#1a1a1a] outline-none focus:border-[#bbb]"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="font-['Outfit',sans-serif] text-[12px] text-[#9e9e9e]">
              Висота, мм
            </label>
            <input
              type="number"
              value={value.height}
              onChange={(e) =>
                setValue({ height: parseInt(e.target.value) || 0 })
              }
              className="w-full border border-[#e0e0e0] bg-white px-3 py-2 font-['Outfit',sans-serif] text-[13px] text-[#1a1a1a] outline-none focus:border-[#bbb]"
            />
          </div>
        </div>}

        {CUSTOM_SIZES_ENABLED && (custom || isNonStandard) && (
          <div className="flex items-center gap-2 border-l-[3px] border-[#e67e22] bg-[#fef5ed] px-3 py-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <circle cx="7" cy="7" r="6" stroke="#E67E22" strokeWidth="1.5" />
              <path d="M7 4.5v3M7 9.5v.25" stroke="#E67E22" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="font-['Outfit',sans-serif] text-[12px] font-medium text-[#e67e22]">
              {sizes
                ? `Нестандартний розмір: ширина +${SIZE_SURCHARGE.width * 100}%, висота +${SIZE_SURCHARGE.height * 100}% до ціни стандартного розміру`
                : "Нестандартний розмір: націнка +15–20%"}
            </span>
          </div>
        )}
      </div>}
    </div>
  );
}
