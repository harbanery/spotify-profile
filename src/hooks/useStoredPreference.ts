"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Preferensi yang tersimpan di localStorage, dimodelkan sebagai external
 * store lewat useSyncExternalStore — menghindari setState sinkron di
 * effect (aturan react-hooks/set-state-in-effect) sekaligus mencegah
 * hydration mismatch: render server memakai fallback, nilai tersimpan
 * baru dibaca client setelah hidrasi. Perubahan nilai menyapa semua
 * subscriber (termasuk tab lain lewat event "storage").
 */

const listeners = new Set<() => void>();

const emit = (): void => listeners.forEach((listener) => listener());

const subscribe = (callback: () => void): (() => void) => {
  listeners.add(callback);
  // Sinkron antar-tab: event "storage" menyala saat tab lain mengubah
  // key yang sama.
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
};

/**
 * Baca preferensi dari localStorage (fallback bila belum ada/tersimpan
 * tidak valid) beserta setter-nya. Hanya nilai dalam `values` yang
 * dianggap valid — lainnya jatuh kembali ke fallback.
 */
export function useStoredPreference<T extends string>(
  key: string,
  fallback: T,
  values: readonly T[],
): [T, (value: T) => void] {
  // subscribe adalah fungsi level modul — referensinya selalu stabil,
  // jadi tidak perlu dibungkus useCallback.
  const stored = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );

  const value = values.includes(stored as T) ? (stored as T) : fallback;

  const setValue = useCallback(
    (next: T) => {
      try {
        localStorage.setItem(key, next);
      } catch {
        // Penyimpanan gagal (mode privat/kouta) — abaikan, snapshot
        // berikutnya tetap memakai nilai tersimpan sebelumnya.
      }
      emit();
    },
    [key],
  );

  return [value, setValue];
}
