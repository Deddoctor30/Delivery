"use client";

import { AlertCircle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Граничник ошибок для сегмента /catalog.
 * Показывается при ApiError или любом необработанном исключении в CatalogPage.
 */
export default function CatalogError({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-7 text-destructive" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Не удалось загрузить каталог
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error.message ?? "Попробуйте обновить страницу или зайдите позже."}
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Попробовать снова
      </button>
    </div>
  );
}
