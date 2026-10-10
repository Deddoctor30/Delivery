import type { Metadata } from "next";

import { SearchPage } from "@/views/search";

// Страницы результатов поиска не индексируем (дубли/бесконечные вариации).
export const metadata: Metadata = {
  title: "Поиск — Delivery",
  robots: { index: false, follow: true },
};

/**
 * Тонкий роут /search. Next 16: searchParams — Promise.
 */
export default async function SearchRoute(props: PageProps<"/search">) {
  const sp = await props.searchParams;
  const query = typeof sp.q === "string" ? sp.q : "";

  return <SearchPage query={query} />;
}
