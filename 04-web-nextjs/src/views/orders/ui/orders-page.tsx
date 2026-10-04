import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  EmptyState,
  Illustration,
} from "@/shared/ui";
import { MOCK_ORDERS } from "@/entities/order";

import { OrdersList } from "./orders-list";

/**
 * OrdersPage — экран «Мои заказы» (RSC-обёртка).
 *
 * Из Pencil-фрейма (Desktop / Заказы, Body):
 *   layout: vertical, gap: 24, padding: [28, 170, 80, 170]
 *   (горизонтальные отступы — в layout.tsx через max-w-[1328px] + px-4)
 *
 * Структура:
 *   1. Breadcrumbs — Главная / Мои заказы
 *   2. Заголовок «Мои заказы» + счётчик заказов
 *   3. OrdersList (client-остров) — список OrderCard с обработчиками
 *   4. Пустое состояние (EmptyState + Illustration «no-orders»)
 *
 * Фильтр по статусу: в дизайне Orders не показан — не добавляем.
 * StatusTimeline: используется только в деталях заказа (отдельная страница) — не в списке.
 *
 * OrdersPage остаётся RSC:
 *   – нет useState/useEffect/браузерных хуков
 *   – данные из единого mock-источника (MOCK_ORDERS)
 *   – страница приватная (guard на /orders в src/proxy.ts)
 *   – функции-обработчики не сериализуемы → вынесены в client-остров OrdersList
 *
 * TODO: заменить на реальный API (персональные данные — no-store).
 */
export function OrdersPage() {
  // TODO: заменить на реальный API (персональные данные — no-store)
  const orders = MOCK_ORDERS;

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
            <BreadcrumbPage>Мои заказы</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── 2. Заголовок ────────────────────────────────────────────── */}
      {/* Pencil: Title font-heading 28px 600 foreground */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[28px] font-semibold leading-[1.2] text-foreground">
          Мои заказы
        </h1>
        {orders.length > 0 && (
          <p className="text-sm text-muted-foreground">{orders.length} заказов</p>
        )}
      </div>

      {/* ── 3. Список заказов / 4. Пустое состояние ─────────────────── */}
      {orders.length === 0 ? (
        /* Pencil: EmptyState «Заказов пока нет»
           Illustration YyUTA (no-orders), title=«Заказов пока нет»,
           caption=«Здесь появятся ваши заказы после оформления»,
           CTA Primary=«Начать покупки» */
        <EmptyState
          icon={<Illustration name="no-orders" size={160} />}
          title="Заказов пока нет"
          description="Здесь появятся ваши заказы после оформления"
          action={
            <Button asChild>
              <Link href="/catalog">Начать покупки</Link>
            </Button>
          }
        />
      ) : (
        /* Pencil: OrderCard wTm1h — bg=card, rounded-xl, shadow-sm, p=18, gap=12
           Head: order number (font-heading 14 600) + status badge (Label/Warning etc.)
           Preview: thumbs 52×52 bg=secondary rounded-md + icon package + «+N» count
           Foot: SumWrap (label+value font-mono 16 600) + Button/Outline «Подробнее»
           client-остров: обработчики (функции) нельзя сериализовать из RSC */
        <OrdersList orders={orders} />
      )}
    </div>
  );
}
