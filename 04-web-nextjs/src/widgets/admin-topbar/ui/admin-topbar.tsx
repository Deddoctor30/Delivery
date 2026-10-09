"use client";

import { LogOut, Users } from "lucide-react";

import { Avatar, AvatarFallback, Badge, Button, Logo } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

export interface AdminNavItem {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export interface AdminTopbarProps {
  /** Admin display name / email shown on the right. */
  adminName?: string;
  /** Initials shown in the avatar (max 2 chars). */
  adminInitials?: string;
  /** Navigation items rendered in the centre. Defaults to a "Users" link. */
  navItems?: AdminNavItem[];
  /** Called when the user clicks "Выйти". */
  onLogout?: () => void;
  /** Extra classes on the outer <header> element. */
  className?: string;
}

const DEFAULT_NAV: AdminNavItem[] = [
  {
    label: "Пользователи",
    icon: <Users className="size-4" aria-hidden="true" />,
    active: true,
  },
];

/**
 * AdminTopbar — top navigation bar for the admin area.
 *
 * Pencil node QLBNf · width 1240, height 64
 * fill: $--card, border-bottom: $--border 1px
 * layout: horizontal, gap 16, padding [0, 28], alignItems center
 *
 * Sections (left → right):
 *   Logo | Badge "Админка" | Nav (fill) | Avatar + name + LogoutButton
 *
 * DS primitives used:
 *   Logo, Badge (default), Avatar + AvatarFallback (primary), Button (ghost)
 */
export function AdminTopbar({
  adminName = "admin@delivery.ru",
  adminInitials = "АД",
  navItems = DEFAULT_NAV,
  onLogout,
  className,
}: AdminTopbarProps) {
  return (
    <header
      className={cn(
        "w-full bg-card border-b border-border",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1296px] flex-row items-center gap-4 px-7">
        {/* Left: brand */}
        <div className="flex shrink-0 items-center gap-3">
          <Logo size={18} />
          <Badge variant="default">Админка</Badge>
        </div>

        {/* Centre: nav items — fills remaining space */}
        <nav
          aria-label="Навигация администратора"
          className="flex flex-1 flex-row items-center gap-1 px-3"
        >
          {navItems.map(({ label, icon, active, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2",
                "font-sans text-sm font-semibold transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span className="text-primary">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Right: avatar + name + logout */}
        <div className="flex shrink-0 items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback variant="primary">{adminInitials}</AvatarFallback>
          </Avatar>

          <span className="font-sans text-[13px] font-medium text-foreground">
            {adminName}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            aria-label="Выйти из панели администратора"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Выйти
          </Button>
        </div>
      </div>
    </header>
  );
}
