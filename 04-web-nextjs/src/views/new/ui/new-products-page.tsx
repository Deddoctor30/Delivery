import Link from "next/link";
import { ArrowRight, Bell, PackageSearch, Sparkles } from "lucide-react";

import { getProducts } from "@/entities/product/api";
import { CartProductCard } from "@/features/cart";
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  EmptyState,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  buttonVariants,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

const PAGE_SIZE = 8;

// ─── NewProductsPage ─────────────────────────────────────────────────────────

/**
 * NewProductsPage — экран «Новинки» (async RSC).
 *
 * Данные: getProducts({ sort: "newest" }) — серверная пагинация по total.
 * Featured — самый свежий товар; сетка — страница новинок.
 *
 * Структура из Pencil-фрейма M73BRQ:
 *   1. Breadcrumbs (Главная → Новинки)
 *   2. TitleRow (заголовок + счётчик)
 *   3. Featured (hero «новинка недели» + статистика + подписка)
 *   4. NewGrid (сетка + пагинация)
 */
export async function NewProductsPage({ page = 1 }: { page?: number }) {
  const { items, total, totalPages } = await getProducts({
    sort: "newest",
    page,
    limit: PAGE_SIZE,
  });

  const featured = items[0];

  return (
    <div className="flex flex-col gap-10 py-7 pb-20">
      {/* ── 1. Breadcrumbs ──────────────────────────────────────────────── */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Новинки</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── 2. TitleRow ─────────────────────────────────────────────────── */}
      <div className="flex w-full items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-[36px] font-semibold leading-tight text-foreground">
            Новинки
          </h1>
          <span className="font-mono text-[13px] text-muted-foreground">
            {total.toLocaleString("ru-RU")} товаров в каталоге
          </span>
        </div>
      </div>

      {/* ── 3. Featured ─────────────────────────────────────────────────── */}
      {featured && (
        <div className="flex h-auto flex-col gap-4 lg:h-80 lg:flex-row">
          {/* FeatMain — hero самой свежей новинки */}
          <div className="flex flex-1 flex-col justify-between gap-5 rounded-xl bg-accent p-9">
            <div className="flex flex-col gap-3.5">
              <Badge variant="primary" className="w-fit">
                Новинка недели
              </Badge>
              <h2 className="font-heading text-[40px] font-semibold leading-[1.1] text-foreground">
                {featured.title}
              </h2>
              {featured.description && (
                <p className="line-clamp-2 max-w-prose font-sans text-[15px] leading-[1.4] text-muted-foreground">
                  {featured.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[28px] font-bold text-foreground">
                  {featured.price.toLocaleString("ru-RU")} ₽
                </span>
                {featured.oldPrice && (
                  <span className="font-mono text-xs text-muted-foreground line-through">
                    {featured.oldPrice.toLocaleString("ru-RU")} ₽
                  </span>
                )}
              </div>
              <Link
                href={`/product/${featured.id}`}
                className={cn(buttonVariants({ variant: "default", size: "lg" }), "gap-2 rounded-lg")}
              >
                Подробнее
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* FeatSide — статистика + подписка (маркетинговые блоки) */}
          <div className="flex flex-row gap-4 lg:w-85 lg:flex-col">
            <div className="flex flex-1 flex-col justify-between rounded-xl bg-card p-6">
              <div className="flex size-11 items-center justify-center rounded-md bg-secondary">
                <Sparkles className="size-5 text-primary" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[26px] font-bold text-foreground">{total}</span>
                <span className="font-caption text-[13px] text-muted-foreground">
                  товаров в каталоге
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between rounded-xl bg-foreground p-6">
              <div className="flex flex-col gap-1">
                <span className="font-heading text-[16px] font-semibold text-card">
                  Узнавайте о новинках первыми
                </span>
                <span className="font-caption text-xs text-card opacity-70">
                  Письмо раз в неделю, без спама
                </span>
              </div>
              <button
                type="button"
                className="mt-3 flex items-center justify-center gap-2 rounded-md bg-card px-4.5 py-2.5 font-heading text-sm font-medium text-foreground"
              >
                <Bell className="size-4 text-foreground" />
                Подписаться
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. NewGrid ──────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <div className="flex w-full items-end justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-[26px] font-semibold text-foreground">Все новинки</h2>
            <p className="font-caption text-[13px] text-muted-foreground">
              Самые свежие поступления — сверху
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<PackageSearch className="size-20 text-muted-foreground/40" />}
            title="Пока пусто"
            description="Новинки появятся здесь, как только поступят в каталог."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((product) => (
                <CartProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  {buildPageList(page, totalPages).map((item, idx) =>
                    item === "ellipsis" ? (
                      <PaginationItem key={`ell-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink href={pageHref(item)} isActive={item === page}>
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </section>
    </div>
  );
}

/** Ссылка на страницу (на page=1 убираем параметр). */
function pageHref(page: number): string {
  return page === 1 ? "/new" : `/new?page=${page}`;
}

/** Список номеров страниц с эллипсисами (как в каталоге). */
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
