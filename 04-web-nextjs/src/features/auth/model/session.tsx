"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import type { User } from "@/entities/user";

type SessionContextValue = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  initialUser,
  children,
}: {
  initialUser: User | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(initialUser);

  const refetch = useCallback(async () => {
    let res = await fetch("/api/auth/me", { cache: "no-store" });
    if (res.status === 401) {
      const refreshed = await fetch("/api/auth/refresh", { method: "POST" });
      if (refreshed.ok) res = await fetch("/api/auth/me", { cache: "no-store" });
    }
    const data = res.ok ? await res.json() : { user: null };
    setUser(data.user ?? null);
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  return (
    <SessionContext.Provider value={{ user, setUser, logout, refetch }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession должен использоваться внутри SessionProvider");
  return ctx;
}
