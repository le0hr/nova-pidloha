import type { ReactNode } from "react";

export default function StepPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby="checkout-step-title" key={title} className="checkout-step-panel w-full min-w-0 rounded-[2px] border border-[#e0e0e0] bg-white">
      <div className="border-b border-[#e0e0e0] p-4 lg:p-6">
        <h1 id="checkout-step-title" className="font-outfit text-xl font-bold text-[#1a1a1a]">{title}</h1>
      </div>
      <div className="p-4 lg:p-6">{children}</div>
    </section>
  );
}
