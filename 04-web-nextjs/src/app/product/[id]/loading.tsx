import { Skeleton } from "@/shared/ui";

/**
 * Скелетон для сегмента /product/[id] — показывается пока ProductPage загружается.
 */
export default function ProductLoading() {
  return (
    <div className="flex flex-col gap-10 py-7 pb-20">
      <Skeleton className="h-5 w-64 rounded" />
      <div className="flex flex-col gap-8 lg:flex-row">
        <Skeleton className="aspect-square w-full rounded-xl lg:flex-1" />
        <div className="flex w-full flex-col gap-5 lg:w-110 lg:shrink-0">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-9 w-3/4 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-36 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-70 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
