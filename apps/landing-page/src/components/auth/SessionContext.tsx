import React from "react";
import { createContext, useContext } from "react";
import { signOut, useSession as nextAuthUseSession } from "next-auth/react";
import type { Session } from "next-auth";

interface SessionContextType {
  user: Session["user"] | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data, status } = nextAuthUseSession();
  const user = data?.user ?? null;
  const loading = status === "loading";

  const logout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <SessionContext.Provider value={{ user, loading, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
