"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  Badge,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

import type { AdminUser, UserRole } from "./types";

/* ── helpers ──────────────────────────────────────────────────────────── */

function getInitials(user: AdminUser): string {
  if (user.firstName && user.lastName) {
    return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
  }
  if (user.firstName) return user.firstName.charAt(0).toUpperCase();
  if (user.email) return user.email.charAt(0).toUpperCase();
  return "U";
}

function getDisplayName(user: AdminUser): string | null {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }
  return null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const ROLE_LABELS: Record<UserRole, string> = {
  CLIENT: "CLIENT",
  ADMIN: "ADMIN",
};

type RoleBadgeVariant = "default" | "primary";

function roleBadgeVariant(role: UserRole): RoleBadgeVariant {
  return role === "ADMIN" ? "primary" : "default";
}

/* ── UserRow ──────────────────────────────────────────────────────────── */

interface UserRowProps {
  user: AdminUser;
  highlighted?: boolean;
}

function UserRow({ user, highlighted }: UserRowProps) {
  const initials = getInitials(user);
  const displayName = getDisplayName(user);

  return (
    <Link
      href={`/admin/users/${user.id}`}
      className={cn(
        "group flex w-full items-center gap-4 px-5 py-3 transition-colors",
        highlighted ? "bg-secondary" : "hover:bg-secondary",
      )}
    >
      {/* TD: Пользователь */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar size="default" className="size-9 shrink-0">
          <AvatarFallback variant="muted" className="font-heading text-[13px]">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-heading text-sm font-medium text-foreground">
            {displayName ?? "—"}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            ID {user.id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* TD: Email */}
      <div className="w-[320px] truncate text-sm text-foreground">{user.email}</div>

      {/* TD: Роль */}
      <div className="w-35">
        <Badge variant={roleBadgeVariant(user.role)}>{ROLE_LABELS[user.role]}</Badge>
      </div>

      {/* TD: Регистрация */}
      <div className="w-45 font-mono text-[13px] text-muted-foreground">
        {formatDate(user.createdAt)}
      </div>

      {/* TD: Arrow */}
      <div className="flex w-10 justify-end">
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
    </Link>
  );
}

/* ── TableHeader ──────────────────────────────────────────────────────── */

function TableHeader() {
  return (
    <div className="flex w-full items-center gap-4 bg-secondary px-5 py-3">
      <div className="flex-1">
        <span className="font-caption text-xs font-semibold text-muted-foreground">
          Пользователь
        </span>
      </div>
      <div className="w-[320px]">
        <span className="font-caption text-xs font-semibold text-muted-foreground">Email</span>
      </div>
      <div className="w-35">
        <span className="font-caption text-xs font-semibold text-muted-foreground">Роль</span>
      </div>
      <div className="w-45">
        <span className="font-caption text-xs font-semibold text-muted-foreground">
          Регистрация
        </span>
      </div>
      <div className="w-10" />
    </div>
  );
}

/* ── TableFooter ──────────────────────────────────────────────────────── */

interface TableFooterProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const LIMIT_OPTIONS = [10, 20, 50, 100] as const;

function TableFooter({ total, page, limit, onPageChange, onLimitChange }: TableFooterProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = Math.min((page - 1) * limit + 1, total);
  const end = Math.min(page * limit, total);

  const pages = buildPagesArray(page, totalPages);

  return (
    <div className="flex w-full items-center justify-between gap-4 px-5 py-3.5">
      <span className="font-mono text-xs text-muted-foreground">
        Показано {start}–{end} из {total.toLocaleString("ru-RU")}
      </span>

      <div className="flex items-center gap-3">
        {/* Limit selector */}
        <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
          <SelectTrigger className="h-9 w-40 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIMIT_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} на странице
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Pagination */}
        <Pagination className="w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                text="Пред."
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) onPageChange(page - 1);
                }}
                aria-disabled={page <= 1}
                className={cn(page <= 1 && "pointer-events-none opacity-50")}
              />
            </PaginationItem>

            {pages.map((p, i) =>
              p === "ellipsis" ? (
                <PaginationItem key={`e-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === page}
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                text="След."
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) onPageChange(page + 1);
                }}
                aria-disabled={page >= totalPages}
                className={cn(page >= totalPages && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

/** Собирает массив страниц с ellipsis: [1, '…', 5, 6, 7, '…', 63] */
function buildPagesArray(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const result: (number | "ellipsis")[] = [];
  const delta = 1;

  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || (p >= current - delta && p <= current + delta)) {
      result.push(p);
    } else if (result.at(-1) !== "ellipsis") {
      result.push("ellipsis");
    }
  }
  return result;
}

/* ── UsersTable ──────────────────────────────────────────────────────── */

export interface UsersTableProps {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function UsersTable({
  users,
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
}: UsersTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
      <TableHeader />
      {users.map((user, idx) => (
        <div key={user.id}>
          <div className="h-px w-full bg-border" />
          <UserRow user={user} highlighted={idx % 2 === 1 /* чётные строки — secondary */} />
        </div>
      ))}
      <div className="h-px w-full bg-border" />
      <TableFooter
        total={total}
        page={page}
        limit={limit}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  );
}
