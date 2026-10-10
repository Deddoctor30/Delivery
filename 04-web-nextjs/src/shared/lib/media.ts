/**
 * Нормализует путь к ассету бэкенда в same-origin относительный URL.
 *
 * Картинки отдаёт бэк (`/static/...`), но ходить в него напрямую нельзя:
 * `next/image` оптимизирует картинку на сервере, а в Docker публичный хост бэка
 * (`localhost:3001`) из web-контейнера недостижим. Поэтому `/static/*` проксируется
 * самим Next (rewrite → `API_INTERNAL_URL`, см. next.config.ts), а в разметку отдаём
 * относительный путь (same-origin) — он работает и для `next/image`, и для `<img>`.
 *
 * Абсолютный http(s) (если бэк когда-нибудь начнёт отдавать такой) оставляем как есть.
 */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
}
