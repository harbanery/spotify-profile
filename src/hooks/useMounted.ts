"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Guard hydration: false saat SSR/render pertama, true setelah mount di client.
 * Memakai useSyncExternalStore agar tidak ada setState di dalam effect.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
