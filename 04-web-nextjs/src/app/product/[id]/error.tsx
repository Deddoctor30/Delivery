"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Граничник ошибок для сегмента /product/[id].
 * Показывается при ApiError или любом необработанном исключении в ProductPage.
 */
export default function ProductError({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-7 text-destructive" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Не удалось загрузить товар
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error.message ?? "Попробуйте обновить страницу или вернитесь в каталог."}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Попробовать снова
        </button>
        <Link
          href="/catalog"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          В каталог
        </Link>
      </div>
    </div>
  );
}
