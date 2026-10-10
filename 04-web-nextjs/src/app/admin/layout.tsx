import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/api/bridge";

/**
 * Guard админ-зоны: edge-proxy проверяет только наличие куки (роль из JWT там не
 * расшифровать), поэтому ролевой гейт держим в RSC-layout. Не-ADMIN → на главную.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") redirect("/");
  return <>{children}</>;
}
