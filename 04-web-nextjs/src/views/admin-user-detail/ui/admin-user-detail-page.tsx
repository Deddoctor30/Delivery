"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Mail, Phone, Calendar, Info } from "lucide-react";

import { OrderCard } from "@/entities/order";
import type { Order, OrderStatus } from "@/entities/order";
import { AdminTopbar } from "@/widgets/admin-topbar";
import { useSession } from "@/features/auth";
import { cancelOrderAsAdminAction } from "@/features/order";
import {
  Alert,
  AlertBody,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  EmptyState,
  Illustration,
  Pagination,
  PaginationContent,
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

import { CANCELABLE_STATUSES, type AdminUserDetail, type UserOrderStats } from "./types";

/* ── helpers ─────────────────────────────────────────────────────── */

const ORDERS_LIMIT = 6;

/** Статусы-фильтры в дропдауне */
const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Все статусы" },
  { value: "created", label: "Создан" },
  { value: "processing", label: "В обработке" },
  { value: "courier_picked_up", label: "Курьер забрал" },
  { value: "in_delivery", label: "В доставке" },
  { value: "arrived", label: "Прибыл" },
  { value: "completed", label: "Завершён" },
  { value: "cancelled", label: "Отменён" },
];

function isCancelable(status: OrderStatus): boolean {
  return (CANCELABLE_STATUSES as readonly string[]).includes(status);
}

