"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  EmptyState,
  Illustration,
  Input,
} from "@/shared/ui";
import { AdminTopbar } from "@/widgets/admin-topbar";
import { useSession } from "@/features/auth";
import type { User } from "@/entities/user";

import { UsersTable } from "./users-table";

export interface AdminUsersPageProps {
  /** Страница пользователей с сервера. */
  users: User[];
  /** Всего пользователей (с учётом поиска). */
  total: number;
  page: number;
  limit: number;
  /** Текущий поисковый запрос (из URL). */
  search: string;
}

/**
 * AdminUsersPage — экран списка пользователей админки.
 * Данные приходят с сервера (RSC-роут), поиск и пагинация — через URL
 * (router.push), сервер перезапрашивает список. Доступ — только ADMIN (guard в layout).
 */
export function AdminUsersPage({ users, total, page, limit, search }: AdminUsersPageProps) {
  const router = useRouter();
  const { user, logout } = useSession();
  const [query, setQuery] = useState(search);

  // Дебаунс поиска → URL. Пропускаем, если значение не изменилось (напр. на маунте).
  useEffect(() => {
    if (query === search) return;
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("search", query.trim());
      params.set("page", "1");
      params.set("limit", String(limit));
      router.push(`/admin/users?${params.toString()}`);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function navigate(next: { page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    params.set("page", String(next.page ?? page));
    params.set("limit", String(next.limit ?? limit));
    router.push(`/admin/users?${params.toString()}`);
  }

  const adminName = user?.email ?? "admin";
  const adminInitials = (user?.email?.[0] ?? "A").toUpperCase();

  const isEmpty = total === 0 && !search;
  const isNotFound = users.length === 0 && !!search;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AdminTopbar
        adminName={adminName}
        adminInitials={adminInitials}
        onLogout={() => void logout().then(() => router.push("/"))}
      />

      <main className="flex w-full flex-1 flex-col gap-6 px-20 pb-16 pt-7">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/admin/users" />}>Админка</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Пользователи</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title row */}
        <div className="flex w-full items-end justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-heading text-[32px] font-semibold text-foreground">Пользователи</h1>
            <p className="font-mono text-[13px] text-muted-foreground">
              Всего {total.toLocaleString("ru-RU")} пользователей
            </p>
          </div>

          <div className="w-100">
            <Input
              type="search"
              placeholder="Поиск по email, имени или фамилии"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-full"
            />
          </div>
        </div>

        {/* Table area */}
        {isEmpty ? (
          <EmptyState
            icon={<Illustration name="no-orders" size={120} />}
            title="Пока нет пользователей"
            description="Как только появится первая регистрация, пользователь окажется в этом списке"
          />
        ) : isNotFound ? (
          <EmptyState
            icon={<Illustration name="not-found" size={120} />}
            title="Ничего не найдено"
            description={`По запросу «${search}» нет совпадений по email, имени или фамилии`}
            action={
              <Button variant="outline" onClick={() => setQuery("")}>
                Сбросить поиск
              </Button>
            }
          />
        ) : (
          <UsersTable
            users={users}
            total={total}
            page={page}
            limit={limit}
            onPageChange={(p) => navigate({ page: p })}
            onLimitChange={(l) => navigate({ page: 1, limit: l })}
          />
        )}
      </main>
    </div>
  );
}
