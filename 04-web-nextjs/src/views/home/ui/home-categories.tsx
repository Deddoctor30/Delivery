import Link from "next/link";
import {
  Smartphone,
  Shirt,
  Sofa,
  Book,
  Dumbbell,
  Sparkles,
  Apple,
  Baby,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface CategoryItem {
  id: string;
  label: string;
  count: string;
  icon: LucideIcon;
  href: string;
}

// TODO: заменить на реальный API (категории с сервера)
const MOCK_CATEGORIES: CategoryItem[] = [
  {
    id: "electronics",
    label: "Электроника",
    count: "12 480 товаров",
    icon: Smartphone,
    href: "/catalog?category=electronics",
  },
  {
    id: "clothing",
    label: "Одежда",
    count: "8 320 товаров",
    icon: Shirt,
    href: "/catalog?category=clothing",
  },
  {
    id: "home",
    label: "Дом и сад",
    count: "5 640 товаров",
    icon: Sofa,
    href: "/catalog?category=home",
  },
  {
    id: "books",
    label: "Книги",
    count: "3 900 товаров",
    icon: Book,
    href: "/catalog?category=books",
  },
  {
    id: "sport",
    label: "Спорт",
    count: "4 210 товаров",
    icon: Dumbbell,
    href: "/catalog?category=sport",
  },
  {
    id: "beauty",
    label: "Красота",
    count: "2 750 товаров",
    icon: Sparkles,
    href: "/catalog?category=beauty",
  },
  {
    id: "food",
    label: "Продукты",
    count: "1 980 товаров",
    icon: Apple,
    href: "/catalog?category=food",
  },
  {
    id: "kids",
    label: "Детям",
    count: "3 120 товаров",
    icon: Baby,
    href: "/catalog?category=kids",
  },
];

export function HomeCategories() {
  return (
    <section className="flex flex-col gap-5">
      {/* Head */}
      <div className="flex w-full items-end justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-[28px] font-semibold text-foreground">Категории</h2>
          <p className="text-sm text-muted-foreground">
            Найдите всё, что нужно — от электроники до продуктов
          </p>
        </div>
        <Link
          href="/catalog"
          className={cn(
            "flex items-center gap-1.5 text-[13px] font-medium text-primary",
            "transition-opacity hover:opacity-75",
          )}
        >
          Все категории
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Grid — 4 cols desktop, 2 cols mobile */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {MOCK_CATEGORIES.map(({ id, label, count, icon: Icon, href }) => (
          <Link
            key={id}
            href={href}
            className={cn(
              "flex h-40 flex-col justify-between rounded-xl bg-card p-5",
              "transition-shadow hover:shadow-md",
            )}
          >
            {/* Icon box */}
            <div className="flex size-11 items-center justify-center rounded-md bg-accent">
              <Icon className="size-[22px] text-accent-foreground" />
            </div>
            {/* Text */}
            <div className="flex flex-col gap-0.5">
              <span className="font-heading text-base font-semibold text-foreground">{label}</span>
              <span className="font-mono text-xs text-muted-foreground">{count}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
