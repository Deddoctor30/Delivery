"use client";

import { type LucideIcon } from "lucide-react";

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
