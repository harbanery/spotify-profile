import type { ReactNode } from "react";

/**
 * Baris horizontal yang bisa discroll — menampung kartu playlist/artis.
 */
export default function MediaRow({ children }: { children: ReactNode }) {
  return (
    <div className="scrollbar-thin -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
      {children}
    </div>
  );
}
