import {
  UtensilsCrossed,
  CupSoda,
  IceCreamCone,
  Pizza,
  Beef,
  Soup,
  Coffee,
  CakeSlice,
  Layers,
  Package,
  type LucideIcon,
} from "lucide-react";

/**
 * Иконки категорий по slug. Бэкенд иконок не отдаёт — сопоставляем на фронте.
 * Неизвестный slug → Package (дефолт).
 */
const ICON_BY_SLUG: Record<string, LucideIcon> = {
  // верхний уровень
  goryachee: UtensilsCrossed,
  napitki: CupSoda,
  deserty: IceCreamCone,
  // листья
  pizza: Pizza,
  burgers: Beef,
  soups: Soup,
  coffee: Coffee,
  lemonades: CupSoda,
  cakes: CakeSlice,
  "ice-cream": IceCreamCone,
};

/** Иконка категории по slug (с дефолтом). */
export function categoryIcon(slug: string): LucideIcon {
  return ICON_BY_SLUG[slug] ?? Package;
}

/** Иконка для чипа «Все». */
export const ALL_CATEGORIES_ICON = Layers;
