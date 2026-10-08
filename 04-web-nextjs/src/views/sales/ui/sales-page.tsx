import Link from "next/link";
import {
  Baby,
  Dumbbell,
  Flame,
  Gift,
  House,
  Percent,
  Shirt,
  Smartphone,
  Sparkles,
  Truck,
} from "lucide-react";

import { ProductCard } from "@/entities/product";
import type { Product } from "@/entities/product";
import {
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
  { id: "sale-1", title: "Наушники Sound X3", price: 4990, oldPrice: 6100, discountPercent: 18, inStock: true },
  { id: "sale-2", title: "Чайник Smart 1.7л", price: 2490, oldPrice: 2990, discountPercent: 17, inStock: true },
  { id: "sale-3", title: "Часы Move 2", price: 11400, oldPrice: 13900, discountPercent: 18, inStock: true },
  { id: "sale-4", title: "Колонка Boom 5", price: 6490, oldPrice: 7200, discountPercent: 10, inStock: true },
  { id: "sale-5", title: "Робот-пылесос Vac Pro", price: 19800, oldPrice: 24900, discountPercent: 20, inStock: true },
  { id: "sale-6", title: "Фен Air Style", price: 5490, oldPrice: 7990, discountPercent: 31, inStock: true },
  { id: "sale-7", title: "Блендер Mix Pro", price: 3990, oldPrice: 4990, discountPercent: 20, inStock: true },
  { id: "sale-8", title: "Рюкзак Urban 20л", price: 2890, oldPrice: 3900, discountPercent: 26, inStock: true },
];

// ─── Категории-чипы (из Pencil: Chips row) ──────────────────────────────────

const SALE_CHIPS = [
  { id: "all", label: "Все акции", icon: Flame, active: true },
  { id: "tech", label: "Техника", icon: Smartphone, active: false },
  { id: "home", label: "Дом", icon: House, active: false },
  { id: "beauty", label: "Красота", icon: Sparkles, active: false },
  { id: "kids", label: "Детям", icon: Baby, active: false },
  { id: "sport", label: "Спорт", icon: Dumbbell, active: false },
  { id: "clothes", label: "Одежда", icon: Shirt, active: false },
] as const;

// ─── Промо-карточки (из Pencil: PromoRow) ────────────────────────────────────

const PROMO_CARDS = [
  {
    id: "tech-sale",
    bg: "bg-accent",
    iconBg: "bg-card/60",
    icon: Percent,
    iconColor: "text-primary",
    title: "−20% на технику",
    sub: "При заказе от 10 000 ₽",
  },
  {
    id: "chemistry",
    bg: "bg-secondary",
    iconBg: "bg-card/60",
    icon: Gift,
    iconColor: "text-foreground",
    title: "1 + 1 на бытовую химию",
    sub: "Второй товар в подарок",
  },
  {
    id: "delivery",
    bg: "bg-card border border-border",
    iconBg: "bg-secondary",
    icon: Truck,
    iconColor: "text-primary",
    title: "Бесплатная доставка",
    sub: "Для заказов от 2 000 ₽",
  },
] as const;

// ─── ProductGridSkeleton ─────────────────────────────────────────────────────

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-70 w-full rounded-xl" />
      ))}
    </div>
  );
}

// ─── SalesPage ───────────────────────────────────────────────────────────────

/**
 * SalesPage — экран «Акции» (RSC, mock-данные).
 *
 * Структура из Pencil-фрейма feO2M «Desktop/Акции»:
 *   1. Breadcrumbs (Главная → Акции)
 *   2. Hero (баннер bg-primary: Pill + H1 + Lead + CTA + промокод + обратный отсчёт)
 *   3. PromoRow (3 промо-карточки: −20% техника / 1+1 химия / бесплатная доставка)
 *   4. SaleGrid (заголовок + сортировка + чипы категорий + сетка 4×2 + пагинация)
 *
 * Данные: mock-заглушки внутри view — подключение реального API отдельным шагом.
 * Интерактивные части (чипы-фильтры, сортировка, обратный отсчёт) оставлены
 * декоративными для будущего wire.
 */
