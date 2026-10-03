import Link from "next/link";
import { ArrowRight, Sparkles, Truck } from "lucide-react";

import { ProductCard } from "@/entities/product";
import type { Product } from "@/entities/product";

import { HomeCategories } from "./home-categories";

// TODO: заменить на реальный API — фетч популярных товаров
const MOCK_POPULAR: Product[] = [
  {
    id: "p1",
    title: "Наушники Sound X3",
    price: 4990,
    oldPrice: 6100,
    discountPercent: 18,
    inStock: true,
  },
  {
    id: "p2",
    title: "Робот-пылесос Vac Pro",
    price: 19800,
    inStock: true,
  },
  {
    id: "p3",
    title: "Чайник Smart 1.7л",
    price: 2490,
    oldPrice: 2990,
    discountPercent: 17,
    inStock: true,
  },
  {
    id: "p4",
    title: "Кофемашина CremaOne",
    price: 32900,
    inStock: true,
  },
];

// TODO: заменить на реальный API — фетч товаров со скидкой
const MOCK_DISCOUNTED: Product[] = [
  {
    id: "d1",
    title: "Куртка Winter Pro",
    price: 6490,
    oldPrice: 9200,
    discountPercent: 29,
    inStock: true,
  },
  {
    id: "d2",
    title: "Кроссовки Run Pro",
    price: 5490,
    oldPrice: 6990,
    discountPercent: 21,
    inStock: true,
  },
  {
    id: "d3",
    title: "Книга «Эссенциализм»",
    price: 890,
    oldPrice: 1200,
    discountPercent: 26,
    inStock: true,
  },
  {
    id: "d4",
    title: "Гантели 2×8 кг",
    price: 3290,
    oldPrice: 4100,
    discountPercent: 20,
    inStock: true,
  },
];

/**
 * SectionHead — заголовок секции с подписью и навигационными стрелками.
 * Стрелки декоративные: фактический скролл/слайдер — за пределами текущего MVP.
 */
function SectionHead({ title, subtitle, href }: { title: string; subtitle: string; href: string }) {
  return (
    <div className="flex w-full items-end justify-between">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-[28px] font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Link
        href={href}
        aria-label={`Смотреть все: ${title}`}
        className="flex size-9 items-center justify-center rounded-md border border-border bg-card transition-shadow hover:shadow-sm"
      >
        <ArrowRight className="size-4 text-foreground" />
      </Link>
    </div>
  );
}

/**
 * ProductGrid — адаптивная сетка карточек товаров.
 * Pencil: gap 16, 4 колонки на десктопе.
 */
function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

/**
 * HomePage — главная страница маркетплейса.
 *
 * RSC: не содержит состояния/эффектов. Секция категорий вынесена в HomeCategories
 * (тоже RSC — Link-карточки с CSS-hover, без интерактива).
 * Данные: статические mock-константы (TODO: заменить на реальный API).
 *
 * Структура (из Pencil-фрейма qfpwd / Body l5rVYR):
 *  gap: 40px, padding: 32 170 80 170 (горизонтальные паддинги — в layout)
 *  1. HeroBento (h=340, gap=16)
 *  2. Categories (gap=20, 4-cols grid)
 *  3. Популярные (gap=20, 4-cols grid)
 *  4. Со скидкой (gap=20, 4-cols grid)
 */
export function HomePage() {
  return (
    <div className="flex flex-col gap-10 py-8 pb-20">
      {/* ── 1. HeroBento ───────────────────────────────────────────── */}
      {/* Pencil: HeroBento — горизонтальный flex, h=340, gap=16.
          HeroMain: fill, bg-primary, rounded-xl, p=40, vertical, gap=24.
          HeroSide: w=340, vertical, gap=16 (два mini-card: NewIn + FastDelivery). */}
      <section className="flex h-auto flex-col gap-4 lg:h-[340px] lg:flex-row">
        {/* HeroMain */}
        <div className="flex flex-1 flex-col justify-between gap-6 rounded-xl bg-primary p-10">
          {/* Top */}
          <div className="flex flex-col gap-4">
            {/* Pill */}
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-foreground/15 px-2.5 py-1 font-caption text-xs font-medium text-primary-foreground">
              Распродажа · до 31 мая
            </span>
            {/* H1 */}
            <h1 className="font-heading text-5xl font-semibold leading-[1.05] text-primary-foreground">
              Скидки до −40%
              <br className="hidden sm:block" /> на всё
            </h1>
            {/* Lead */}
            <p className="text-base leading-[1.4] text-primary-foreground/90">
              Тысячи товаров по сниженным ценам. Доставим завтра.
            </p>
          </div>
          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/catalog?discount=1"
              className="flex items-center gap-2 rounded-md bg-card px-6 py-3.5 font-heading text-[15px] font-semibold text-foreground transition-opacity hover:opacity-90"
            >
              Перейти к скидкам
              <ArrowRight className="size-4" />
            </Link>
            <span className="text-xs text-primary-foreground/85">
              Бесплатная доставка от 2 000 ₽
            </span>
          </div>
        </div>

        {/* HeroSide */}
        <div className="flex flex-row gap-4 lg:w-[340px] lg:flex-col">
          {/* NewIn card */}
          <div className="flex flex-1 flex-col justify-between rounded-xl bg-card p-6">
            <div className="flex size-12 items-center justify-center rounded-md bg-accent">
              <Sparkles className="size-6 text-accent-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-heading text-lg font-semibold text-foreground">
                Новые поступления
              </span>
              <span className="text-[13px] text-muted-foreground">
                612 свежих позиций за неделю
              </span>
            </div>
          </div>
          {/* FastDelivery card */}
          <div className="flex flex-1 flex-col justify-between rounded-xl bg-secondary p-6">
            <div className="flex size-12 items-center justify-center rounded-md bg-foreground">
              <Truck className="size-6 text-background" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-heading text-lg font-semibold text-foreground">
                Доставка за день
              </span>
              <span className="text-[13px] text-muted-foreground">В 240+ городах России</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Categories ──────────────────────────────────────────── */}
      {/* HomeCategories — RSC-секция с Link-карточками категорий (CSS-hover). */}
      <HomeCategories />

      {/* ── 3. Популярные ──────────────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <SectionHead
          title="Популярные"
          subtitle="Чаще всего покупают на этой неделе"
          href="/catalog?sort=popular"
        />
        <ProductGrid products={MOCK_POPULAR} />
      </section>

      {/* ── 4. Со скидкой ──────────────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <SectionHead
          title="Со скидкой"
          subtitle="Лучшие цены этой недели"
          href="/catalog?discount=1"
        />
        <ProductGrid products={MOCK_DISCOUNTED} />
      </section>
    </div>
  );
}
