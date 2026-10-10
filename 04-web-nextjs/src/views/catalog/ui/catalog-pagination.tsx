"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui";

interface CatalogPaginationProps {
  totalPages: number;
  currentPage: number;
}

/**
 * CatalogPagination — client-остров.
 * Пагинация через URL: ?page=... Не изменяет другие query-параметры.
 *
 * Pencil: Pagination frame, gap: 6, justifyContent: center.
 * Кнопки Prev/Next с иконками chevron-left/right из lucide.
 */
export function CatalogPagination({ totalPages, currentPage }: CatalogPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildHref(page: number): string {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function handleNav(page: number) {
    router.push(buildHref(page));
  }

  if (totalPages <= 1) return null;

  const pages = buildPageList(currentPage, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text="Назад"
            href={buildHref(Math.max(1, currentPage - 1))}
            aria-disabled={currentPage === 1}
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) handleNav(currentPage - 1);
            }}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {pages.map((item, idx) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ell-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href={buildHref(item)}
                isActive={item === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item);
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            text="Вперёд"
            href={buildHref(Math.min(totalPages, currentPage + 1))}
            aria-disabled={currentPage === totalPages}
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) handleNav(currentPage + 1);
            }}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

/** Строит список номеров страниц с эллипсисами. */
function buildPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("ellipsis");

  pages.push(total);
  return pages;
}
