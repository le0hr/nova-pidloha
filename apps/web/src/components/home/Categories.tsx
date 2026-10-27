import Image from "next/image";
import Link from "next/link";
import HomeIcon from "./HomeIcon";
import SectionHeader from "./SectionHeader";
import VerticalCardCarousel from "./VerticalCardCarousel";
import RandomCardGroup from "./RandomCardGroup";

const categories = [
  { title: "Підлога", subtitle: "Ламінат", description: "Зносостійкі покриття відомих європейських брендів", image: "laminate", href: "/catalog/pidloha" },
  { title: "Підлога", subtitle: "SPC підлога", description: "100% водостійка мінерально-композитна основа", image: "spc", href: "/catalog/pidloha" },
  { title: "Підлога", subtitle: "Вінілова підлога", description: "Тихе, тепле та стійке покриття для будь-якої кімнати", image: "vinyl", href: "/catalog/pidloha" },
  { title: "Міжкімнатні двері", subtitle: "Класичні", description: "Сучасні та класичні моделі з надійною фурнітурою", image: "doors", href: "/catalog/mizhkimnatni" },
];

export default function Categories() {
  return (
    <section id="categories" aria-labelledby="categories-title" className="content-container page-gutter flex scroll-mt-6 flex-col gap-4 !py-6 md:gap-10 md:!py-16 lg:!py-20">
      <SectionHeader id="categories-title" eyebrow="Каталог продукції" title="Наші категорії" mobileTitle="Категорії" description="Оберіть найкращі матеріали для ремонту" />
      <RandomCardGroup className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
        {categories.map((column, columnIndex) => (
          <VerticalCardCarousel key={column.subtitle} label={`Категорії ${columnIndex + 1}`} className="h-[290px] bg-[#f5f5f5] md:h-[330px]" slides={categories.map((_, offset) => {
            const category = categories[(columnIndex + offset) % categories.length];
            return { key: category.subtitle, content: (
          <Link key={category.subtitle} href={category.href} className="flex h-full min-w-0 flex-col focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#e53935]">
            <div className="relative h-[158px] shrink-0 overflow-hidden md:h-[180px]"><Image src={`/images/home/${category.image}.png`} alt={category.subtitle} fill sizes="(min-width: 1024px) 24vw, 48vw" className="object-cover" /></div>
            <div className="flex flex-1 flex-col gap-2 p-3 md:gap-2 md:p-4">
              <div><h3 className="line-clamp-1 text-sm font-bold leading-tight md:text-xl">{category.title}</h3><p className="mt-1 text-[11px] font-medium text-[#666] md:text-sm">{category.subtitle}</p></div>
              <p className="line-clamp-2 text-[11px] leading-[1.4] text-[#666] md:text-sm">{category.description}</p>
              <span className="flex min-h-[17px] items-center gap-1.5 text-xs font-bold text-[#e53935] md:text-sm">Переглянути<HomeIcon name="arrow-red" size={14} /></span>
            </div>
          </Link>
            ) };
          })} />
        ))}
      </RandomCardGroup>
    </section>
  );
}
