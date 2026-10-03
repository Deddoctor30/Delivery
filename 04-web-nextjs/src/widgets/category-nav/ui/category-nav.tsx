"use client";

import {
  Layers,
  Smartphone,
  Shirt,
  Sofa,
  Book,
  Dumbbell,
  Apple,
  type LucideIcon,
} from "lucide-react";

import { CategoryChip } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

/** Minimal category descriptor used by the widget. */
export interface Category {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface CategoryNavProps {
  /** Ordered list of categories to render as chips. */
  categories: Category[];
  /** ID of the currently selected category. */
  activeId?: string;
  /** Called when the user clicks a chip. */
  onSelect?: (id: string) => void;
  className?: string;
}

/**
 * CategoryNav — horizontal scrollable row of CategoryChip items.
 *
 * Pencil node XCeaP:
 *   layout: horizontal, gap: 8, padding: 0
 *   overflow: horizontal scroll (implied by mobile carousel context)
 *
 * Client Component: renders interactive <button> chips with onClick handlers.
 */
export function CategoryNav({ categories, activeId, onSelect, className }: CategoryNavProps) {
  return (
    <nav
      aria-label="Категории"
      className={cn("flex flex-row items-center gap-2 overflow-x-auto scrollbar-none", className)}
    >
      {categories.map(({ id, label, icon }) => (
        <CategoryChip
          key={id}
          label={label}
          icon={icon}
          isActive={id === activeId}
          onClick={() => onSelect?.(id)}
          className="shrink-0"
        />
      ))}
    </nav>
  );
}

/** Default category set matching the Pencil design (XCeaP sample data). */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: "all", label: "Все", icon: Layers },
  { id: "electronics", label: "Электроника", icon: Smartphone },
  { id: "clothing", label: "Одежда", icon: Shirt },
  { id: "home", label: "Дом", icon: Sofa },
  { id: "books", label: "Книги", icon: Book },
  { id: "sport", label: "Спорт", icon: Dumbbell },
  { id: "food", label: "Еда", icon: Apple },
];
