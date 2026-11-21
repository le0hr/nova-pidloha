/** Grey placeholder with a soft shimmer (globals.css .skeleton), shown while a page loads. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`skeleton block ${className}`} />;
}

/** Breadcrumb line, title and a grid of product cards: catalog, category and search pages. */
export function CatalogSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div role="status" aria-label="Завантаження" className="flex min-h-screen flex-col bg-white">
      <div className="content-container page-gutter flex flex-col gap-4 !pb-4 md:gap-6">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-8 w-64 md:h-10" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-24 w-36 shrink-0 md:h-28 md:w-44" />)}
        </div>
        <div className="catalog-grid grid w-full grid-cols-2 gap-4">
          {Array.from({ length: cards }, (_, i) => (
            <div key={i} className="flex flex-col border border-[#eeeeee]">
              <Skeleton className="catalog-card-image h-[220px] w-full md:h-[420px]" />
              <div className="flex flex-col gap-2 p-[14px]">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="mt-3 h-5 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Завантаження…</span>
    </div>
  );
}
