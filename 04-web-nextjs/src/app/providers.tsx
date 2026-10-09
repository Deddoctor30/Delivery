"use client";

import type { User } from "@/entities/user";
import type { CartItem } from "@/entities/cart";
import { SessionProvider } from "@/features/auth";
import { CartProvider } from "@/features/cart";
import { FavoritesProvider } from "@/features/favorite";
import { Toaster } from "@/shared/ui";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function Providers({
  initialUser,
  initialCartLines,
  initialFavoriteIds,
  children,
}: {
  initialUser: User | null;
  initialCartLines: CartItem[];
  initialFavoriteIds: string[];
  children: ReactNode;
}) {
  const isAuthenticated = initialUser != null;
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <SessionProvider initialUser={initialUser}>
        <CartProvider isAuthenticated={isAuthenticated} initialLines={initialCartLines}>
          <FavoritesProvider isAuthenticated={isAuthenticated} initialIds={initialFavoriteIds}>
            {children}
          </FavoritesProvider>
        </CartProvider>
      </SessionProvider>
      <Toaster />
    </ThemeProvider>
  );
}
