import { Shield, Truck, RefreshCcw, Star } from "lucide-react";

import type { Product } from "@/entities/product";
import { ProductCard, getSimilarProducts } from "@/entities/product";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/shared/ui";

import { ProductGallery } from "./product-gallery";
import { ProductBuyBlock } from "./product-buy-block";

export interface ProductPageProps {
  product: Product;
}

/**
 * ProductPage — экран карточки товара (async RSC).
 *
 * Из Pencil-фрейма p9B5ZP / Body D5nEvM:
 *   layout: vertical, gap: 40, padding: [28, 170, 80, 170]
 *   (горизонтальные отступы — в layout.tsx через max-w-[1328px] + px-4)
 *
 * Структура:
 *   1. Breadcrumbs — Главная / Каталог / Электроника / <название>
 *   2. Cols — Gallery (fill_container) + Info (w=440)
 *   3. DetailsTabs — Описание / Характеристики / Отзывы / Вопросы
 *   4. Similar — сетка 4 колонки ProductCard (из бэкенда)
 */
export async function ProductPage({ product }: ProductPageProps) {
  const {
    title,
    price,
    oldPrice,
    discountPercent,
    inStock = true,
    images = [],
    description,
    specs = [],
    rating,
    reviewsCount,
    brand,
  } = product;

  const similar = await getSimilarProducts({ id: product.id, category: product.category });

  const savingAmount = oldPrice ? oldPrice - price : undefined;

  const discountLabel = discountPercent ? `−${discountPercent}%` : undefined;

  // Полные звёзды из рейтинга (0–5)
  const fullStars = rating ? Math.round(rating) : 0;

  return (
    <div className="flex flex-col gap-10 py-7 pb-20">
      {/* ── 1. Breadcrumbs ──────────────────────────────────────────── */}
      {/* Pencil: qswjo Breadcrumbs, alignItems=center, gap=8 */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/catalog">Каталог</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/catalog?category=electronics">Электроника</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── 2. Cols: Gallery + Info ─────────────────────────────────── */}
      {/* Pencil: vAWIh Cols, gap=32, horizontal */}
      <div className="flex w-full flex-col gap-8 lg:flex-row lg:gap-8">
        {/* Gallery — client-остров, fill_container */}
        {/* Pencil: tpXgO Gallery, layout=vertical, gap=12 */}
        <div className="w-full lg:flex-1">
          <ProductGallery images={images} title={title} discountLabel={discountLabel} />
        </div>

        {/* Info — w=440 в Pencil, на десктопе фиксированная ширина */}
        {/* Pencil: xotxW Info, w=440, layout=vertical, gap=24 */}
        <div className="flex w-full flex-col gap-6 lg:w-110 lg:shrink-0">
          {/* InStock badge */}
          {/* Pencil: InStock — Label/Success «В наличии · 240 шт» */}
          {inStock ? (
            <Badge variant="success">В наличии</Badge>
          ) : (
            <Badge variant="error">Нет в наличии</Badge>
          )}

          {/* Title */}
          {/* Pencil: Title font-heading 32px 600, fill=$--foreground, lineHeight=1.15 */}
          <h1 className="font-heading text-[32px] font-semibold leading-[1.15] text-foreground">
            {title}
          </h1>

          {/* Brand (если есть) */}
          {brand && (
            <p className="text-sm text-muted-foreground">
              Бренд: <span className="font-medium text-foreground">{brand}</span>
            </p>
          )}

          {/* Rating */}
          {/* Pencil: QziaB Rating, gap=10, alignItems=center */}
          {rating !== undefined && (
            <div className="flex items-center gap-2.5">
              {/* Stars */}
              {/* Pencil: Stars gap=2, иконки 16×16, заполненные $--color-warning-foreground */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${i < fullStars ? "fill-warning-foreground text-warning-foreground" : "fill-muted text-muted-foreground"}`}
                  />
                ))}
              </div>
              {/* Score */}
              {/* Pencil: Score font-mono 14px 600 */}
              <span className="font-mono text-sm font-semibold text-foreground">{rating}</span>
              {/* Reviews */}
              {/* Pencil: Reviews font-body 13px muted-foreground */}
              {reviewsCount !== undefined && (
                <span className="text-[13px] text-muted-foreground">
                  · {reviewsCount.toLocaleString("ru-RU")} отзывов
                </span>
              )}
            </div>
          )}

          {/* PriceCard — client-остров ProductBuyBlock */}
          {/* Pencil: rOtpz PriceCard bg=$--card rounded-xl p=24 gap=16 */}
          <ProductBuyBlock
            price={price}
            oldPrice={oldPrice}
            discountPercent={discountPercent}
            savingAmount={savingAmount}
            inStock={inStock}
          />

          {/* Benefits */}
          {/* Pencil: rhzct Benefits bg=$--card rounded-xl p=24 gap=16 */}
          <div className="flex flex-col gap-4 rounded-xl bg-card p-6">
            {/* Доставка завтра */}
            {/* Pencil: b8jZw gap=12, Icon 36×36 bg=$--secondary rounded-md */}
            <div className="flex gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                <Truck className="size-4.5 text-foreground" />
              </div>
              <div className="flex flex-col gap-0.5">
                {/* Pencil: T font-heading 13px 600 */}
                <span className="font-heading text-[13px] font-semibold text-foreground">
                  Доставка завтра
                </span>
                {/* Pencil: D font-body 12px muted-foreground */}
                <span className="text-xs text-muted-foreground">
                  Бесплатно от 2 000 ₽ · до 20:00
                </span>
              </div>
            </div>

            {/* Возврат 14 дней */}
            <div className="flex gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                <RefreshCcw className="size-4.5 text-foreground" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-[13px] font-semibold text-foreground">
                  Возврат 14 дней
                </span>
                <span className="text-xs text-muted-foreground">Без объяснения причин</span>
              </div>
            </div>

            {/* Гарантия 2 года */}
            <div className="flex gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                <Shield className="size-4.5 text-foreground" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-[13px] font-semibold text-foreground">
                  Гарантия 2 года
                </span>
                <span className="text-xs text-muted-foreground">Сервис в 80 городах</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. DetailsTabs ──────────────────────────────────────────── */}
      {/* Pencil: A4bEy DetailsTabs bg=$--card rounded-xl p=32 gap=24 */}
      {/* Tabs — client-компонент из shared/ui (base-ui/react/tabs) */}
      <div className="w-full rounded-xl bg-card p-8">
        <Tabs defaultValue="description">
          {/* Pencil: a5iN17 TabsRow bg=$--secondary rounded-md gap=4 p=4 */}
          <TabsList variant="default">
            <TabsTrigger value="description">Описание</TabsTrigger>
            <TabsTrigger value="specs">Характеристики</TabsTrigger>
            <TabsTrigger value="reviews">
              Отзывы {reviewsCount ? `· ${reviewsCount.toLocaleString("ru-RU")}` : ""}
            </TabsTrigger>
            <TabsTrigger value="qa">Вопросы</TabsTrigger>
          </TabsList>

          {/* Описание */}
          {/* Pencil: K2yToJ DescCols gap=48, Text (fill) + SpecsCard (w=320) */}
          <TabsContent value="description">
            <div className="flex flex-col gap-12 pt-6 lg:flex-row">
              {/* Текст описания */}
              {/* Pencil: Oiogk Text layout=vertical gap=12 */}
              <div className="flex flex-1 flex-col gap-3">
                {description ? (
                  <p className="text-[15px] leading-[1.6] text-foreground">{description}</p>
                ) : (
                  <>
                    {/* Pencil: P1, P2 — font-body 15px lineHeight=1.6 */}
                    <p className="text-[15px] leading-[1.6] text-foreground">
                      {title} — качественный товар с отличными характеристиками. Подходит для
                      ежедневного использования, обеспечивает надёжную работу и долгий срок службы.
                    </p>
                    <p className="text-[15px] leading-[1.6] text-foreground">
                      Современные технологии и тщательный контроль качества делают этот товар
                      отличным выбором как для профессионального, так и для личного использования.
                    </p>
                  </>
                )}
              </div>

              {/* Ключевые характеристики (sidebar в описании) */}
              {/* Pencil: i7l2M SpecsCard w=320 bg=$--background rounded-lg p=24 gap=14 */}
              {specs.length > 0 && (
                <div className="flex w-full flex-col gap-3.5 rounded-lg bg-background p-6 lg:w-[320px] lg:shrink-0">
                  {/* Pencil: f90UoB T font-heading 14px 600 */}
                  <span className="font-heading text-sm font-semibold text-foreground">
                    Ключевые характеристики
                  </span>
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex items-center justify-between">
                      {/* Pencil: K font-body 13px muted-foreground */}
                      <span className="text-[13px] text-muted-foreground">{spec.label}</span>
                      {/* Pencil: V font-mono 13px 500 foreground */}
                      <span className="font-mono text-[13px] font-medium text-foreground">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Характеристики */}
          <TabsContent value="specs">
            <div className="pt-6">
              {specs.length > 0 ? (
                <div className="flex flex-col divide-y divide-border">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex items-center gap-4 py-3">
                      <span className="w-1/2 text-[13px] text-muted-foreground">{spec.label}</span>
                      <span className="font-mono text-[13px] font-medium text-foreground">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Характеристики не указаны.</p>
              )}
            </div>
          </TabsContent>

          {/* Отзывы */}
          <TabsContent value="reviews">
            <div className="pt-6">
              <p className="text-sm text-muted-foreground">
                {reviewsCount
                  ? `${reviewsCount.toLocaleString("ru-RU")} отзывов. Раздел в разработке.`
                  : "Отзывов пока нет."}
              </p>
            </div>
          </TabsContent>

          {/* Вопросы */}
          <TabsContent value="qa">
            <div className="pt-6">
              <p className="text-sm text-muted-foreground">Вопросов пока нет.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── 4. Similar ──────────────────────────────────────────────── */}
      {/* Pencil: F5wNdt Similar layout=vertical gap=20 */}
      {similar.length > 0 && (
        <section className="flex flex-col gap-5">
          {/* Pencil: VbaVJ Head justifyContent=space_between alignItems=end */}
          <div className="flex w-full items-end justify-between">
            <div className="flex flex-col gap-1">
              {/* Pencil: T font-heading 24px 600 */}
              <h2 className="font-heading text-2xl font-semibold text-foreground">
                Похожие товары
              </h2>
              {/* Pencil: S font-body 14px muted-foreground */}
              <p className="text-sm text-muted-foreground">
                Подобрали для вас на основе характеристик
              </p>
            </div>
          </div>

          {/* Pencil: KcKDz Grid gap=16, 4 колонки ProductCard */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
