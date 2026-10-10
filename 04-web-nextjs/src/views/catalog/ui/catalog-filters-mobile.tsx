"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui";

import { CatalogFilters } from "./catalog-filters";

interface CatalogFiltersMobileProps {
  inStock: boolean;
  discount: boolean;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * CatalogFiltersMobile — кнопка «Фильтры» + выезжающий Sheet с теми же
 * фильтрами, что в десктоп-сайдбаре. Показывается только на < lg.
 */
export function CatalogFiltersMobile(props: CatalogFiltersMobileProps) {
  const [open, setOpen] = useState(false);
  const activeCount = [
    props.inStock,
    props.discount,
    props.minPrice !== undefined,
    props.maxPrice !== undefined,
  ].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        <SlidersHorizontal className="size-4" />
        Фильтры{activeCount > 0 ? ` (${activeCount})` : ""}
      </SheetTrigger>
      <SheetContent side="left" className="w-85 max-w-[85vw] overflow-y-auto">
        {/* Заголовок для a11y (визуальный — внутри CatalogFilters) */}
        <SheetHeader className="sr-only">
          <SheetTitle>Фильтры</SheetTitle>
        </SheetHeader>
        <CatalogFilters {...props} className="w-full rounded-none" />
      </SheetContent>
    </Sheet>
  );
}
