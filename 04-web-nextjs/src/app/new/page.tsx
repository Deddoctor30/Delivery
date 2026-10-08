import type { Metadata } from "next";

import { NewProductsPage } from "@/views/new";

export const metadata: Metadata = {
  title: "Новинки — Delivery",
  description: "Свежие поступления — товары, добавленные последними.",
};

/**
 * Тонкий роут /new. Next.js 16: searchParams — Promise.
 * Вся вёрстка и загрузка — в NewProductsPage (views/new).
 */
export default async function NewRoute(props: PageProps<"/new">) {
  const sp = await props.searchParams;
  const page = typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;
  return <NewProductsPage page={page} />;
}
