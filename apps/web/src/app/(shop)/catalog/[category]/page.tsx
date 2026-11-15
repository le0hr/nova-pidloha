import { getProducts } from "@/lib/services/catalog.service";
import { getCatalogContext } from "@/lib/services/catalog-page.service";
import Filters from "@/components/catalog/Filters";
import SubclassSelector from "@/components/catalog/SubclassSelector";
import Total from "@/components/catalog/Total";
import CatalogGrid from "@/components/catalog/CatalogGrid";
import SortDropdown from "@/components/catalog/SortDropdown";
import ActiveFilters from "@/components/catalog/ActiveFilters";
import MobileFilterButton from "@/components/catalog/MobileFilterButton";
import { FilterDrawerProvider } from "@/components/catalog/FilterDrawerContext";
import Pagination from "@/components/catalog/Pagination";
import Breadcrumb from "@/components/layout/shop/Breadcrumps";
import { categoryHref } from "@/lib/catalog/categories";
import { notFound, redirect } from "next/navigation";
export default async function CatalogPage({
    params,
    searchParams,
  }: {
    params: Promise<{
      category: string;
    }>;
    searchParams: Promise<
      Record<string, string | string[] | undefined>
    >;
  }) {
  const {category } = await params;
  const query = await searchParams;

  const context = await getCatalogContext(category);
  if (!context) notFound();
  const { categories, current, scope, ancestors, filters } = context;
  const { products, pagination } = await getProducts(query, filters, scope);
  if (pagination.page > Math.max(1, pagination.pageCount)) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (key !== "page") for (const item of Array.isArray(value) ? value : value ? [value] : []) params.append(key, item);
    }
    redirect(`/catalog/${encodeURIComponent(category)}${params.size ? `?${params}` : ""}`);
  }
  return (
    <FilterDrawerProvider key={`${category}:${JSON.stringify(query)}`} filterGroups={filters}>
      <div className="catalog-page flex min-h-screen flex-col bg-white font-['Outfit',sans-serif]">
        
        <Breadcrumb items={[
          { label: "Головна", href: "/" },
          ...ancestors.map(item => ({ label: item.name, href: categoryHref(item.slug) })),
          { label: current.name },
        ]} />
      
        {/*  Main content  */}
        <div className="content-container catalog-content page-gutter flex flex-col gap-[16px] md:gap-[24px]">
          
          {/* Title */}
          <div
            className="flex items-baseline justify-between animate-fade-up"
            style={{ animationDelay: "0.06s" }}
          >
            <div className="flex items-baseline gap-[12px] md:gap-[16px]">
              <h1 className="catalog-title font-outfit text-[24px] md:text-[32px] font-bold text-[#1A1A1A]">
                {current.name}
              </h1>
              <Total count={String(pagination.total)} />
            </div>

            <div className="hidden xl:block">
              <SortDropdown />
            </div>
          </div>

          <SubclassSelector categories={categories} current={current} />

          {/* Mobile filter + sort */}
          <div className="flex xl:hidden items-center gap-[8px]">
            <MobileFilterButton />
            <div className="flex-1">
              <SortDropdown mobile />
            </div>
          </div>

          <div className="flex items-start gap-8 self-stretch">
            {/* Desktop sidebar */}
            <div
              className="catalog-filter-wrap relative z-20 hidden w-[300px] xl:block shrink-0 animate-fade-up"
              style={{ animationDelay: "0.12s" }}
            >
              <Filters />
            </div>

            <div className="flex flex-1 flex-col items-start gap-10 min-w-0">
              <ActiveFilters />

              <CatalogGrid key={`${category}:${JSON.stringify(query)}`} category={category} products={products} pagination={pagination} />
              {products.length === 0 && <p role="status">У цій категорії немає товарів за вибраними параметрами.</p>}
              <Pagination lastPage={pagination.pageCount}/>
            </div>
          </div>
        </div>
      </div>
    </FilterDrawerProvider> 
  );
}
