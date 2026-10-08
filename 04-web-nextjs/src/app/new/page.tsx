import type { Metadata } from "next";

import { NewProductsPage } from "@/views/new";

export const metadata: Metadata = {
  title: "Новинки — Delivery",
  description: "Свежие поступления: 132 товара появились за последние 30 дней.",
};

/**
 * Тонкий роут /new.
 * Вся вёрстка — в NewProductsPage (views/new).
 */
export default function NewRoute() {
  return <NewProductsPage />;
}
