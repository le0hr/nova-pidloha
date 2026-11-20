"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import DoorDecorSelector from "./DoorDecorSelector";
import { StepHeader } from "./StepHeader";
import ColorSelector from "./ColorSelector";
import AccentSelector from "./AccentSelector";
import { VariationState } from "@/types/product";
import { describeRules, snapSize, type Dimension, type Size, type SizeRule } from "@/lib/catalog/sizing";

/** Door size: standard values as buttons; a typed-in value where the CMS has non-standard rules for that dimension. */
export interface SizeOptions {
  widths: number[];
  heights: number[];
  value: Size;
  rules: Record<Dimension, SizeRule[]>;
  allowed: Record<Dimension, number[]>;
  /** Surcharge of the chosen size, % (width and height added up). */
  percent: number;
  custom: boolean;
  /** Catalog notes for the chosen size. */
  notes: string[];
  onPick: (size: Partial<Size>) => void;
}

const chip = (active: boolean) => `min-h-9 px-3 font-['Outfit',sans-serif] text-[13px] transition-colors ${
  active ? "bg-white outline outline-1 outline-[#e53935] font-semibold text-[#e53935]" : "bg-[#f5f5f5] text-[#1a1a1a] hover:bg-[#eee]"}`;

/** Typed size: rounded up to the allowed step when the field is left (or Enter is pressed). */
function SizeInput({ label, value, allowed, onCommit }: { label: string; value: number; allowed: number[]; onCommit: (value: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft === null) return;
    const typed = parseInt(draft, 10);
    setDraft(null);
    if (Number.isFinite(typed) && typed > 0) onCommit(snapSize(typed, allowed));
  };
  return (
    <label className="flex-1 flex flex-col gap-1">
      <span className="font-['Outfit',sans-serif] text-[12px] text-[#9e9e9e]">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={allowed[0]}
        max={allowed[allowed.length - 1]}
        value={draft ?? String(value)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
        className="w-full border border-[#e0e0e0] bg-white px-3 py-2 font-['Outfit',sans-serif] text-[13px] text-[#1a1a1a] outline-none focus:border-[#bbb]"
      />
    </label>
  );
}

interface Props {
  beforeDimensions?: ReactNode;
  /** Door size step; hardware and other non-sized goods have none. */
  sizes?: SizeOptions;
  additionalCount?: number;
  /** Note next to the colour step; omitted when colours are priced differently. */
  colorNote?: string;
  /** Colour name → swatch photo. */
  swatches?: Record<string, string>;
  value: VariationState;
  onChange: (value: Partial<VariationState>) => void;
  options: {
    decor: string[];
    decor_color: string[];
    decor_glass: string[];
  };
}



export default function VariationSelector({ value, onChange, options, beforeDimensions, additionalCount = 0, sizes, colorNote, swatches }: Props) {
  const setValue = (partial: Partial<VariationState>) => onChange(partial);

  const baseCount = Object.values(options).filter((values) => values.length > 0).length;
  const total = baseCount + additionalCount + (sizes ? 1 : 0);

  const dimensions = sizes ? ([
    { key: "width", label: "Ширина, мм", standards: sizes.widths },
    { key: "height", label: "Висота, мм", standards: sizes.heights },
  ] as const).filter((dimension) => dimension.standards.length > 0 || sizes.rules[dimension.key].length > 0) : [];
  const typed = dimensions.filter((dimension) => sizes!.rules[dimension.key].length > 0);

  return (
    <div className="flex flex-col gap-5 w-full">
      {options.decor.length > 0 && <DoorDecorSelector decors={options.decor} value={value} setValue={setValue} step={1} total={total} />}
      {options.decor_color.length > 0 && <ColorSelector decor_colors={options.decor_color} images={swatches} value={value} setValue={setValue} step={Number(options.decor.length > 0) + 1} total={total} note={colorNote} />}
      {options.decor_glass.length > 0 && <AccentSelector accents={options.decor_glass} value={value} setValue={setValue} step={baseCount} total={total} />}
      {beforeDimensions}

      {sizes && <div className="flex flex-col gap-2.5">
        <StepHeader label={`Крок ${total}: Розмір`} step={`${total}/${total}`} />

        {/* Standard sizes only */}
        {dimensions.filter((dimension) => !sizes.rules[dimension.key].length).map((dimension) => (
          <div key={dimension.key} className="flex flex-col gap-1">
            <span className="font-['Outfit',sans-serif] text-[12px] text-[#9e9e9e]">{dimension.label}</span>
            <div className="flex flex-wrap gap-1.5">
              {dimension.standards.map((size) => (
                <button key={size} type="button" aria-pressed={sizes.value[dimension.key] === size}
                  onClick={() => sizes.onPick({ [dimension.key]: size })} className={chip(sizes.value[dimension.key] === size)}>{size}</button>
              ))}
            </div>
          </div>
        ))}

        {/* Any size within the rules, rounded up to the step */}
        {typed.length > 0 && <div className="flex flex-col gap-1.5">
          <div className="flex gap-3">
            {typed.map((dimension) => (
              <SizeInput key={dimension.key} label={dimension.label} value={sizes.value[dimension.key]} allowed={sizes.allowed[dimension.key]}
                onCommit={(size) => sizes.onPick({ [dimension.key]: size })} />
            ))}
          </div>
          {typed.map((dimension) => (
            <span key={dimension.key} className="font-['Outfit',sans-serif] text-[12px] text-[#9e9e9e]">
              {dimension.key === "width" ? "Ширина" : "Висота"}: {describeRules(dimension.standards, sizes.rules[dimension.key])}
            </span>
          ))}
        </div>}

        {sizes.notes.map((note) => (
          <div key={note} className="flex items-start gap-2 border-l-[3px] border-[#9e9e9e] bg-[#f5f5f5] px-3 py-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-px shrink-0">
              <circle cx="7" cy="7" r="6" stroke="#757575" strokeWidth="1.5" />
              <path d="M7 6.5v3.5M7 4v.25" stroke="#757575" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="font-['Outfit',sans-serif] text-[12px] text-[#555]">{note}</span>
          </div>
        ))}

        {sizes.custom && (
          <div className="flex items-center gap-2 border-l-[3px] border-[#e67e22] bg-[#fef5ed] px-3 py-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <circle cx="7" cy="7" r="6" stroke="#E67E22" strokeWidth="1.5" />
              <path d="M7 4.5v3M7 9.5v.25" stroke="#E67E22" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="font-['Outfit',sans-serif] text-[12px] font-medium text-[#e67e22]">
              {sizes.percent ? `Нестандартний розмір: +${sizes.percent}% до ціни стандартного` : "Нестандартний розмір без націнки"}
            </span>
          </div>
        )}
      </div>}
    </div>
  );
}