export function SalesPage() {
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
            <BreadcrumbPage>Акции</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── 2. Hero ─────────────────────────────────────────────────────── */}
      {/* Pencil: BHRjp — h=300, fill=$--primary, cornerRadius=$--radius-xl, padding=40, gap=32 */}
      <div className="flex h-auto min-h-75 w-full flex-col justify-between gap-8 rounded-xl bg-primary p-10 lg:flex-row">
        {/* Left — L frame */}
        <div className="flex flex-1 flex-col justify-between gap-4">
          {/* Top */}
          <div className="flex flex-col gap-3.5">
            {/* Pill */}
            <div className="flex w-fit items-center gap-1.5 rounded-full bg-primary-foreground/15 px-2.5 py-1">
              <Flame className="size-3.5 text-primary-foreground" />
              <span className="font-caption text-xs font-medium text-primary-foreground">
                Распродажа недели
              </span>
            </div>
            {/* H1 */}
            <h1 className="font-heading text-[48px] font-semibold leading-[1.05] text-primary-foreground">
              Скидки до −50% на 1&nbsp;200 товаров
            </h1>
            {/* Lead */}
            <p className="font-sans text-base leading-[1.4] text-primary-foreground opacity-90">
              Техника, товары для дома и красоты по сниженным ценам. Доставим завтра.
            </p>
          </div>
          {/* CTA */}
          <div className="flex items-center gap-3">
            {/* BtnWrap — кастомный фрейм из Pencil (не Button компонент) */}
            <Link
              href="/catalog"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "rounded-md bg-card font-heading text-base font-medium text-primary hover:bg-card/90",
              )}
            >
              Смотреть все акции
            </Link>
            {/* Sub */}
            <span className="font-caption text-xs text-primary-foreground opacity-85">
              Промокод SALE10 — ещё −10% в корзине
            </span>
          </div>
        </div>

        {/* Right — Countdown */}
        {/* Pencil: liwTH — layout=vertical, gap=12, justifyContent=center, alignItems=end */}
        <div className="flex flex-col items-end justify-center gap-3">
          <span className="font-caption text-xs font-medium text-primary-foreground opacity-85">
            До конца распродажи
          </span>
          {/* CdRow */}
          <div className="flex gap-2.5">
            {[
              { val: "02", unit: "дня" },
              { val: "14", unit: "часов" },
              { val: "36", unit: "минут" },
            ].map(({ val, unit }) => (
              <div
                key={unit}
                className="flex size-21 flex-col items-center justify-center gap-0.5 rounded-lg bg-primary-foreground/15"
              >
                <span className="font-mono text-[30px] font-bold leading-none text-primary-foreground">
                  {val}
                </span>
                <span className="font-caption text-xs text-primary-foreground opacity-85">
                  {unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. PromoRow ─────────────────────────────────────────────────── */}
      {/* Pencil: HuAmw — gap=16, fill_container */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {PROMO_CARDS.map(({ id, bg, iconBg, icon: Icon, iconColor, title, sub }) => (
          <div
            key={id}
            className={cn(
              "flex h-37.5 flex-col justify-between rounded-xl p-6",
              bg,
            )}
          >
            {/* IconWrap */}
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-md",
                iconBg,
              )}
            >
              <Icon className={cn("size-4.5", iconColor)} />
            </div>
            {/* Txt */}
            <div className="flex flex-col gap-1">
              <span className="font-heading text-[17px] font-semibold text-foreground">
                {title}
              </span>
              <span className="font-caption text-[13px] text-muted-foreground">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 4. SaleGrid ─────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        {/* Grid head */}
        <div className="flex w-full items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-[26px] font-semibold text-foreground">
              Товары со скидкой
            </h2>
            <p className="font-caption text-[13px] text-muted-foreground">
              1&nbsp;248 товаров · цены действуют до 14 июня
            </p>
          </div>
          {/* Sort — декоративный вид сортировки (future: Select компонент) */}
          <span className="hidden items-center gap-2 rounded-md border border-input bg-card px-3 py-2 font-sans text-sm text-foreground md:flex">
            Сначала с большей скидкой
          </span>
        </div>

        {/* Chips — категории-фильтры */}
        <div className="flex flex-wrap items-center gap-2">
          {SALE_CHIPS.map(({ id, label, icon: Icon, active }) => (
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
              <Icon
                className={cn(
                  "size-3.5 shrink-0",
                  active ? "text-primary-foreground" : "text-muted-foreground",
                )}
              />
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
              <PaginationLink href="/sales?page=1" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/sales?page=2">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/sales?page=3">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/sales?page=12">12</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>
    </div>
  );
}
