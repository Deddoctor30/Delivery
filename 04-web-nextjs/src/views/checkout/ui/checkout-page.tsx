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
 *   Позиции и суммы — из стора корзины (features/cart) внутри CheckoutFlow.
 *
 * RSC держит:
 *   - Breadcrumbs, заголовок, steps-бар (статика, без состояния)
 *
 * Client-остров:
 *   - CheckoutFlow — форма адреса (RHF) + сводка + создание заказа (createOrderAction)
 */

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { getAddresses } from "@/entities/address/api";

import { CheckoutFlow } from "./checkout-flow";

/* ── Steps ─────────────────────────────────────────────────────── */
const STEPS = [
  { label: "Адрес", active: true },
  { label: "Карта", active: false },
  { label: "Расчёт", active: false },
  { label: "Оплата", active: false },
] as const;

/* ── Компонент ─────────────────────────────────────────────────── */
export async function CheckoutPage() {
  // Сохранённые адреса — только для авторизованных; гость/ошибка → пусто.
  const savedAddresses = await getAddresses().catch(() => []);

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

      {/* ── 4. Cols (client-остров: форма + сводка + создание заказа) ── */}
      {/* Pencil: KBpQH horizontal gap=32; адаптив внутри CheckoutFlow */}
      <CheckoutFlow savedAddresses={savedAddresses} />
    </div>
  );
}
