import type { Metadata } from "next";
import { AccountPage } from "@/views/account";

export const metadata: Metadata = {
  title: "Личный кабинет — Delivery",
};

export default function AccountRoute() {
  return <AccountPage />;
}
