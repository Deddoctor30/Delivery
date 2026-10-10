import Link from "next/link";
import { Check } from "lucide-react";

import { buttonVariants } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

/**
 * CheckoutSuccessPage — экран «Успех оплаты» (RSC).
 *
 * Pencil-фрейм: qXrb0 «Desktop/Успех оплаты» (1440px)
 *   Body (Fhpoz): vertical, height=660, gap=32, justifyContent=center, alignItems=center
 *     IconWrap (jLtth): 96×96, fill=#D1FAE5 → bg-success, cornerRadius=48 → rounded-full
 *       Check icon (wa2y1): 48×48, lucide, fill=#10B981 → text-success-foreground
 *     Txt (KmLCD): vertical, gap=10, alignItems=center
 *       H1 (DaSZa): «Заказ оформлен!», Geist 36px 700, fill=$--foreground
 *       H2 (IFfTa): «Номер заказа: #20847», Inter 16px normal, fill=$--muted-foreground
 *       H3 (S4Y57S): «Ожидаемое время доставки: ~35 мин», Inter 16px normal, fill=$--muted-foreground
 *     Btns (XhNvp): horizontal, gap=12, alignItems=center
 *       OrdBtn (NMTvs): ref=XGeT4 Button/Primary-Large → variant=default size=lg → /orders
 *       HomeBtn (GOQpN): ref=cAgR2 Button/Outline → variant=outline → /
 *
 * Нет мобильного фрейма — адаптив через Tailwind-брейкпоинты.
 * RSC: нет браузерных хуков. CTA — статические ссылки (next/link + buttonVariants).
 * Layout уже даёт <main> с контейнером — экран НЕ добавляет свой контейнер.
 */
export function CheckoutSuccessPage() {
  return (
    /* Pencil: Body (Fhpoz) vertical gap=32 justifyContent=center alignItems=center height=660 */
    <div className="flex min-h-[660px] flex-col items-center justify-center gap-8 py-12">
      {/* ── IconWrap (jLtth): 96×96, bg-success, rounded-full ──────── */}
      <div className="flex size-24 items-center justify-center rounded-full bg-success">
        {/* Pencil: Check icon (wa2y1) 48×48 lucide fill=#10B981 → text-success-foreground */}
        <Check className="size-12 text-success-foreground" strokeWidth={2.5} />
      </div>

      {/* ── Txt (KmLCD): vertical gap=10 alignItems=center ─────────── */}
      <div className="flex flex-col items-center gap-2.5 text-center">
        {/* Pencil: H1 (DaSZa) Geist 36px 700 fill=$--foreground */}
        <h1 className="font-heading text-4xl font-bold text-foreground">Заказ оформлен!</h1>

        {/* Pencil: H2 (IFfTa) Inter 16px normal fill=$--muted-foreground */}
        {/* TODO: из реального заказа (номер заказа из API/store) */}
        <p className="text-base text-muted-foreground">Номер заказа: #20847</p>

        {/* Pencil: H3 (S4Y57S) Inter 16px normal fill=$--muted-foreground */}
        {/* TODO: из реального заказа (ETA из API) */}
        <p className="text-base text-muted-foreground">Ожидаемое время доставки: ~35 мин</p>
      </div>

      {/* ── Btns (XhNvp): horizontal gap=12 alignItems=center ───────── */}
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        {/* Pencil: OrdBtn (NMTvs) ref=XGeT4 Button/Primary-Large → variant=default size=lg */}
        <Link href="/orders" className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
          К моим заказам
        </Link>

        {/* Pencil: HomeBtn (GOQpN) ref=cAgR2 Button/Outline */}
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          На главную
        </Link>
      </div>
    </div>
  );
}
