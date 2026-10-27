import { StepHeader } from "./StepHeader";

export default function AccentSelector({
  accents,
  value,
  setValue,
  step,
  total = 4,
  label = "Скло"
}: {
  accents: string[];
  value: { decor_glass: string };
  setValue: (value: { decor_glass: string }) => void;
  step: number;
  total?: number;
  label?: string;
}) {
    return (
        <div className="flex flex-col gap-2.5">
        <StepHeader label={`Крок ${step}: ${label}`} step={`${step}/${total}`} />
        <div className="grid grid-cols-2 gap-2">
          {accents.map((accent) => {
            const active = value.decor_glass === accent;
            return (
              <button
                key={accent}
                type="button"
                onClick={() => setValue({ decor_glass: accent })}
                className={`h-10 flex items-center justify-center px-3 bg-white transition-colors ${
                  active
                    ? "outline outline-2 outline-[#e53935] text-[#e53935] font-bold"
                    : "outline outline-1 outline-[#e0e0e0] text-[#1a1a1a] font-semibold hover:outline-[#bbb]"
                }`}
              >
                <span className="font-['Outfit',sans-serif] product-option-btn truncate">
                  {accent}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    )

}

