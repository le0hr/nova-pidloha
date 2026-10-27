import Image from "next/image";
import Link from "next/link";
import type { HomeProduct } from "@/types/home";
import HomeIcon from "./HomeIcon";
import SectionHeader from "./SectionHeader";
import VerticalCardCarousel from "./VerticalCardCarousel";
import RandomCardGroup from "./RandomCardGroup";

// Design previews link to the catalog; only CMS products link to a product page.
const previews: HomeProduct[] = [
  { name: "Ламінат Kronospan Castello Classic Oak", href: "/catalog/pidloha", image: "/images/home/product-laminate.png", price: null },
  { name: "SPC підлога Rocko Vinyl Toffee Oak", href: "/catalog/pidloha", image: "/images/home/product-spc.png", price: null },
  { name: "Вінілова плитка IVC Camino Wood", href: "/catalog/pidloha", image: "/images/home/product-vinyl.png", price: null },
  { name: "Двері міжкімнатні Porta Loft Grau", href: "/catalog/mizhkimnatni", image: "/images/home/product-door.png", price: null },
];

export default function PopularProducts({ products }: { products: HomeProduct[] }) {
  const items = products.length ? products : previews;

  return (
    <section aria-labelledby="popular-title" className="bg-white md:bg-[#f5f5f5]">
      <div className="content-container page-gutter flex flex-col gap-4 !pt-0 !pb-6 md:gap-10 md:!py-16 lg:!py-20">
        <div className="flex items-center justify-between gap-4">
          <SectionHeader id="popular-title" eyebrow="Тренди сезону" title="Популярні товари" description="Обирайте підлогу та двері для вашого дому" />
          <Link href="#categories" className="hidden items-center gap-2 text-sm font-bold text-[#e53935] hover:underline md:flex">Всі товари<HomeIcon name="arrow-red" size={16} /></Link>
        </div>
        <RandomCardGroup className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          {items.slice(0, 4).map((column, columnIndex) => (
            <VerticalCardCarousel key={column.name + column.href} label={`Товари ${columnIndex + 1}`} className="h-[310px] bg-white md:h-[320px]" slides={(items.length > 4
              ? items.filter((_, index) => index % 4 === columnIndex)
              : items.map((_, offset) => items[(columnIndex + offset) % items.length])
            ).map((product) => ({ key: product.name + product.href, content: (
            <article key={product.name + product.href} className="flex h-full min-w-0 flex-col bg-white">
              <Link href={product.href} className="group relative block h-[158px] shrink-0 overflow-hidden md:h-[180px] focus-visible:outline-2 focus-visible:outline-[#e53935]">
                <Image src={product.image} alt={product.name} fill sizes="(min-width: 1024px) 24vw, 48vw" unoptimized={product.image.startsWith("http")} className="object-cover" />
                {product.badge && <span className="absolute top-2 left-2 bg-[#e53935] px-2 py-1 text-[10px] font-bold text-white md:top-3 md:left-3 md:text-xs">{product.badge}</span>}
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-2.5 md:gap-3 md:p-4">
                <h3 className="line-clamp-2 text-xs font-medium leading-snug md:text-sm"><Link href={product.href} className="hover:text-[#e53935]">{product.name}</Link></h3>
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <p className="text-sm font-bold md:text-lg">{product.price !== null ? <><span className="text-[11px] font-normal text-[#666]">від </span>₴ {product.price.toLocaleString("uk-UA")}</> : <span className="text-[11px] font-normal text-[#666] md:text-xs">Ціну уточнюйте в каталозі</span>}</p>
                  <Link href={product.href} aria-label={`Обрати ${product.name}`} className="flex min-h-11 items-center justify-center gap-2 bg-[#e53935] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#c62828] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e53935]"><span>Обрати</span><HomeIcon name="arrow-white" size={14} /></Link>
                </div>
              </div>
            </article>
            ) }))} />
          ))}
        </RandomCardGroup>
      </div>
    </section>
  );
}
