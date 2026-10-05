import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui";
// TODO: /make-api cart — translate to real cart API.
// Mock ids (p1/p3/p13) do not exist in the real DB.
import { getMockProductById } from "@/entities/product";

import { CartContent } from "./cart-content";
import type { CartLine } from "./cart-content";

/**
 * CartPage — экран корзины (RSC-обёртка).
 *
 * Из Pencil-фреймов (Agent Work Area):
 *   Empty Cart Section (JMBZr): bg=$--card, rounded-xl, p=24, gap=16, centered
 *   Illustration Empty Cart (LV0Zw): 160×160, Bag body rx=8 + Handle + Accent dot primary
 *
 * Структура:
 *   1. Breadcrumbs — Главная / Корзина
 *   2. Заголовок + счётчик позиций
 *   3. CartContent (client-остров) — список + панель-итого
 *
 * CartPage остаётся RSC:
 *   – нет useState/useEffect/браузерных хуков
 *   – формирует начальный список позиций из mock и передаёт в CartContent
 *   – при появлении реального стора/бэкенда заменить mock на fetch/apiServer
 *
 * TODO: заменить на реальную корзину (стор/бэкенд)
 */
export function CartPage() {
  // TODO: заменить на реальную корзину (стор/бэкенд)
  // Позиции корзины из единого mock-источника (@/entities/product):
  //   p1 — Наушники Sound X3 × 1
  //   p3 — Чайник Smart 1.7л × 2
  //   p13 — Куртка Winter Pro × 1
  const initialLines: CartLine[] = [
    { product: getMockProductById("p1")!, quantity: 1 },
    { product: getMockProductById("p3")!, quantity: 2 },
    { product: getMockProductById("p13")!, quantity: 1 },
  ].filter((line) => Boolean(line.product));

  return (
    <div className="flex flex-col gap-6 py-7 pb-12">
      {/* ── 1. Breadcrumbs ─────────────────────────────────────────── */}
      {/* Pencil: Breadcrumbs alignItems=center gap=8 */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Корзина</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── 2. Заголовок ───────────────────────────────────────────── */}
      {/* Pencil: Title font-heading 28px 600 foreground */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[28px] font-semibold leading-[1.2] text-foreground">
          Корзина
        </h1>
        {initialLines.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {initialLines.length === 1 ? "1 позиция" : `${initialLines.length} позиции`}
          </p>
        )}
      </div>

      {/* ── 3. CartContent (client-остров) ─────────────────────────── */}
      {/*
       * Передаём начальный список позиций.
       * CartContent управляет состоянием: qty, удаление, пересчёт суммы.
       * Пустое состояние обрабатывается внутри CartContent (EmptyState).
       */}
      <CartContent initialLines={initialLines} />
    </div>
  );
}
