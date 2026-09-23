import type { ReactNode } from "react";
import { WebSessionProvider } from "@/features/web/hooks/session";

/**
 * Shell web profil — tanpa sidebar, navbar, dan player bar:
 * web ini fokus statistik profil pengguna, bukan media player.
 */
export default function WebLayout({ children }: { children: ReactNode }) {
  return (
    <main className="scrollbar-thin h-dvh overflow-y-auto bg-base">
      <WebSessionProvider>{children}</WebSessionProvider>
    </main>
  );
}
