import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { Badge, Logo } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { SearchInput } from "@/features/product-search";
import { AuthButton } from "@/features/auth";
import { ThemeToggle } from "@/features/theme-toggle";

/**
 * Desktop site header.
 *
 * Pencil node WfpQK — HeaderDesktop:
 *   width: 1240, height: 72
 *   fill: $--card, stroke-bottom: $--border 1px
 *   layout: horizontal, gap: 24, padding: [0, 28], alignItems: center
 *
 * Blocks (left→right):
 *   Logo | Nav (Каталог, Акции, Новинки, О нас) | SearchInput (fill) | Actions (theme, profile, cart+badge)
 *
 * CategoryNav is NOT embedded here — it lives in widgets/category-nav and is
 * composed at the view/layout level (avoiding same-layer import prohibited by FSD).
 *
 * RSC — no client hooks required at this level; interactive parts are encapsulated
 * in features (SearchInput, AuthButton, ThemeToggle are each "use client").
 */

const NAV_LINKS = [
  { label: "Каталог", href: "/catalog" },
  { label: "Акции", href: "/sales" },
  { label: "Новинки", href: "/new" },
  { label: "О нас", href: "/about" },
] as const;

export interface HeaderDesktopProps {
  /** Number of items in cart; hides badge when 0 or undefined. */
  cartCount?: number;
  /** Extra classes on the outer <header> element. */
  className?: string;
}

export function HeaderDesktop({ cartCount, className }: HeaderDesktopProps) {
  return (
    <header
      className={cn(
        // full-width bar: card bg, bottom border (height lives on inner container)
        "w-full bg-card border-b border-border",
        className,
      )}
    >
      {/* Inner column — aligned to the site content width (same as Footer) */}
      <div className="mx-auto flex h-18 max-w-[1328px] flex-row items-center gap-6 px-4">
        {/* Logo — size 18 matches Pencil wordmark 18px / mark proportions */}
        <Link href="/" aria-label="На главную" className="shrink-0">
          <Logo size={18} />
        </Link>

        {/* Nav links — gap 4, each: rounded-md, px-3 py-2, font-sans 14px medium */}
        <nav aria-label="Навигация" className="flex flex-row items-center gap-1 shrink-0">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-2",
                "font-sans text-sm font-medium text-muted-foreground",
                "transition-colors hover:bg-muted hover:text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Search — fills remaining space */}
        <div className="flex-1 min-w-0">
          <SearchInput />
        </div>

        {/* Actions: ThemeToggle | AuthButton | Cart */}
        <div className="flex flex-row items-center gap-2 shrink-0">
          {/* Theme toggle — 40×40 ghost icon button */}
          <ThemeToggle />

          {/* Profile / auth — 40×40 ghost icon button */}
          <AuthButton />

          {/* Cart — ghost icon link with optional CartBadge overlay */}
          <div className="relative">
            <Link
              href="/cart"
              aria-label="Корзина"
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-md",
                "text-foreground transition-colors",
                "hover:bg-muted hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <ShoppingBag className="size-4.5" aria-hidden="true" />
            </Link>
            {cartCount != null && cartCount > 0 && (
              <Badge
                variant="cartBadge"
                className="pointer-events-none absolute right-0 top-1.5 -translate-y-1/2 translate-x-1/2"
                aria-label={`${cartCount} товар(а) в корзине`}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
