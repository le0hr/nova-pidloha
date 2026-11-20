import Link from "next/link";

export type PromoTicker = { label?: string; highlight?: string; text?: string; note?: string; url?: string };

/** Red running ticker under the hero; content comes from CMS Global → "Плашка акції". */
export default function Promotion({ promo }: { promo: PromoTicker | null }) {
  if (!promo?.text && !promo?.highlight) return null;
  const summary = [promo.label, promo.highlight, promo.text, promo.note].filter(Boolean).join(" ");
  const href = promo.url?.trim() || "/catalog";
  const external = /^https?:\/\//.test(href);
  const ticker = (
    <span className="sale-ticker-track flex w-max" aria-hidden="true">
      {[0, 1].map(group => <span key={group} className="sale-ticker-group flex shrink-0 items-center gap-10 pr-10 md:gap-16 md:pr-16">
        {[0, 1, 2].map(item => <span key={item} className="flex shrink-0 items-center gap-4 whitespace-nowrap text-sm font-semibold md:text-base">
          {promo.label && <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">{promo.label}</span>}
          <span>{promo.highlight && <strong className="text-lg font-extrabold md:text-xl">{promo.highlight}</strong>}{promo.highlight && promo.text ? " " : ""}{promo.text}</span>
          {promo.note && <><span className="size-1 rounded-full bg-white/70" /><span className="font-normal text-white/90">{promo.note}</span></>}
          <span className="text-lg" aria-hidden="true">↗</span>
        </span>)}
      </span>)}
    </span>
  );
  const className = "sale-ticker relative flex min-h-12 items-center overflow-hidden py-3 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white md:min-h-14";
  return (
    <section id="offers" aria-labelledby="promotion-title" className="overflow-hidden bg-[#e53935] text-white">
      <h2 id="promotion-title" className="sr-only">{summary}</h2>
      {external
        ? <a href={href} aria-labelledby="promotion-title" className={className}>{ticker}</a>
        : <Link href={href} aria-labelledby="promotion-title" className={className}>{ticker}</Link>}
    </section>
  );
}
