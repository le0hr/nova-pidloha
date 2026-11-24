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
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { pageNumber, type CatalogParams } from "@/lib/catalog/state";
import { SEO_FIELDS, breadcrumbLd, clip, cmsStructuredData, fetchSeo, mediaUrlOrUndefined, pageMetadata, plainText } from "@/lib/seo";

type CatalogPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<CatalogParams>;
};

const categorySeo = (slug: string) => fetchSeo(
  `query CategorySeo($slug: String!) { categories(status: PUBLISHED, filters: {slug: {eq: $slug}}) { ${SEO_FIELDS} } }`,
  { slug }, data => data.categories?.[0]?.seo,
);

/** Filters and sorting only reshuffle the category: such URLs are not indexed, the canonical is the clean page. */
const isFiltered = (query: CatalogParams) => Object.entries(query).some(([key, value]) => key !== "page" && value !== undefined && value !== "");

export async function generateMetadata({ params, searchParams }: CatalogPageProps): Promise<Metadata> {
  const { category } = await params;
  const query = await searchParams;
  const [context, seo] = await Promise.all([getCatalogContext(category), categorySeo(category)]);
  if (!context) return { title: "Категорію не знайдено", robots: { index: false } };
  const { current, categories, scope } = context;
  const page = pageNumber(query.page);
  const count = categories.filter(item => scope.includes(item.slug)).reduce((sum, item) => sum + (item.productCount ?? 0), 0);
  const subcategories = categories.filter(item => item.parent?.documentId === current.documentId).map(item => item.name);
  const about = plainText(current.description);
  const metadata = pageMetadata({
    title: `${current.name} — купити в Черкасах, ціни`,
    description: about
      ? clip(about, 160)
      : [`${current.name} у Черкасах${count ? `: ${count} товарів у каталозі` : ""}`,
        subcategories.length ? clip(subcategories.join(", "), 70) : "",
        "Актуальні ціни, консультація у виставкових залах, доставка по Україні"].filter(Boolean).join(". "),
    path: `${categoryHref(current.slug)}${page > 1 ? `?page=${page}` : ""}`,
    image: mediaUrlOrUndefined(current.image?.url),
    robots: isFiltered(query) ? { index: false, follow: true } : undefined,
  }, seo);
  if (page > 1) metadata.title = `${String(metadata.title)} — сторінка ${page}`;
  // A filtered page points to the clean category, not to itself.
  if (isFiltered(query)) metadata.alternates = { canonical: categoryHref(current.slug) };
  return metadata;
}

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
  const seo = await categorySeo(category);

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
        <JsonLd data={[
          breadcrumbLd([
            { name: "Головна", path: "/" },
            ...ancestors.map(item => ({ name: item.name, path: categoryHref(item.slug) })),
            { name: current.name },
          ]),
          ...cmsStructuredData(seo),
        ]} />

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
          {/* Category text from the CMS (Category → description): unique content for search, only on the clean first page. */}
          {current.description && pagination.page === 1 && !isFiltered(query) && (
            <section className="catalog-seo-text max-w-[860px] text-fs15 leading-[1.6] text-[#555] pb-10">
              {String(current.description).split(/\n\s*\n/).map(plainText).filter(Boolean).map((paragraph, index) => (
                <p key={index} className="mb-3">{paragraph}</p>
              ))}
            </section>
          )}
        </div>
      </div>
    </FilterDrawerProvider> 
  );
}
