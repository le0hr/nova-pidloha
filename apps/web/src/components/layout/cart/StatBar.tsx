"use client";

const steps = [
  { label: "Контакти" },
  { label: "Доставка" },
  { label: "Оплата" },
  { label: "Підтвердження" },
];


export default function StatBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="border-b border-[#E0E0E0] bg-[#F7F7F7]">
      <div className="checkout-container flex items-center py-5">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.label} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2 xl:gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 motion-reduce:transition-none text-sm font-bold font-['Outfit',sans-serif]
                    ${
                      isCompleted
                        ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                        : isActive
                        ? "border-[#E53935] bg-[#E53935] text-white"
                        : "border-[#E0E0E0] bg-white text-[#9E9E9E]"
                    }`}
                >
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M11.6662 3.5L5.25018 9.9162L2.3338 6.99975"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>

                <span
                  className={`font-['Outfit',sans-serif] text-sm xl:text-base font-bold whitespace-nowrap
                    ${
                      isActive || isCompleted
                        ? "text-[#1A1A1A]"
                        : "text-[#9E9E9E]"
                    }`}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={`mx-2 xl:mx-4 h-px flex-1 transition-colors duration-200 motion-reduce:transition-none
                    ${isCompleted ? "bg-[#1A1A1A]" : "bg-[#E0E0E0]"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}