/**
 * CheckoutPage — экран «Оформление заказа» (RSC-обёртка).
 *
 * Pencil-фрейм: ztzER «Desktop/Оформление заказа» (1440px)
 *   layout: vertical
 *   Main (GYzAN): vertical, gap=28, padding=[40,80]
 *     Steps (ZIdpc): 4 шага — Адрес, Карта, Расчёт, Оплата
 *     Title (VnL2g): «Оформление заказа», Geist 28px 600
 *     Cols (KBpQH): горизонт. gap=32
 *       Left (Zt9T0): fill_container, vertical, gap=20
 *         AddrCard (A28g7U) + MapCard (c2Ft2)  → CheckoutForm (client-остров)
 *       Sidebar (Wd9sV): w=320, bg=card, rx=lg, gap=16, p=24 → CheckoutSummary (client-остров)
 *
 * Адаптив (нет отдельного mobile-фрейма):
 *   < lg: Cols — flex-col (форма сверху, сводка снизу)
 *   ≥ lg: Cols — flex-row (форма слева, sticky-sidebar справа 320px)
 *
 * Данные:
 *   Позиции — из @/entities/product (MOCK_PRODUCTS / getProductById, 3 позиции).
 *   TODO: заменить на реальную корзину/заказ (API).
 *
 * RSC держит:
 *   - Breadcrumbs, заголовок, steps-бар (статика, без состояния)
 *   - Раскладку колонок
 *   - Формирование начальных данных (lines, delivery)
 *
 * Client-острова:
 *   - CheckoutForm — поля адреса (Input/Label), RadioGroup доставки
 *   - CheckoutSummary — сводка + кнопка «Оплатить» (toast + push /checkout/success)
 */

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui";
// TODO: /make-api cart — translate to real cart/order API.
// Mock ids (p1/p3/p4) do not exist in the real DB.
import { getMockProductById } from "@/entities/product";
import { cn } from "@/shared/lib/utils";

import { CheckoutForm } from "./checkout-form";
import { CheckoutSummary } from "./checkout-summary";
import type { CheckoutLine } from "./checkout-summary";

/* ── Константы ─────────────────────────────────────────────────── */
const DELIVERY_COST = 149; // Pencil: C Доставка CV «149 ₽»
const DELIVERY_ETA = "~35 мин"; // Pencil: C Срок доставки CV «~35 мин»

/* ── Steps ─────────────────────────────────────────────────────── */
const STEPS = [
  { label: "Адрес", active: true },
  { label: "Карта", active: false },
  { label: "Расчёт", active: false },
  { label: "Оплата", active: false },
] as const;

/* ── Компонент ─────────────────────────────────────────────────── */
export function CheckoutPage() {
  // TODO: заменить на реальную корзину/заказ (API)
  // Позиции из единого mock-источника (@/entities/product):
  //   p1 — Наушники Sound X3 × 2 (Pencil: Лосось терияки × 2, 1 180 ₽)
  //   p3 — Чайник Smart 1.7л × 1 (Pencil: Роллы Филадельфия × 1, 420 ₽)
  //   p4 — Кофемашина CremaOne × 1 (Pencil: Мисо-суп × 1, 329 ₽)
  const lines: CheckoutLine[] = [
    { product: getMockProductById("p1")!, quantity: 2 },
    { product: getMockProductById("p3")!, quantity: 1 },
    { product: getMockProductById("p4")!, quantity: 1 },
  ].filter((line) => Boolean(line.product));

  return (
    <div className="flex flex-col gap-7 py-7 pb-12">
      {/* ── 1. Breadcrumbs ─────────────────────────────────────────── */}
      {/* Pencil: Breadcrumbs gap=8 alignItems=center */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/cart">Корзина</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Оформление заказа</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── 2. Steps ───────────────────────────────────────────────── */}
      {/* Pencil: ZIdpc alignItems=center, horizontal
          Step: gap=6, padding=[6,12], alignItems=center
          Dot: ellipse, fill=$--primary (active) / $--muted-foreground (inactive)
          Lbl: Geist 14px 600 (active foreground) / normal muted-foreground (inactive)
          Sep: w=24, h=1, fill=$--border */}
      <div className="flex items-center" role="list" aria-label="Шаги оформления">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center">
            {i > 0 && (
              /* Pencil: Sep w=24 h=1 fill=$--border */
              <div className="mx-1 h-px w-6 bg-border" aria-hidden="true" />
            )}
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5",
                step.active && "bg-primary/5",
              )}
              role="listitem"
              aria-current={step.active ? "step" : undefined}
            >
              {/* Pencil: Dot 8×8 ellipse */}
              <span
                className={cn(
                  "block size-2 shrink-0 rounded-full",
                  step.active ? "bg-primary" : "bg-muted-foreground",
                )}
                aria-hidden="true"
              />
              {/* Pencil: Lbl Geist 14px */}
              <span
                className={cn(
                  "font-heading text-sm",
                  step.active
                    ? "font-semibold text-foreground"
                    : "font-normal text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. Title ───────────────────────────────────────────────── */}
      {/* Pencil: VnL2g Geist 28px 600 foreground */}
      <h1 className="font-heading text-[28px] font-semibold leading-[1.2] text-foreground">
        Оформление заказа
      </h1>

      {/* ── 4. Cols ────────────────────────────────────────────────── */}
      {/* Pencil: KBpQH horizontal gap=32
          Left (Zt9T0): fill_container, vertical, gap=20
          Sidebar (Wd9sV): w=320
          Адаптив: < lg → flex-col; ≥ lg → flex-row */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
        {/* ── Левая колонка: форма + карта ─────────────────────── */}
        {/* Pencil: Zt9T0 fill_container, vertical, gap=20 */}
        <div className="flex-1">
          <CheckoutForm />
        </div>

        {/* ── Правая колонка: сводка + оплата ──────────────────── */}
        {/* Pencil: Wd9sV w=320, sticky на десктопе */}
        <CheckoutSummary lines={lines} deliveryCost={DELIVERY_COST} deliveryEta={DELIVERY_ETA} />
      </div>
    </div>
  );
}
