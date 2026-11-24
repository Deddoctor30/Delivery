import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import type { User } from "@/entities/user";
import { setOnSessionExpired } from "@/shared/api/auth-fetch";
import { getAccessToken } from "@/shared/api/token-store";

import { logout as apiLogout, fetchMe } from "../api/auth";

type SessionValue = {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Разлогин при протухшей сессии (refresh не удался).
  useEffect(() => {
    setOnSessionExpired(() => setUser(null));
    return () => setOnSessionExpired(null);
  }, []);

  // Гидрация при старте: есть access → тянем профиль.
  useEffect(() => {
    void (async () => {
      if (await getAccessToken()) {
        try {
          setUser(await fetchMe());
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession должен быть внутри SessionProvider");
  return ctx;
}
