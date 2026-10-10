import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getTopCategories } from "@/entities/category";
import { getProducts } from "@/entities/product/api";
import { categoryIcon } from "@/shared/lib/category-icons";
import { cn } from "@/shared/lib/utils";

/** Склонение «товар» по числу. */
function pluralizeProducts(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} товар`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} товара`;
  return `${n} товаров`;
}

export async function HomeCategories() {
  const categories = await getTopCategories();

  // Счётчик товаров (с учётом потомков) по каждой верхнеуровневой категории
  const counts = await Promise.all(
    categories.map((c) => getProducts({ categorySlug: c.slug, limit: 1 }).then((r) => r.total)),
  );

  const items = categories.map((c, i) => ({
    id: c.id,
    label: c.name,
    count: pluralizeProducts(counts[i] ?? 0),
    icon: categoryIcon(c.slug),
    href: `/catalog?category=${c.slug}`,
  }));

  return (
    <section className="flex flex-col gap-5">
      {/* Head */}
      <div className="flex w-full items-end justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-[28px] font-semibold text-foreground">Категории</h2>
          <p className="text-sm text-muted-foreground">
            Найдите всё, что нужно — от горячего до десертов
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
        {items.map(({ id, label, count, icon: Icon, href }) => (
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
              <Icon className="size-5.5 text-accent-foreground" />
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
