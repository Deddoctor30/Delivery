import type { Metadata } from "next";

import { getAdminUsers } from "@/entities/user/api";
import { AdminUsersPage } from "@/views/admin-users";

export const metadata: Metadata = {
  title: "Пользователи — Админка",
};

/**
 * Роут /admin/users (приватный + только ADMIN — guard в app/admin/layout).
 * Поиск/пагинация — через query-параметры; данные тянем на сервере.
 */
export default async function AdminUsersRoute(props: PageProps<"/admin/users">) {
  const sp = await props.searchParams;
  const search = typeof sp.search === "string" ? sp.search : "";
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;
  const limit = Number(sp.limit) > 0 ? Number(sp.limit) : 20;

  const { items, total } = await getAdminUsers({
    search: search || undefined,
    page,
    limit,
  });

  return <AdminUsersPage users={items} total={total} page={page} limit={limit} search={search} />;
}
