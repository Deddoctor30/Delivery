import Link from "next/link";
import { Logo } from "@/shared/ui";

const NAV_LINKS = [
  { label: "О магазине", href: "/legal/about" },
  { label: "Политика обработки ПД", href: "/legal/privacy" },
  { label: "Политика cookies", href: "/legal/cookies" },
] as const;

/**
 * Site-wide footer.
 * Pencil node ZOQzm — fill $--card, border-top $--border, padding [36,40], gap 32.
 * RSC-compatible (no client hooks or event handlers).
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border w-full">
      <div className="mx-auto max-w-[1100px] px-4 py-9 flex flex-col gap-8">
        {/* Nav links row */}
        <nav aria-label="Навигация по сайту" className="flex flex-wrap gap-x-8 gap-y-2">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Divider — Pencil: rectangle fill $--border, height 1 */}
        <hr className="border-0 border-t border-border" />

        {/* Copyright row — Logo + copyright */}
        <div className="flex items-center gap-2.5">
          {/* Logo from shared/ui — size 18 matches Pencil Mark 18×18 */}
          <Logo size={18} />
          {/* Copyright — Funnel Sans 12px muted-foreground */}
          <span className="font-caption text-xs text-muted-foreground">
            © {year} Delivery. Все права защищены.
          </span>
        </div>
      </div>
    </footer>
  );
}
