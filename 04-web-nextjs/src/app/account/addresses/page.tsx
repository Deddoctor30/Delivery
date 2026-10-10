import type { Metadata } from "next";

import { getAddresses } from "@/entities/address/api";
import { AccountAddressesPage } from "@/views/account-addresses";

export const metadata: Metadata = {
  title: "Адреса доставки — Delivery",
};

/**
 * Роут /account/addresses (приватный — guard в proxy.ts по /account/:path*).
 * Адреса тянем на сервере и отдаём пропсом в клиентский экран.
 */
export default async function AccountAddressesRoute() {
  const addresses = await getAddresses();
  return <AccountAddressesPage initialAddresses={addresses} />;
}
