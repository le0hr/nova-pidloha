import Link from "next/link";
import type { HomeProduct } from "@/types/home";
import HomeIcon from "./HomeIcon";
import SectionHeader from "./SectionHeader";
import VerticalCardCarousel from "./VerticalCardCarousel";
import RandomCardGroup from "./RandomCardGroup";
import HomeCard, { homeCardCarousel } from "./HomeCard";

import { groupedCardColumns } from "@/lib/catalog/home-cards";

// Design previews link to the catalog; shown until featured products are marked in the CMS.
const previews: HomeProduct[] = [
  { name: "Ламінат Kronospan Castello Classic Oak", href: "/catalog/pidloha", image: "/images/home/product-laminate.png", price: null, group: "Підлога" },
  { name: "SPC підлога Rocko Vinyl Toffee Oak", href: "/catalog/pidloha", image: "/images/home/product-spc.png", price: null, group: "Підлога" },
  { name: "Вінілова плитка IVC Camino Wood", href: "/catalog/pidloha", image: "/images/home/product-vinyl.png", price: null, group: "Підлога" },
  { name: "Двері міжкімнатні Porta Loft Grau", href: "/catalog/mizhkimnatni", image: "/images/home/product-door.png", price: null, group: "Міжкімнатні двері" },
];

export default function PopularProducts({ products }: { products: HomeProduct[] }) {
  const items = products.length ? products : previews;
  const columns = groupedCardColumns(items, product => product.group);

  return (
    <section aria-labelledby="popular-title" className="bg-white md:bg-[#f5f5f5]">
      <div className="content-container page-gutter flex flex-col gap-4 !pt-0 !pb-6 md:gap-10 md:!py-16 lg:!py-20">
        <div className="flex items-center justify-between gap-4">
          <SectionHeader id="popular-title" eyebrow="Тренди сезону" title="Популярні товари" description="Обирайте підлогу та двері для вашого дому" />
          <Link href="#categories" className="hidden items-center gap-2 text-sm font-bold text-[#e53935] hover:underline md:flex">Всі товари<HomeIcon name="arrow-red" size={16} /></Link>
        </div>
        <RandomCardGroup className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          {columns.map((column) => (
            <VerticalCardCarousel key={column[0].name + column[0].href} label={`Товари: ${column[0].group}`} {...homeCardCarousel} slides={column.map((product) => ({ key: product.name + product.href, content: (
              <HomeCard title={product.name} href={product.href} image={product.image} imagePortrait={product.imagePortrait} badge={product.badge}
                description={product.description} actionLabel="Обрати" linkContent
                footer={<p className="text-sm font-bold md:text-lg">{product.price !== null ? <><span className="text-[11px] font-normal text-[#666]">від </span>₴ {product.price.toLocaleString("uk-UA")}</> : <span className="text-[11px] font-normal text-[#666] md:text-xs">Ціну уточнюйте в каталозі</span>}</p>} />
            ) }))} />
          ))}
        </RandomCardGroup>
      </div>
    </section>
  );
}
