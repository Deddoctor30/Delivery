import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Dumbbell,
  Gamepad2,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
} from "lucide-react";

import { ProductCard } from "@/entities/product";
import type { Product } from "@/entities/product";
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  Skeleton,
  buttonVariants,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

// ─── Mock данные (placeholder до подключения API) ────────────────────────────

const MOCK_PRODUCTS: Product[] = [
  { id: "new-1", title: "Смартфон Pixel 9", price: 58900, inStock: true },
  { id: "new-2", title: "Планшет Slate 11", price: 36400, inStock: true },
  { id: "new-3", title: "Ноутбук Air 14", price: 74900, inStock: true },
  { id: "new-4", title: "Часы Move 3", price: 13900, inStock: true },
  { id: "new-5", title: "Наушники Sound X4", price: 5490, inStock: true },
  { id: "new-6", title: "Кофемашина CremaTwo", price: 38900, inStock: true },
  { id: "new-7", title: "Пылесос Vac Air", price: 22400, inStock: true },
  { id: "new-8", title: "Лампа Glow Mini", price: 1990, inStock: true },
];

// ─── Категории-чипы (из Pencil: Chips row) ──────────────────────────────────

const CATEGORY_CHIPS = [
  { id: "all", label: "Все новинки", icon: Sparkles, active: true },
  { id: "tech", label: "Техника", icon: Smartphone, active: false },
  { id: "home", label: "Дом", icon: Sofa, active: false },
  { id: "beauty", label: "Красота", icon: Sparkles, active: false },
  { id: "clothes", label: "Одежда", icon: Shirt, active: false },
  { id: "sport", label: "Спорт", icon: Dumbbell, active: false },
  { id: "hobby", label: "Хобби", icon: Gamepad2, active: false },
] as const;

// ─── ProductGridSkeleton ─────────────────────────────────────────────────────

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-70 w-full rounded-xl" />
      ))}
    </div>
  );
}

// ─── NewProductsPage ─────────────────────────────────────────────────────────

/**
 * NewProductsPage — экран «Новинки» (RSC, mock-данные).
 *
 * Структура из Pencil-фрейма M73BRQ «Desktop/Новинки»:
 *   1. Breadcrumbs (Главная → Новинки)
 *   2. TitleRow (заголовок 36px + счётчик + сортировка)
 *   3. Featured (hero-баннер + статистика + подписка)
 *   4. NewGrid (заголовок + чипы категорий + сетка 4×2 + пагинация)
 *
 * Данные: mock-заглушки внутри view — подключение реального API отдельным шагом.
 */
export function NewProductsPage() {
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
            132 товара появились за последние 30 дней
          </span>
        </div>
        {/* Sort — клиентский Select здесь не нужен, декоративный вид сортировки */}
        <span className="hidden items-center gap-2 rounded-md border border-input bg-card px-3 py-2 font-sans text-sm text-foreground md:flex">
          Сначала новые
        </span>
      </div>

      {/* ── 3. Featured ─────────────────────────────────────────────────── */}
      {/* Pencil: Featured row h=320, gap=16: FeatMain (fill, accent, xl) + FeatSide (w=340) */}
      <div className="flex h-auto flex-col gap-4 lg:h-[320px] lg:flex-row">
        {/* FeatMain — hero-карточка новинки недели */}
        <div className="flex flex-1 flex-col justify-between gap-5 rounded-xl bg-accent p-9">
          {/* Top */}
          <div className="flex flex-col gap-3.5">
            <Badge variant="primary" className="w-fit">
              Новинка недели
            </Badge>
            <h2 className="font-heading text-[40px] font-semibold leading-[1.1] text-foreground">
              Смартфон Pixel 9
            </h2>
            <p className="max-w-prose font-sans text-[15px] leading-[1.4] text-muted-foreground">
              Матрица 120 Гц, камера 50 Мп и двое суток автономной работы. Первая партия уже на
              складе.
            </p>
          </div>
          {/* Bottom */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[28px] font-bold text-foreground">58 900 ₽</span>
              <span className="font-caption text-xs text-muted-foreground">
                или 4 908 ₽ × 12 месяцев
              </span>
            </div>
            <Link
              href="/product/new-1"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "gap-2 rounded-lg",
              )}
            >
              Подробнее
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* FeatSide — два мини-карточки: статистика + подписка */}
        <div className="flex flex-row gap-4 lg:w-[340px] lg:flex-col">
          {/* WeekCard — статистика новинок */}
          <div className="flex flex-1 flex-col justify-between rounded-xl bg-card p-6">
            <div className="flex size-11 items-center justify-center rounded-md bg-secondary">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[26px] font-bold text-foreground">+42</span>
              <span className="font-caption text-[13px] text-muted-foreground">
                новинки за последнюю неделю
              </span>
            </div>
          </div>

          {/* SubscribeCard — тёмная карточка подписки */}
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
              className="mt-3 flex items-center justify-center gap-2 rounded-md bg-card px-[18px] py-[10px] font-heading text-sm font-medium text-foreground"
            >
              <Bell className="size-4 text-foreground" />
              Подписаться
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. NewGrid ──────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        {/* Grid head */}
        <div className="flex w-full items-end justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-[26px] font-semibold text-foreground">
              Все новинки
            </h2>
            <p className="font-caption text-[13px] text-muted-foreground">
              Обновляем каталог каждый четверг
            </p>
          </div>
        </div>

        {/* Chips — категории-фильтры */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORY_CHIPS.map(({ id, label, icon: Icon, active }) => (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors select-none",
                active
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-border bg-card text-foreground hover:bg-secondary",
              )}
            >
              <Icon className={cn("size-3.5 shrink-0", active ? "text-primary-foreground" : "text-muted-foreground")} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Pagination */}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/new?page=1" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/new?page=2">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/new?page=3">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/new?page=9">9</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>
    </div>
  );
}

export { ProductGridSkeleton };
