"use client";

/**
 * CheckoutSummary — client-остров сводки заказа и кнопки «Оплатить».
 *
 * Pencil ztzER → Sidebar (Wd9sV):
 *   fill=$--card, cornerRadius=$--radius-lg, w=320, gap=16, p=24
 *
 *   SideTitle: «Ваш заказ», Geist 16px 600
 *   Позиции (ImVfN / aBPGp / xPnsO):
 *     row: gap=8, alignItems=center
 *       LF (fill_container, vertical, gap=2):
 *         N: Inter 13px, foreground, fixed-width
 *         Q: Inter 12px, muted-foreground (×2 / ×1 etc.)
 *       P: Geist Mono 13px 500, foreground
 *   Div: h=1, fill=$--border
 *   Calc-строки (hL0MN / J0BIif / Fc6lC):
 *     CL: Inter 14px muted-foreground (fill_container)
 *     CV: Geist Mono 14px foreground
 *   Div2: h=1, fill=$--border
 *   Total (tiDRJ):
 *     TL: Geist 16px 600 foreground (fill_container)
 *     TV: Geist Mono 18px 700 foreground
 *   PayBtn (Z481H): Button/Primary-Large, fill_container, «Оплатить»
 *   Policy: Inter 11px center muted-foreground, fixed-width
 *
 * Кнопка «Оплатить» — ИМИТАЦИЯ:
 *   toast.success + router.push("/checkout/success")
 *
 * TODO: заменить на реальную корзину/заказ (API)
 */

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Product } from "@/entities/product";
import { Button } from "@/shared/ui";

export type CheckoutLine = {
  product: Product;
  quantity: number;
};

interface CheckoutSummaryProps {
  lines: CheckoutLine[];
  deliveryCost: number;
  deliveryEta: string;
}

export function CheckoutSummary({ lines, deliveryCost, deliveryEta }: CheckoutSummaryProps) {
  const router = useRouter();

  const subtotal = lines.reduce((acc, l) => acc + l.product.price * l.quantity, 0);
  const total = subtotal + deliveryCost;

  function handlePay() {
    // ИМИТАЦИЯ оплаты — без реальной платёжной формы (§8 дизайн-доки)
    toast.success("Заказ оформлен! Ожидайте доставку.", { duration: 4000 });
    router.push("/checkout/success");
  }

  return (
    /* Pencil: Wd9sV fill=$--card, cornerRadius=$--radius-lg, w=320, gap=16, p=24
       Sticky на десктопе (как в cart/order-detail) */
    <aside className="flex w-full flex-col gap-4 rounded-xl bg-card p-6 lg:sticky lg:top-6 lg:w-[320px] lg:shrink-0">
      {/* Pencil: SideTitle Geist 16px 600 foreground */}
      <h2 className="font-heading text-base font-semibold text-foreground">Ваш заказ</h2>

      {/* ── Позиции ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {lines.map((line) => {
          const lineTotal = line.product.price * line.quantity;
          return (
            /* Pencil: item row gap=8, alignItems=center */
            <div key={line.product.id} className="flex items-center gap-2">
              {/* LF: vertical, gap=2, fill_container */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                {/* N: Inter 13px foreground, fixed-width → truncate */}
                <span className="truncate text-[13px] text-foreground">{line.product.title}</span>
                {/* Q: Inter 12px muted-foreground */}
                <span className="font-caption text-xs text-muted-foreground">×{line.quantity}</span>
              </div>
              {/* P: Geist Mono 13px 500 foreground */}
              <span className="font-mono text-[13px] font-medium text-foreground tabular-nums">
                {lineTotal.toLocaleString("ru-RU")} ₽
              </span>
            </div>
          );
        })}
      </div>

      {/* Pencil: Div h=1 fill=$--border */}
      <div className="h-px bg-border" />

      {/* ── Калькуляция ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Pencil: C Товары — CL Inter 14px muted-foreground, CV Geist Mono 14px foreground */}
        <div className="flex items-center justify-between">
          <span className="flex-1 text-sm text-muted-foreground">Товары</span>
          <span className="font-mono text-sm text-foreground tabular-nums">
            {subtotal.toLocaleString("ru-RU")} ₽
          </span>
        </div>

        {/* Pencil: C Доставка */}
        <div className="flex items-center justify-between">
          <span className="flex-1 text-sm text-muted-foreground">Доставка</span>
          <span className="font-mono text-sm text-foreground tabular-nums">
            {deliveryCost > 0 ? `${deliveryCost.toLocaleString("ru-RU")} ₽` : "Бесплатно"}
          </span>
        </div>

        {/* Pencil: C Срок доставки — CV «~35 мин» */}
        <div className="flex items-center justify-between">
          <span className="flex-1 text-sm text-muted-foreground">Срок доставки</span>
          <span className="font-mono text-sm text-foreground">{deliveryEta}</span>
        </div>
      </div>

      {/* Pencil: Div2 h=1 fill=$--border */}
      <div className="h-px bg-border" />

      {/* Pencil: Total tiDRJ — TL Geist 16px 600, TV Geist Mono 18px 700 */}
      <div className="flex items-center justify-between">
        <span className="flex-1 font-heading text-base font-semibold text-foreground">Итого</span>
        <span className="font-mono text-lg font-bold text-foreground tabular-nums">
          {total.toLocaleString("ru-RU")} ₽
        </span>
      </div>

      {/* Pencil: PayBtn Z481H — Button/Primary-Large, fill_container, «Оплатить»
          ИМИТАЦИЯ оплаты: toast + router.push("/checkout/success") */}
      <Button onClick={handlePay} size="lg" className="w-full">
        Оплатить
      </Button>

      {/* Pencil: Policy — Inter 11px center muted-foreground */}
      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        Нажимая «Оплатить», вы принимаете условия обработки данных
      </p>
    </aside>
  );
}
