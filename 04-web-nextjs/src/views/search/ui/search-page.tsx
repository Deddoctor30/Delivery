import { PackageSearch, Search } from "lucide-react";

import { searchProducts } from "@/entities/product/api";
import { CartProductCard } from "@/features/cart";
import { EmptyState } from "@/shared/ui";

import { SearchBox } from "./search-box";

export interface SearchPageProps {
  query: string;
}

/**
 * SearchPage — результаты поиска (async RSC).
 *
 * Поиск делегирован бэкенду через searchProducts() →
 * GET /api/v1/products/search/suggest?q=...
 * Suggest возвращает id+name (без полных данных), достаточно для списка.
 */
export async function SearchPage({ query }: SearchPageProps) {
  const q = query.trim();
  const results = q ? await searchProducts(q) : [];

  return (
    <div className="flex flex-col gap-6 py-7 pb-20">
      {/* Строка поиска */}
      <div className="max-w-[640px]">
        <SearchBox initialQuery={query} />
      </div>

      {/* Заголовок + количество */}
      {q && (
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-[28px] font-semibold leading-tight text-foreground">
            Результаты по запросу «{query.trim()}»
          </h1>
          <span className="font-mono text-[13px] text-muted-foreground">
            {results.length.toLocaleString("ru-RU")} товаров
          </span>
        </div>
      )}

      {/* Результаты / пустые состояния */}
      {!q ? (
        <EmptyState
          icon={<Search className="size-20 text-muted-foreground/40" />}
          title="Введите поисковый запрос"
          description="Начните вводить название товара, чтобы найти нужное."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={<PackageSearch className="size-20 text-muted-foreground/40" />}
          title="Ничего не найдено"
          description="Попробуйте изменить запрос или загляните в каталог."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((product) => (
            <CartProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
