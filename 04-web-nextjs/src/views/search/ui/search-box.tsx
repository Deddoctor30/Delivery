"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { SearchInput } from "@/features/product-search";

/**
 * SearchBox — client-остров строки поиска на странице результатов.
 * При сабмите пишет запрос в URL (?q=...), страница (RSC) читает его и фильтрует.
 */
export function SearchBox({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function submit(q: string) {
    const trimmed = q.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  return (
    <SearchInput
      value={value}
      onValueChange={setValue}
      onSubmit={submit}
      placeholder="Найти товар…"
    />
  );
}
