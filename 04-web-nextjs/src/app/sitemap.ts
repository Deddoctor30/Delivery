import type { MetadataRoute } from "next";

import { getTopCategories } from "@/entities/category";
import { getProducts } from "@/entities/product/api";
import { SITE_URL } from "@/shared/config/site";

export const revalidate = 3600; // пересобирать карту раз в час

/**
 * sitemap.xml: статические публичные страницы + категории + товары.
 * Если бэк недоступен на билде — отдаём хотя бы статические маршруты.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/catalog",
    "/new",
    "/sales",
    "/about",
    "/legal/about",
    "/legal/privacy",
    "/legal/cookies",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const [categories, products] = await Promise.all([
      getTopCategories(),
      getProducts({ limit: 100, sort: "newest" }),
    ]);

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${SITE_URL}/catalog?category=${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const productRoutes: MetadataRoute.Sitemap = products.items.map((p) => ({
      url: `${SITE_URL}/product/${p.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
