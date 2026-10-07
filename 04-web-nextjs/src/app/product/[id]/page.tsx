import { notFound } from "next/navigation";

import { getProductById } from "@/entities/product/api";
import { ProductPage } from "@/views/product";

/**
 * Тонкий динамический роут /product/[id].
 *
 * Next.js 16: params — Promise, читаем через await props.params.
 * Товар загружается из бэкенда через getProductById (entities/product/api).
 *
 * Если товар не найден (404) — вызываем notFound().
 */
export default async function ProductRoute(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductPage product={product} />;
}
