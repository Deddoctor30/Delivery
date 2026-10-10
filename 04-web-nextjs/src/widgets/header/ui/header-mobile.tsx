"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";

import { Logo, Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { AuthButton } from "@/features/auth";
import { ThemeToggle } from "@/features/theme-toggle";
import { CartBadge } from "@/features/cart";

/**
 * Mobile site header.
 *
 * Pencil node Q7FFb — HeaderMobile:
 *   width: 390, height: 60
 *   fill: $--card, stroke-bottom: $--border 1px (strokeAlignment: inner)
 *   layout: horizontal, padding: [0, 16], justifyContent: space_between, alignItems: center
 *
 * Blocks (left→right):
 *   Logo (mark 24px, brand 16px Geist 600) | Actions (search 36px, cart 36px, menu 36px)
 *
 * Menu opens a Sheet (side="right" боковой drawer) — заменил Dialog на Sheet.
 * SearchInput is NOT embedded here — it is a separate interactive widget; tapping the
 * search icon navigates to /search (avoids pulling heavy autocomplete into the header).
 *
 * "use client" — required because Sheet state (open/close) lives here.
 *
 * CategoryNav is NOT embedded — it lives in widgets/category-nav, same layer import
 * is prohibited by FSD.
 */

const NAV_LINKS = [
  { label: "Каталог", href: "/catalog" },
  { label: "Акции", href: "/sales" },
  { label: "Новинки", href: "/new" },
  { label: "О нас", href: "/about" },
] as const;

export interface HeaderMobileProps {
  /** Extra classes on the outer <header> element. */
  className?: string;
}

export function HeaderMobile({ className }: HeaderMobileProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        // full-width bar: card bg, bottom border (height lives on inner container)
        "w-full bg-card border-b border-border",
        className,
      )}
    >
      {/* Inner column — aligned to the site content width (same as Footer/desktop) */}
      <div className="mx-auto flex h-[60px] max-w-[1328px] flex-row items-center justify-between px-4">
        {/* Logo — mark 24px, brand text 16px (Pencil: mark 24×24, font 16px Geist 600) */}
        <Link href="/" aria-label="На главную" className="shrink-0">
          <Logo size={16} />
        </Link>

        {/* Actions — gap 4px (Pencil: gap 4), each button 36×36 */}
        <div className="flex flex-row items-center gap-1">
          {/* Search icon — navigates to /search page */}
          <Link
            href="/search"
            aria-label="Поиск"
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-md",
              "text-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <Search className="size-[18px]" aria-hidden="true" />
          </Link>

          {/* Cart icon — link with optional cartBadge overlay */}
          <div className="relative">
            <Link
              href="/cart"
              aria-label="Корзина"
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-md",
                "text-foreground transition-colors",
                "hover:bg-muted hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <ShoppingBag className="size-[18px]" aria-hidden="true" />
            </Link>
            <CartBadge />
          </div>

          {/* Burger menu — opens Sheet (right drawer) with nav links + actions */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              aria-label="Меню"
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-md",
                "text-foreground transition-colors",
                "hover:bg-muted hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {menuOpen ? (
                <X className="size-[18px]" aria-hidden="true" />
              ) : (
                <Menu className="size-[18px]" aria-hidden="true" />
              )}
            </SheetTrigger>

            <SheetContent side="right" showCloseButton={false} className="p-4 gap-4">
              {/* Accessible panel title (visually hidden) */}
              <SheetTitle className="sr-only">Навигация</SheetTitle>

              {/* Nav links */}
              <nav aria-label="Мобильная навигация" className="flex flex-col gap-1">
                {NAV_LINKS.map(({ label, href }) => (
                  <SheetClose key={href} render={<Link href={href} />}>
                    <span
                      className={cn(
                        "flex w-full rounded-md px-3 py-2.5",
                        "font-sans text-sm font-medium text-foreground",
                        "transition-colors hover:bg-muted",
                      )}
                    >
                      {label}
                    </span>
                  </SheetClose>
                ))}
              </nav>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Auth + theme row */}
              <div className="flex flex-row items-center justify-between gap-2 px-1">
                <AuthButton />
                <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
