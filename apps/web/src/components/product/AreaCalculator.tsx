"use client";

export default function AreaCalculator({ handleQtyChange, unit, displayValue }: {
  handleQtyChange: (delta: number) => void;
  unit: string;
  displayValue: string | number;
}){

    return(
        <div className="flex items-center justify-between bg-black text-white h-12 px-4">
          <button
            type="button"
            onClick={() => handleQtyChange(unit === "m2" ? -0.1 : -1)}
            className="text-[22px] leading-none w-8 h-8 flex items-center justify-center hover:text-[#e53935] transition-colors"
          >
            −
          </button>
          <span className="font-['Outfit',sans-serif] font-medium text-[18px] tracking-wide">
            {displayValue}
          </span>
          <button
            type="button"
            onClick={() => handleQtyChange(unit === "m2" ? 0.1 : 1)}
            className="text-[22px] leading-none w-8 h-8 flex items-center justify-center hover:text-[#e53935] transition-colors"
          >
            +
          </button>
        </div>
    )
}