function getInitials(user: AdminUserDetail): string {
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";
  return (first + last).toUpperCase() || (user.email[0] ?? "U").toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAmount(value: number): string {
  return value.toLocaleString("ru-RU") + " ₽";
}

/* ── props ────────────────────────────────────────────────────────── */

export interface AdminUserDetailPageProps {
  /** Профиль пользователя. */
  user: AdminUserDetail;
  /** Агрегированная статистика. */
  stats: UserOrderStats;
  /** Все заказы пользователя (список для пагинации). */
  orders: Order[];
  /** Общее число заказов в базе. */
  ordersTotal: number;
}

/* ── component ────────────────────────────────────────────────────── */

export function AdminUserDetailPage({
  user,
  stats,
  orders,
  ordersTotal,
}: AdminUserDetailPageProps) {
  const router = useRouter();
  const { user: admin, logout } = useSession();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [cancelling, startCancel] = useTransition();

  /* Отмена заказа админом → server action + обновление данных страницы. */
  function handleCancel(orderId: string) {
    startCancel(async () => {
      const res = await cancelOrderAsAdminAction(orderId);
      if (res.ok) {
        toast.success("Заказ отменён");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  /* Клиентская фильтрация по статусу */
  const filtered = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  /* Пагинация */
  const totalPages = Math.max(1, Math.ceil(filtered.length / ORDERS_LIMIT));
  const pageOrders = useMemo(() => {
    const start = (page - 1) * ORDERS_LIMIT;
    return filtered.slice(start, start + ORDERS_LIMIT);
  }, [filtered, page]);

  function handleFilterChange(value: string | null) {
    setStatusFilter(value ?? "all");
    setPage(1);
  }

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  const roleBadgeVariant = user.role === "ADMIN" ? ("primary" as const) : ("default" as const);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Topbar */}
      <AdminTopbar
        adminName={admin?.email ?? "admin"}
        adminInitials={(admin?.email?.[0] ?? "A").toUpperCase()}
        onLogout={() => void logout().then(() => router.push("/"))}
      />

      {/* Body */}
      <main className="flex w-full flex-1 flex-col gap-6 px-20 pb-16 pt-7">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/admin" />}>Админка</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/admin/users" />}>Пользователи</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{user.email}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back row */}
        <div className="flex w-full items-center gap-3">
          <Button variant="ghost" size="sm" render={<Link href="/admin/users" />}>
            <ArrowLeft className="size-4" aria-hidden="true" />К списку пользователей
          </Button>
          <span className="font-mono text-xs text-muted-foreground">/admin/users/{user.id}</span>
        </div>

        {/* Profile card */}
        <div
          className={cn(
            "flex w-full flex-row items-start gap-5 rounded-xl border border-border bg-card p-6",
          )}
        >
          {/* Avatar */}
          <Avatar size="lg" className="size-16 shrink-0">
            <AvatarFallback variant="primary" className="text-lg">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-3">
            {/* Name row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading text-2xl font-semibold text-foreground">{displayName}</h1>
              <Badge variant={roleBadgeVariant}>{user.role}</Badge>
              <span className="font-mono text-xs text-muted-foreground">ID {user.id}</span>
            </div>

            {/* Meta: email / phone / joined */}
            <div className="flex flex-wrap gap-4">
              <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                <Mail className="size-3.75 text-muted-foreground" aria-hidden="true" />
                {user.email}
              </span>
              {user.phone && (
                <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                  <Phone className="size-3.75 text-muted-foreground" aria-hidden="true" />
                  {user.phone}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                <Calendar className="size-3.75 text-muted-foreground" aria-hidden="true" />с нами с{" "}
                {formatDate(user.createdAt)}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex shrink-0 items-center gap-6 rounded-lg border border-border px-5 py-3">
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-mono text-xl font-bold text-foreground">
                {stats.totalOrders}
              </span>
              <span className="font-caption text-xs text-muted-foreground">заказов</span>
            </div>

            <div className="h-8 w-px bg-border" />

            <div className="flex flex-col items-end gap-0.5">
              <span className="font-mono text-xl font-bold text-foreground">
                {stats.activeOrders}
              </span>
              <span className="font-caption text-xs text-muted-foreground">активных</span>
            </div>

            <div className="h-8 w-px bg-border" />

            <div className="flex flex-col items-end gap-0.5">
              <span className="font-mono text-xl font-bold text-foreground">
                {formatAmount(stats.totalAmount)}
              </span>
              <span className="font-caption text-xs text-muted-foreground">на сумму</span>
            </div>
          </div>
        </div>

        {/* Cancel-rule alert */}
        <Alert variant="info">
          <AlertIcon>
            <Info aria-hidden="true" />
          </AlertIcon>
          <AlertBody>
            <AlertTitle>Отмена заказов</AlertTitle>
            <AlertDescription>
              Отменить можно только активные заказы со статусом: Создан, В обработке, Курьер забрал,
              В доставке, Прибыл.
            </AlertDescription>
          </AlertBody>
        </Alert>

        {/* Orders section */}
        <section className="flex w-full flex-col gap-5">
          {/* Section head */}
          <div className="flex w-full items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-[22px] font-semibold text-foreground">
                Заказы пользователя
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                {ordersTotal} заказов · показаны{" "}
                {filtered.length === 0
                  ? "0"
                  : `${(page - 1) * ORDERS_LIMIT + 1}–${Math.min(
                      page * ORDERS_LIMIT,
                      filtered.length,
                    )}`}
              </p>
            </div>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-50">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Orders grid or empty state */}
          {pageOrders.length === 0 ? (
            <EmptyState
              icon={<Illustration name="no-orders" size={120} />}
              title="Нет заказов"
              description={
                statusFilter === "all"
                  ? "У этого пользователя пока нет заказов"
                  : "По выбранному статусу заказов не найдено"
              }
              action={
                statusFilter !== "all" ? (
                  <Button variant="outline" onClick={() => handleFilterChange("all")}>
                    Сбросить фильтр
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid w-full grid-cols-2 gap-4">
              {pageOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancel={
                    isCancelable(order.status) && !cancelling
                      ? () => handleCancel(order.id)
                      : undefined
                  }
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex w-full flex-col items-center gap-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/admin/users/${user.id}?ordersPage=${page - 1}&ordersLimit=${ORDERS_LIMIT}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      aria-disabled={page === 1}
                      text="Назад"
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href={`/admin/users/${user.id}?ordersPage=${p}&ordersLimit=${ORDERS_LIMIT}`}
                        isActive={p === page}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href={`/admin/users/${user.id}?ordersPage=${page + 1}&ordersLimit=${ORDERS_LIMIT}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage(page + 1);
                      }}
                      aria-disabled={page === totalPages}
                      text="Вперёд"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <p className="font-mono text-xs text-muted-foreground">
                /admin/users/{user.id}?ordersPage={page}&amp;ordersLimit={ORDERS_LIMIT}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
