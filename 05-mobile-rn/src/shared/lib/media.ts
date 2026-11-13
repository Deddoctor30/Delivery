import { env } from "@/shared/config/env";

/**
 * Абсолютный URL картинки. Бэк отдаёт относительные пути (/static/...),
 * а expo-image тянет файл напрямую с бэка → префиксуем базовым адресом.
 */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${env.apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
