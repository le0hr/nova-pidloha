interface SectionHeaderProps {
  id: string;
  eyebrow: string;
  title: string;
  mobileTitle?: string;
  description?: string;
}

export default function SectionHeader({ id, eyebrow, title, mobileTitle, description }: SectionHeaderProps) {
  return (
    <div data-home-reveal="" className="flex min-w-0 flex-col gap-2">
      <p className="hidden text-xs font-bold uppercase tracking-wide text-[#e53935] md:block">{eyebrow}</p>
      <h2 id={id} className="text-[22px] font-medium leading-tight md:text-[32px] md:font-bold 2xl:text-[36px]">
        {mobileTitle ? <><span className="md:hidden">{mobileTitle}</span><span className="hidden md:inline">{title}</span></> : title}
      </h2>
      {description && <p className="hidden text-base leading-relaxed text-[#666] md:block">{description}</p>}
    </div>
  );
}
