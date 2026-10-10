import { Skeleton } from "@/shared/ui";

/**
 * Скелетон для сегмента /catalog — показывается пока CatalogPage загружается.
 */
export default function CatalogLoading() {
  return (
    <div className="flex flex-col gap-6 py-7 pb-20">
      <Skeleton className="h-5 w-48 rounded" />
      <Skeleton className="h-10 w-full rounded-full" />
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-9 w-40 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <Skeleton className="h-10 w-50 rounded-md" />
      </div>
      <div className="flex gap-6">
        <Skeleton className="hidden h-96 w-70 rounded-xl lg:block" />
        <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-70 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
