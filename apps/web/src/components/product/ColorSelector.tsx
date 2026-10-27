import { StepHeader } from "./StepHeader";

export default function ColorSelector({
    decor_colors,
    value,
    setValue,
    step,
    total = 4,
    label = "Колір"
}: {
  decor_colors: string[];
  value: { decor_color: string };
  setValue: (value: { decor_color: string }) => void;
  step: number;
  total?: number;
  label?: string;
}) {
    return(
        <div className="flex flex-col gap-2.5">
                <StepHeader
                  label={`Крок ${step}: ${label}`}
                  step={`${step}/${total}`}
                  note="(не впливає на ціну)"
                />
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {decor_colors.map((color) => {
                    const active = value.decor_color === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setValue({ decor_color: color })}
                        className="flex flex-col gap-1.5 items-center group"
                      >
                        <div
                          className={`relative w-full aspect-square overflow-hidden bg-[#f0f0f0] transition-all ${
                            active
                              ? "outline outline-2 outline-[#e53935]"
                              : "outline outline-1 outline-[#e0e0e0] group-hover:outline-[#bbb]"
                          }`}
                        >
                          {/* Placeholder — заміни на <img> коли будуть картинки */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-['Outfit',sans-serif] text-[10px] text-[#888] text-center px-1 leading-tight">
                              {color}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`w-full text-center font-['Outfit',sans-serif] product-option-btn truncate ${
                            active ? "font-semibold text-[#1a1a1a]" : "text-[#555]"
                          }`}
                        >
                          {color}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
    )
}