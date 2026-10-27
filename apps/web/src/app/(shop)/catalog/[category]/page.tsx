import { getFilters, getProducts } from "@/lib/services/catalog.service";
import Filters from "@/components/catalog/Filters";
import SubclassSelector from "@/components/catalog/SubclassSelector";
import Total from "@/components/catalog/Total";
import Card from "@/components/catalog/Card";
import SortDropdown from "@/components/catalog/SortDropdown";
import ActiveFilters from "@/components/catalog/ActiveFilters";
import MobileFilterButton from "@/components/catalog/MobileFilterButton";
import { FilterDrawerProvider } from "@/components/catalog/FilterDrawerContext";
import { CatalogProduct } from "@/types/catalog";
import Pagination from "@/components/catalog/Pagination";
import Breadcrumb from "@/components/layout/shop/Breadcrumps";
import { getCategories } from "@/lib/services/category.service";
import { categoryScope, categoryAncestors, categoryHref } from "@/lib/catalog/categories";
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

  const categories = await getCategories();
  const current = categories.find(item => item.slug === category);
  if (!current) notFound();
  const scope = categoryScope(categories, current).map(item => item.slug);
  const ancestors = categoryAncestors(categories, current);
  const filters = await getFilters([...new Set([...scope, ...ancestors.map(item => item.slug)])], scope);
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
              className="catalog-filter-wrap hidden w-[300px] xl:block shrink-0 animate-fade-up"
              style={{ animationDelay: "0.12s" }}
            >
              <Filters />
            </div>

            <div className="flex flex-1 flex-col items-start gap-10 min-w-0">
              <ActiveFilters />

              <div className="catalog-grid grid grid-cols-2 gap-4 w-full">
                {products.map((product: CatalogProduct, i: number) => (
                  <Card key={product.slug ?? i} product={product} index={i} />
                ))}
              </div>
              {products.length === 0 && <p role="status">У цій категорії немає товарів за вибраними параметрами.</p>}
              <Pagination lastPage={pagination.pageCount}/>
            </div>
          </div>
        </div>
      </div>
    </FilterDrawerProvider> 
  );
}
