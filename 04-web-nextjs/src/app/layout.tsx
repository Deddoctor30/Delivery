import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { getCurrentUser } from "@/features/auth/api/bridge";
import { getCart } from "@/entities/cart";
import { getFavoriteIds } from "@/entities/favorite/api";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/shared/config/site";

import "./globals.css";
import { Providers } from "./providers";

import { Funnel_Sans, Geist } from "next/font/google";
import { Footer } from "@/widgets/footer";
import { HeaderDesktop, HeaderMobile } from "@/widgets/header";
import { CookieBanner } from "@/features/cookie-consent";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"], display: "swap" });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const funnelSans = Funnel_Sans({ variable: "--font-funnel", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Delivery — маркетплейс с доставкой по России",
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ru_RU",
    title: "Delivery — маркетплейс с доставкой по России",
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  // Серверная корзина и избранное — только для авторизованных; при ошибке (протух токен) — пусто.
  const initialCart = user ? await getCart().catch(() => null) : null;
  const initialFavoriteIds = user ? await getFavoriteIds().catch(() => []) : [];

  return (
    <html
      lang="ru"
      className={`${inter.variable} ${geist.variable} ${funnelSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers
          initialUser={user}
          initialCartLines={initialCart?.items ?? []}
          initialFavoriteIds={initialFavoriteIds}
        >
          {/* Responsive header: desktop bar ≥ md, mobile bar < md */}
          <HeaderDesktop className="hidden md:block" />
          <HeaderMobile className="block md:hidden" />
          <main className="mx-auto w-full max-w-332 flex-1 px-4">{children}</main>
          <Footer />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
