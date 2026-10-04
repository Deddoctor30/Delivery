import Image from "next/image";
import Link from "next/link";
import { MapPin, Package } from "lucide-react";

import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MapPlaceholder,
} from "@/shared/ui";
import {
  StatusTimeline,
  ORDER_STATUS_BADGE_VARIANT,
  ORDER_STATUS_LABELS,
  type Order,
} from "@/entities/order";

import { OrderActions } from "./order-actions";

export interface OrderDetailPageProps {
  order: Order;
}

/**
 * OrderDetailPage — экран деталей заказа (RSC-обёртка).
 *
 * Из Pencil: Section/Заказ и системные (Bz4QC) — Left Col: StatusTimeline (SlQMW),
 * Right Col: MapPlaceholder (HT7ER). Дизайн-токены — bg-card, rounded-xl,
 * font-heading, font-mono, font-caption.
 *
 * Раскладка десктоп: 2 колонки (основная + сайдбар-сумма).
 * Раскладка мобайл: вертикальный стек.
 *
 * Секции:
 *   1. Breadcrumbs — Главная / Мои заказы / Заказ #N
 *   2. Заголовок — № заказа + дата + статус-бейдж
 *   3. Основная колонка:
 *      3a. Прогресс / таймлайн статусов (StatusTimeline)
 *      3b. Блок доставки — адрес + MapPlaceholder
 *      3c. Список позиций — фото/название/кол-во/цена
 *   4. Сайдбар-сумма — товары/доставка/итого + способ оплаты
 *   5. Панель действий (client-остров OrderActions)
 *
 * OrderDetailPage — RSC: нет браузерных хуков / обработчиков.
 * Интерактивные действия вынесены в client-остров OrderActions.
 */
export function OrderDetailPage({ order }: OrderDetailPageProps) {
  const {
    number,
    createdAt,
    status,
    items,
    subtotal,
    deliveryPrice,
    total,
    address,
    addressComment,
    paymentMethod,
  } = order;

  const statusLabel = ORDER_STATUS_LABELS[status];
  const badgeVariant = ORDER_STATUS_BADGE_VARIANT[status];

  const formattedDate = new Date(createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = new Date(createdAt).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatPrice = (value: number) => value.toLocaleString("ru-RU") + " ₽";

  return (
    <div className="flex flex-col gap-6 py-7 pb-20">
      {/* ── 1. Breadcrumbs ──────────────────────────────────────────── */}
      {/* Pencil: Breadcrumbs gap=8, alignItems=center */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/orders">Мои заказы</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Заказ #{number}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── 2. Заголовок ────────────────────────────────────────────── */}
      {/* Pencil: Title font-heading 28px 600, date muted-foreground */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-[28px] font-semibold leading-[1.2] text-foreground">
            Заказ #{number}
          </h1>
          <p className="font-caption text-sm text-muted-foreground">
            {formattedDate}, {formattedTime}
          </p>
        </div>
        <Badge variant={badgeVariant} className="mt-1">
          {statusLabel}
        </Badge>
      </div>

      {/* ── 3–4. Двухколоночная раскладка ───────────────────────────── */}
      {/* Pencil: десктоп — main col (fill) + sidebar (360px); мобайл — стек */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* ─── Основная колонка ────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/* 3a. Прогресс — StatusTimeline */}
          {/* Pencil: StatusTimeline SlQMW — Left Col в Section/Заказ и системные */}
          <Card>
            <CardHeader>
              <p className="font-caption text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Статус заказа
              </p>
              <CardTitle className="mt-1">Прогресс доставки</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <StatusTimeline currentStatus={status} timestamps={order.statusTimestamps} />
            </CardContent>
          </Card>

          {/* 3b. Блок доставки — адрес + MapPlaceholder */}
          {/* Pencil: MapPlaceholder HT7ER — Right Col в Section/Заказ и системные */}
          {address && (
            <Card>
              <CardHeader>
                <p className="font-caption text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Выбор адреса доставки
                </p>
                <CardTitle className="mt-1">Доставка</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-4 flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">{address}</span>
                    {addressComment && (
                      <span className="text-xs text-muted-foreground">{addressComment}</span>
                    )}
                  </div>
                </div>
                <MapPlaceholder height={200} />
              </CardContent>
            </Card>
          )}

          {/* 3c. Список позиций */}
          {/* Pencil: items row — фото 52×52 bg=secondary rounded-md + название + кол-во + цена */}
          <Card>
            <CardHeader>
              <p className="font-caption text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Состав заказа
              </p>
              <CardTitle className="mt-1">
                {items.length}{" "}
                {items.length === 1 ? "товар" : items.length < 5 ? "товара" : "товаров"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="flex flex-col divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    {/* Миниатюра товара */}
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="56px"
                          className="object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Название + количество */}
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium text-foreground">
                        {item.title}
                      </span>
                      <span className="text-xs text-muted-foreground">× {item.quantity} шт.</span>
                    </div>

                    {/* Цена */}
                    <span className="shrink-0 font-mono text-sm font-semibold text-foreground">
                      {formatPrice(item.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 5. Действия (client-остров) */}
          <OrderActions order={{ number: order.number, status: order.status }} />
        </div>

        {/* ─── Сайдбар-сумма ───────────────────────────────────────── */}
        {/* Pencil: SumWrap — bg=card, rounded-xl, p=18, vertical gap=12 */}
        <aside className="w-full lg:w-[360px] lg:shrink-0">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Итог заказа</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-3">
                {/* Строки суммы */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Товары</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Доставка</span>
                  <span className="text-sm font-medium text-foreground">
                    {deliveryPrice === 0 ? "Бесплатно" : formatPrice(deliveryPrice)}
                  </span>
                </div>

                {paymentMethod && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">Оплата</span>
                    <span className="text-sm font-medium text-foreground">{paymentMethod}</span>
                  </div>
                )}

                {/* Разделитель */}
                <div className="h-px w-full bg-border" />

                {/* Итого */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-heading text-base font-semibold text-foreground">
                    Итого
                  </span>
                  <span className="font-mono text-xl font-bold text-foreground">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Ссылка назад */}
              <div className="mt-5 border-t border-border pt-4">
                <Link
                  href="/orders"
                  className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                >
                  ← Все заказы
                </Link>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
