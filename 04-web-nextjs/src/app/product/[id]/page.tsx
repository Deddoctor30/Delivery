import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProductById } from "@/entities/product/api";
import { ProductPage } from "@/views/product";

/** SEO: title/description/OG из данных товара (fetch дедуплицируется с роутом). */
export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const product = await getProductById(id);
  if (!product) return { title: "Товар не найден — Delivery" };

  const title = `${product.title} — Delivery`;
  const description =
    product.description?.slice(0, 160) || `${product.title} — купить с доставкой по России.`;
  // imageUrl относительный (/static/...) — metadataBase превратит его в абсолютный для OG.
  const images = product.imageUrl ? [product.imageUrl] : [];

  return {
    title,
    description,
    alternates: { canonical: `/product/${id}` },
    openGraph: { type: "website", title, description, images },
  };
}

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
