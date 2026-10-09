import { redirect } from "next/navigation";

/** /admin → список пользователей (единственный раздел админки). */
export default function AdminRootRoute() {
  redirect("/admin/users");
}
