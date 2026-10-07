import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui";

import { CartContent } from "./cart-content";

/**
 * CartPage — экран корзины (RSC-обёртка).
 *
 * Структура:
 *   1. Breadcrumbs — Главная / Корзина
 *   2. Заголовок
 *   3. CartContent (client-остров) — читает корзину из стора (features/cart):
 *      гость → localStorage, авторизованный → бэкенд.
 */
export function CartPage() {
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
      </div>

      {/* ── 3. CartContent (client-остров) ─────────────────────────── */}
      <CartContent />
    </div>
  );
}
