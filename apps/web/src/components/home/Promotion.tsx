import Link from "next/link";

export default function Promotion() {
  return (
    <section id="offers" aria-labelledby="promotion-title" className="overflow-hidden bg-[#e53935] text-white">
      <h2 id="promotion-title" className="sr-only">Акція! Знижка до -25% на ламінат Kronospan — тільки до кінця місяця</h2>
      <Link href="/catalog/pidloha" aria-labelledby="promotion-title" className="sale-ticker relative flex min-h-12 items-center overflow-hidden py-3 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white md:min-h-14">
        <span className="sale-ticker-track flex w-max" aria-hidden="true">
          {[0, 1].map(group => <span key={group} className="sale-ticker-group flex shrink-0 items-center gap-10 pr-10 md:gap-16 md:pr-16">
            {[0, 1, 2].map(item => <span key={item} className="flex shrink-0 items-center gap-4 whitespace-nowrap text-sm font-semibold md:text-base">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">Акція</span>
              <span>До <strong className="text-lg font-extrabold md:text-xl">−25%</strong> на ламінат Kronospan</span>
              <span className="size-1 rounded-full bg-white/70" />
              <span className="font-normal text-white/90">Тільки до кінця місяця</span>
              <span className="text-lg" aria-hidden="true">↗</span>
            </span>)}
          </span>)}
        </span>
      </Link>
    </section>
  );
}
