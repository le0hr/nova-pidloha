export function StepHeader({
  label,
  step,
  note,
}: {
  label: string;
  step: string;
  note?: string;
}) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <span className="font-['Outfit',sans-serif] font-bold text-[#1a1a1a] product-step-label">
          {label}
        </span>
        {note && (
          <span className="font-['Outfit',sans-serif] font-medium text-[#9e9e9e] product-step-note">
            {note}
          </span>
        )}
      </div>
      <span className="font-['Outfit',sans-serif] font-medium text-[#b0b0b0] product-step-number">
        {step}
      </span>
    </div>
  );
}