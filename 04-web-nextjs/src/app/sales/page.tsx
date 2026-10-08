import type { Metadata } from "next";

import { SalesPage } from "@/views/sales";

export const metadata: Metadata = {
  title: "Акции — Delivery",
  description: "Скидки до −50% на 1 200 товаров: техника, товары для дома и красоты.",
};

/**
 * Тонкий роут /sales. Next.js 16: searchParams — Promise.
 * Вся вёрстка и загрузка — в SalesPage (views/sales).
 */
export default async function SalesRoute(props: PageProps<"/sales">) {
  const sp = await props.searchParams;
  const page = typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;
  return <SalesPage page={page} />;
}
