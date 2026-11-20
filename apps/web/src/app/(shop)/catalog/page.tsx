import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/layout/shop/Breadcrumps";
import { categoryHref, categoryImage, categoryTotal, flatSubcategories } from "@/lib/catalog/categories";
import { getCategories } from "@/lib/services/category.service";

export const metadata: Metadata = {
  title: "Каталог — підлога, двері, фурнітура",
  description: "Каталог Нова Підлога та Двері: ламінат, SPC і вінілова підлога, міжкімнатні та вхідні двері, дверна фурнітура. Черкаси, доставка по Україні.",
  alternates: { canonical: "/catalog" },
};

/** All product classes with their subcategories (the cart's "До каталогу" leads here). */
export default async function CatalogIndexPage() {
  const categories = await getCategories();
  const roots = categories
    .filter(category => !category.parent && categoryTotal(categories, category) > 0)
    .sort((a, b) => categoryTotal(categories, b) - categoryTotal(categories, a));
  return (
    <div className="flex flex-col bg-white font-['Outfit',sans-serif]">
      <Breadcrumb items={[{ label: "Головна", href: "/" }, { label: "Каталог" }]} />
      <div className="content-container page-gutter flex flex-col gap-8 pb-16">
        <h1 className="text-[24px] font-bold text-[#1a1a1a] md:text-[32px]">Каталог</h1>
        {roots.map(root => {
          const children = flatSubcategories(categories, root).filter(category => categoryTotal(categories, category) > 0);
          return (
            <section key={root.documentId} aria-labelledby={`cat-${root.slug}`} className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between gap-4">
                <h2 id={`cat-${root.slug}`} className="text-[20px] font-bold text-[#1a1a1a] md:text-[24px]">{root.name}</h2>
                <Link href={categoryHref(root.slug)} className="shrink-0 text-sm font-semibold text-[#e53935] hover:underline">Усі товари →</Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">
                {(children.length ? children : [root]).map(category => (
                  <Link key={category.documentId} href={categoryHref(category.slug)}
                    className="group overflow-hidden border border-[#e0e0e0] bg-white transition-colors hover:border-[#e53935] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#e53935]">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f5f5]">
                      <Image src={categoryImage(category, categories)} alt="" fill unoptimized sizes="(min-width: 1024px) 20vw, 50vw"
                        className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105" />
                    </div>
                    <div className="flex min-h-12 items-center justify-between gap-2 px-3 py-2 text-sm font-semibold text-[#1a1a1a] group-hover:text-[#e53935]">
                      <span>{category.name}</span>
                      <span className="shrink-0 text-xs font-normal text-[#9e9e9e]">{categoryTotal(categories, category)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
