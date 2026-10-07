"use client";

import type { User } from "@/entities/user";
import type { CartItem } from "@/entities/cart";
import { SessionProvider } from "@/features/auth";
import { CartProvider } from "@/features/cart";
import { Toaster } from "@/shared/ui";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function Providers({
  initialUser,
  initialCartLines,
  children,
}: {
  initialUser: User | null;
  initialCartLines: CartItem[];
  children: ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <SessionProvider initialUser={initialUser}>
        <CartProvider isAuthenticated={initialUser != null} initialLines={initialCartLines}>
          {children}
        </CartProvider>
      </SessionProvider>
      <Toaster />
    </ThemeProvider>
  );
}
