import { StepHeader } from "./StepHeader";

export default function  DoorDecorSelector({
  decors,
  value,
  setValue,
  step,
  total = 4,
  label = "Декор"
}: {
  decors: string[];
  value: { decor: string };
  setValue: (value: { decor: string }) => void;
  step: number;
  total?: number;
  label?: string;
}) {
    return(
        <div className="flex flex-col gap-2.5">
            <StepHeader label={`Крок ${step}: ${label}`} step={`${step}/${total}`} />
                <div className="grid grid-cols-3 gap-2">
                {decors.map((decor) => {
                    const active = value.decor === decor;
                    return (
                    <button
                        key={decor}
                        type="button"
                        onClick={() => setValue({ decor: decor })}
                        className={`min-h-10 py-2 flex items-center justify-center px-3 bg-white transition-colors ${
                        active
                            ? "outline outline-2 outline-[#e53935] text-[#e53935] font-bold"
                            : "outline outline-1 outline-[#e0e0e0] text-[#1a1a1a] font-semibold hover:outline-[#bbb]"
                        }`}
                    >
                        <span className="font-['Outfit',sans-serif] product-option-btn min-w-0 leading-tight [overflow-wrap:anywhere]">
                        {decor}
                        </span>
                    </button>
                    );
                })}
            </div>
        </div>
        
    )

}