import Link from "next/link";

import { AdminTopbar } from "@/widgets/admin-topbar";
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
} from "@/shared/ui";

export interface AdminUserNotFoundProps {
  /** id из URL — чтобы отобразить в хлебных крошках и сообщении. */
  userId: string;
}

/**
 * Состояние «Пользователь не найден» для /admin/users/[id].
 * Pencil node s7IiO → «Tile Не найдено».
 */
export function AdminUserNotFound({ userId }: AdminUserNotFoundProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AdminTopbar />

      <main className="flex w-full flex-1 flex-col gap-6 px-20 pb-16 pt-7">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/admin" />}>Админка</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/admin/users" />}>
                Пользователи
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Не найден</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <EmptyState
          icon={<Illustration name="not-found" size={120} />}
          title="Пользователь не найден"
          description={`Пользователь с ID ${userId} не существует или был удалён.`}
          action={
            <Button variant="outline" render={<Link href="/admin/users" />}>
              Вернуться к списку
            </Button>
          }
        />
      </main>
    </div>
  );
}
