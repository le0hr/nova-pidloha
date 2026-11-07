import SectionHeader from "./SectionHeader";
import VerticalCardCarousel from "./VerticalCardCarousel";
import RandomCardGroup from "./RandomCardGroup";
import HomeCard, { homeCardCarousel } from "./HomeCard";

import type { HomeCategory } from "@/types/home";
import { groupedCardColumns, homeCardColumns } from "@/lib/catalog/home-cards";

// Design previews are shown until featured categories are marked in the CMS.
const previews: HomeCategory[] = [
  { parentName: "Підлога", name: "Ламінат", description: "Зносостійкі покриття відомих європейських брендів", image: "/images/home/laminate.png", href: "/catalog/pidloha", group: "Підлога" },
  { parentName: "Підлога", name: "SPC підлога", description: "100% водостійка мінерально-композитна основа", image: "/images/home/spc.png", href: "/catalog/pidloha", group: "Підлога" },
  { parentName: "Підлога", name: "Вінілова підлога", description: "Тихе, тепле та стійке покриття для будь-якої кімнати", image: "/images/home/vinyl.png", href: "/catalog/pidloha", group: "Підлога" },
  { parentName: "Міжкімнатні двері", name: "Класичні", description: "Сучасні та класичні моделі з надійною фурнітурою", image: "/images/home/doors.png", href: "/catalog/mizhkimnatni", group: "Міжкімнатні двері" },
];

export default function Categories({ categories }: { categories: HomeCategory[] }) {
  // CMS categories: one column per class with its subclasses; design previews keep the original layout.
  const columns = categories.length
    ? groupedCardColumns(categories, category => category.group)
    : homeCardColumns(previews, category => category.group);
  return (
    <section id="categories" aria-labelledby="categories-title" className="content-container page-gutter flex scroll-mt-6 flex-col gap-4 !py-6 md:gap-10 md:!py-16 lg:!py-20">
      <SectionHeader id="categories-title" eyebrow="Каталог продукції" title="Наші категорії" mobileTitle="Категорії" description="Оберіть найкращі матеріали для ремонту" />
      <RandomCardGroup className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
        {columns.map((column) => (
          <VerticalCardCarousel key={column[0].href + column[0].name} label={`Категорії: ${column[0].group}`} {...homeCardCarousel} slides={column.map(category => ({ key: category.href + category.name, content: (
            // Only the button navigates to the subcategory.
            <HomeCard title={category.name} href={category.href} image={category.image} badge={category.parentName}
              description={category.description} actionLabel="Переглянути" />
          ) }))} />
        ))}
      </RandomCardGroup>
    </section>
  );
}
