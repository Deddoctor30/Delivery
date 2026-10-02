import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { getCurrentUser } from "@/features/auth/api/bridge";

import "./globals.css";
import { Providers } from "./providers";

import { ThemeToggle } from "@/features/theme-toggle";
import { Toaster } from "sonner";
import { AuthButton } from "@/features/auth";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Delivery",
  description: "Маркетплейс с доставкой по России",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="ru"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers initialUser={user}>
          <header className="border-b">
            <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-4">
              <span className="font-semibold">Delivery</span>
              <div className="flex items-center gap-1">
                <AuthButton />
                <ThemeToggle />
              </div>
            </div>
          </header>
          <div className="mx-auto w-full max-w-[1100px] flex-1 px-4">{children}</div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
