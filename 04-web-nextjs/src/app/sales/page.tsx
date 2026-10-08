import type { Metadata } from "next";

import { SalesPage } from "@/views/sales";

export const metadata: Metadata = {
  title: "Акции — Delivery",
  description: "Скидки до −50% на 1 200 товаров: техника, товары для дома и красоты.",
};

/**
 * Тонкий роут /sales.
 * Вся вёрстка — в SalesPage (views/sales).
 */
export default function SalesRoute() {
  return <SalesPage />;
}
