"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Button, Checkbox, Input } from "@/shared/ui";

interface CatalogFiltersProps {
  inStock: boolean;
  discount: boolean;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * CatalogFilters — client-остров сайдбара фильтров.
 *
 * Пишет фильтры в URL (?inStock / ?discount / ?minPrice / ?maxPrice), не трогая
 * другие параметры (category, sort), и сбрасывает ?page при смене фильтра.
 * CatalogPage (RSC) читает эти параметры из searchParams и фильтрует на сервере.
 *
 * В сайдбаре только фильтры, подкреплённые данными/серверной логикой: цена,
 * наличие, скидка. Подкатегория/бренд появятся с реальным API (в mock их нет).
 *
 * Pencil: Filters frame — w=280, bg=card, rounded-xl, padding=24, gap=16.
 */
export function CatalogFilters({ inStock, discount, minPrice, maxPrice }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minInput, setMinInput] = useState(minPrice?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(maxPrice?.toString() ?? "");

  const hasActiveFilters = inStock || discount || minPrice !== undefined || maxPrice !== undefined;

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page"); // смена фильтра сбрасывает пагинацию
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function toggleBool(key: string, value: boolean) {
    pushParams((params) => {
      if (value) params.set(key, "1");
      else params.delete(key);
    });
  }

  function applyPrice() {
    pushParams((params) => {
      const min = Number(minInput.trim());
      const max = Number(maxInput.trim());
      if (minInput.trim() && min > 0) params.set("minPrice", String(min));
      else params.delete("minPrice");
      if (maxInput.trim() && max > 0) params.set("maxPrice", String(max));
      else params.delete("maxPrice");
    });
  }

  function resetAll() {
    setMinInput("");
    setMaxInput("");
    pushParams((params) => {
      params.delete("inStock");
      params.delete("discount");
      params.delete("minPrice");
      params.delete("maxPrice");
    });
  }

  return (
    <aside className="flex w-[280px] shrink-0 flex-col gap-4 rounded-xl bg-card p-6">
      {/* Заголовок + сброс */}
      <div className="flex items-center justify-between">
        <span className="font-heading text-base font-semibold text-foreground">Фильтры</span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAll}
            className="text-[12px] text-primary transition-opacity hover:opacity-70"
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Цена */}
      <div className="flex flex-col gap-2.5">
        <span className="font-heading text-[13px] font-semibold text-foreground">Цена, ₽</span>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="от"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyPrice();
            }}
            aria-label="Цена от"
            className="flex-1"
          />
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="до"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyPrice();
            }}
            aria-label="Цена до"
            className="flex-1"
          />
        </div>
        <Button variant="outline" size="sm" onClick={applyPrice}>
          Применить
        </Button>
      </div>

      {/* Наличие */}
      <div className="flex flex-col gap-2.5">
        <span className="font-heading text-[13px] font-semibold text-foreground">Наличие</span>
        <label className="flex w-full cursor-pointer items-center gap-2.5">
          <Checkbox
            checked={inStock}
            onCheckedChange={(checked) => toggleBool("inStock", checked)}
          />
          <span className="flex-1 text-[13px] text-foreground">Только в наличии</span>
        </label>
      </div>

      {/* Скидка */}
      <div className="flex flex-col gap-2.5">
        <span className="font-heading text-[13px] font-semibold text-foreground">Скидка</span>
        <label className="flex w-full cursor-pointer items-center gap-2.5">
          <Checkbox
            checked={discount}
            onCheckedChange={(checked) => toggleBool("discount", checked)}
          />
          <span className="flex-1 text-[13px] text-foreground">Со скидкой</span>
        </label>
      </div>
    </aside>
  );
}
