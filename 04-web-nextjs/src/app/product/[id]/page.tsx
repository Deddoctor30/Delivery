import { notFound } from "next/navigation";

import { getProductById } from "@/entities/product";
import { ProductPage } from "@/views/product";

/**
 * Тонкий динамический роут /product/[id].
 *
 * Next.js 16: params — Promise, читаем через await props.params.
 * Товар берём из единого mock-источника (@/entities/product).
 * Вся вёрстка и логика — в ProductPage (views/product).
 *
 * Если товар не найден — вызываем notFound() из next/navigation,
 * что рендерит ближайший not-found.tsx или стандартную 404-страницу.
 */
export default async function ProductRoute(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductPage product={product} />;
}
