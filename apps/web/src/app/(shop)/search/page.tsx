import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/layout/shop/Breadcrumps";
import Card from "@/components/catalog/Card";
import Pagination from "@/components/catalog/Pagination";
import SearchBox from "@/components/layout/shop/SearchBox";
import { pageNumber } from "@/lib/catalog/state";
import { searchProducts } from "@/lib/services/search.service";

type SearchPageProps = { searchParams: Promise<{ q?: string | string[]; page?: string | string[] }> };
const text = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value ?? "").trim().slice(0, 100);

// Search results are not indexed (endless combinations); links on them are followed.
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const q = text((await searchParams).q);
  return { title: q ? `Пошук: ${q}` : "Пошук", robots: { index: false, follow: true } };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = text(params.q);
  const { products, pagination } = await searchProducts(q, pageNumber(params.page));
  return (
    <div className="flex flex-col bg-white font-['Outfit',sans-serif]">
      <Breadcrumb items={[{ label: "Головна", href: "/" }, { label: "Пошук" }]} />
      <div className="content-container page-gutter flex flex-col gap-6 pb-16">
        <div className="flex flex-col gap-4">
          <h1 className="text-[24px] font-bold text-[#1a1a1a] md:text-[32px]">
            {q ? <>Результати для «{q}»</> : "Пошук по каталогу"}
          </h1>
          <div className="max-w-[640px]"><SearchBox initialQuery={q} variant="page" /></div>
          {q && <p role="status" className="text-sm text-[#666]">
            {pagination.total ? `Знайдено товарів: ${pagination.total}` : "Нічого не знайдено. Спробуйте іншу назву, бренд або колір."}
          </p>}
        </div>
        {products.length > 0 && (
          <div className="catalog-grid grid w-full grid-cols-2 gap-4">
            {products.map((product, index) => <Card key={product.slug} product={product} index={index % 8} />)}
          </div>
        )}
        <Pagination lastPage={pagination.pageCount} />
        {q && !pagination.total && (
          <div className="flex flex-wrap gap-3">
            <Link href="/catalog" className="flex h-[44px] items-center bg-[#e53935] px-5 font-bold text-white hover:bg-[#c62828]">Переглянути каталог</Link>
            <Link href="/#contacts" className="flex h-[44px] items-center border border-[#1a1a1a] px-5 font-semibold text-[#1a1a1a] hover:bg-[#f7f7f7]">Запитати в магазині</Link>
          </div>
        )}
      </div>
    </div>
  );
}
