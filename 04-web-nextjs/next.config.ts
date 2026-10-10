import path from "node:path";
import { fileURLToPath } from "node:url";

import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const projectDir = path.dirname(fileURLToPath(import.meta.url));

// Внутренний адрес бэка (в Docker — http://backend:3001, локально — http://localhost:3001).
// Читается при старте сервера; дефолт — для сборки/локального запуска без env.
const apiInternalUrl = (process.env.API_INTERNAL_URL ?? "http://localhost:3001").replace(/\/$/, "");

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: projectDir,
  // Картинки бэка (/static/*) проксируем через сам Next: тогда next/image оптимизирует
  // их по same-origin пути, а серверный фетч идёт на внутренний адрес бэка (в Docker
  // web-контейнер не достаёт публичный localhost:3001 — только backend:3001).
  async rewrites() {
    return [{ source: "/static/:path*", destination: `${apiInternalUrl}/static/:path*` }];
  },
};

export default withBundleAnalyzer(nextConfig);
