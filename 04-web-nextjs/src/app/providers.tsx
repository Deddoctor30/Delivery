"use client";

import type { User } from "@/entities/user";
import { SessionProvider } from "@/features/auth";
import { Toaster } from "@/shared/ui";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function Providers({
  initialUser,
  children,
}: {
  initialUser: User | null;
  children: ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <SessionProvider initialUser={initialUser}>{children}</SessionProvider>
      <Toaster />
    </ThemeProvider>
  );
}
