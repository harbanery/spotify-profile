"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserProfile } from "@/features/web/types";

/**
 * Store sesi web: status login Spotify untuk seluruh halaman (web).
 * Sumber data: /api/web/auth/session (cookie httpOnly, server-side).
 * Navigasi login/logout (URL route handler) ditangani komponen tombol.
 */

type SessionStatus = "loading" | "authenticated" | "anonymous";

interface WebSessionValue {
  status: SessionStatus;
  user: UserProfile | null;
}

const WebSessionContext = createContext<WebSessionValue | null>(null);

export function WebSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/web/auth/session")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { authenticated?: boolean; user?: UserProfile } | null) => {
        if (cancelled) return;
        if (data?.authenticated && data.user) {
          setStatus("authenticated");
          setUser(data.user);
        } else {
          setStatus("anonymous");
          setUser(null);
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("anonymous");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<WebSessionValue>(() => ({ status, user }), [status, user]);

  return (
    <WebSessionContext.Provider value={value}>
      {children}
    </WebSessionContext.Provider>
  );
}

export function useWebSession(): WebSessionValue {
  const context = useContext(WebSessionContext);
  if (!context) {
    throw new Error("useWebSession harus dipakai di dalam WebSessionProvider");
  }
  return context;
}
