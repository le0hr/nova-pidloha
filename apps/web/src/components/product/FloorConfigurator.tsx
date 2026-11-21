"use client";

import { ProductVariation } from "@/types/product";
import ColorSelector from "./ColorSelector";
import { VariationState } from "@/types/product";

interface FloorConfiguratorProps {
  variations: ProductVariation[];
  options: {
    decor: string[];
    decor_color: string[];
    decor_glass: string[];
  };
  /** Colour name → swatch photo. */
  swatches?: Record<string, string>;
  value: VariationState;
  onChange: (value: Partial<VariationState>) => void;
  qtyM2: number;
  onQtyChange: (v: number) => void;
  unit: "m2" | "pack";
  onUnitChange: (u: "m2" | "pack") => void;
  packArea: number;
  stockM2: number;
  pricePerM2: number;
  totalPrice: number;
  packsApprox: number;
  /** False for items sold by piece/roll (no pack area): only a piece counter is shown. */
  byPack?: boolean;
  boardSize?: string;
}

export default function FloorConfigurator({
  value,
  options,
  swatches,
  onChange,
  qtyM2,
  onQtyChange,
  unit: unitProp,
  onUnitChange,
  packArea,
  stockM2,
  pricePerM2,
  totalPrice,
  packsApprox,
  byPack = true,
  boardSize,
}: FloorConfiguratorProps) {
  const unit = byPack ? unitProp : "pack";

  // Everything is sold by whole packs: in m² the step is one pack's area, the unit only changes how it is shown.
  const packs = Math.max(1, Math.round(qtyM2 / packArea));
  const handleQtyChange = (delta: number) => {
    onQtyChange(+(Math.max(1, packs + delta) * packArea).toFixed(4));
  };

  const displayValue = unit === "m2" ? `${+(packs * packArea).toFixed(3)} м²` : `${packs} уп.`;
  const setValue = (partial: Partial<VariationState>) => onChange(partial);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ===== Крок 1: Колір ===== */}
      <div className="flex flex-col gap-3">
        <ColorSelector
          decor_colors={options.decor_color}
          images={swatches}
          value={value}
          setValue={setValue}
          step={1}
          />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-['Outfit',sans-serif] font-bold text-[#1a1a1a] text-[15px]">
            Крок 2: Кількість
          </span>
          <span className="font-['Outfit',sans-serif] font-medium text-[#b0b0b0] text-[13px]">
            2/3
          </span>
        </div>

        {byPack && <>
        {/* Info*/}
        <div className="bg-[#fff8f0] border-l-[3px] border-[#e67e22] px-3 py-2">
          <span className="font-['Outfit',sans-serif] text-[13px] font-medium text-[#e67e22]">
            Упаковка: {packArea} м²{boardSize ? ` / дошка ${boardSize} мм` : ""}
          </span>
        </div>

        {/* Switcher  */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onUnitChange("m2")}
            className={`flex-1 h-11 font-['Outfit',sans-serif] text-[14px] font-semibold transition-colors ${
              unit === "m2"
                ? "bg-white outline outline-2 outline-[#e53935] text-[#e53935]"
                : "bg-white outline outline-1 outline-[#e0e0e0] text-[#1a1a1a]"
            }`}
          >
            м²
          </button>
          <button
            type="button"
            onClick={() => onUnitChange("pack")}
            className={`flex-1 h-11 font-['Outfit',sans-serif] text-[14px] font-semibold transition-colors ${
              unit === "pack"
                ? "bg-white outline outline-2 outline-[#e53935] text-[#e53935]"
                : "bg-white outline outline-1 outline-[#e0e0e0] text-[#1a1a1a]"
            }`}
          >
            упаковки
          </button>
        </div>
        </>}

        {/* Quantity controls */}
        <div className="flex items-center justify-between bg-black text-white h-12 px-4">
          <button
            type="button"
            onClick={() => handleQtyChange(-1)} aria-label="Менше на одну упаковку"
            className="text-[22px] leading-none w-8 h-8 flex items-center justify-center hover:text-[#e53935] transition-colors"
          >
            −
          </button>
          <span className="font-['Outfit',sans-serif] font-medium text-[18px] tracking-wide">
            {byPack ? displayValue : packs}
          </span>
          <button
            type="button"
            onClick={() => handleQtyChange(1)} aria-label="Більше на одну упаковку"
            className="text-[22px] leading-none w-8 h-8 flex items-center justify-center hover:text-[#e53935] transition-colors"
          >
            +
          </button>
        </div>

        {byPack && <div className="flex items-center justify-between text-[13px]">
          <span className="font-['Outfit',sans-serif] text-[#9e9e9e]">
            {unit === "m2" ? `${packsApprox} уп.` : `${+(packsApprox * packArea).toFixed(3)} м²`}
          </span>
          <span className="font-['Outfit',sans-serif] text-[#9e9e9e]">
            Мінімальне замовлення: 1 уп. ({packArea} м²)
          </span>
        </div>}
      </div>

      
    </div>
  );
}