import { Skeleton } from "@/components/layout/shop/Skeleton";

/** Gallery on the left, configurator on the right, as on the product page. */
export default function Loading() {
  return (
    <div role="status" aria-label="Завантаження" className="content-container page-gutter flex flex-col gap-6 bg-white">
      <Skeleton className="h-3 w-56" />
      <div className="grid grid-cols-1 items-start gap-8 md:gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col gap-3">
          <Skeleton className="aspect-[4/5] w-full md:aspect-square" />
          <div className="flex gap-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="size-16 shrink-0 md:size-20" />)}</div>
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4 md:h-10" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-4 h-4 w-28" />
          <div className="grid grid-cols-5 gap-2">{Array.from({ length: 10 }, (_, i) => <Skeleton key={i} className="aspect-square w-full" />)}</div>
          <Skeleton className="mt-4 h-11 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
      <span className="sr-only">Завантаження…</span>
    </div>
  );
}
