import { Skeleton } from "@/shared/ui";

/** Skeleton-заглушка строки пользователя — повторяет структуру реальной строки. */
function UserRowSkeleton() {
  return (
    <div className="flex w-full items-center gap-4 px-5 py-3">
      {/* TD User */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3.5 w-32 rounded-sm" />
          <Skeleton className="h-2.5 w-14 rounded-sm" />
        </div>
      </div>
      {/* TD Email */}
      <div className="w-[320px]">
        <Skeleton className="h-3.5 w-44 rounded-sm" />
      </div>
      {/* TD Role */}
      <div className="w-35">
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      {/* TD Date */}
      <div className="w-45">
        <Skeleton className="h-3.5 w-28 rounded-sm" />
      </div>
      {/* TD Arrow */}
      <div className="w-10" />
    </div>
  );
}

/** Полный skeleton таблицы: шапка + N строк + разделители. */
export function UsersTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex w-full items-center gap-4 bg-secondary px-5 py-3">
        <div className="flex-1">
          <Skeleton className="h-3 w-24 rounded-sm" />
        </div>
        <div className="w-[320px]">
          <Skeleton className="h-3 w-10 rounded-sm" />
        </div>
        <div className="w-35">
          <Skeleton className="h-3 w-10 rounded-sm" />
        </div>
        <div className="w-45">
          <Skeleton className="h-3 w-24 rounded-sm" />
        </div>
        <div className="w-10" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i}>
          <div className="h-px w-full bg-border" />
          <UserRowSkeleton />
        </div>
      ))}

      {/* Footer */}
      <div className="h-px w-full bg-border" />
      <div className="flex w-full items-center justify-between px-5 py-3.5">
        <Skeleton className="h-3 w-36 rounded-sm" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-40 rounded-md" />
          <Skeleton className="h-8 w-40 rounded-md" />
        </div>
      </div>
    </div>
  );
}
