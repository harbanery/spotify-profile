import "server-only";

/**
 * Cache TTL + single-flight sederhana di memori proses (cukup untuk
 * single-instance/dev; naik ke Redis bila multi-instance). Bagian P0
 * "proteksi kuota" dari rekomendasi_feature.md: memangkas pemanggilan
 * Spotify untuk data yang berubah lambat dan mendedupe panggilan
 * bersamaan dengan key yang sama.
 */

interface CacheEntry {
  /** Waktu penyimpanan (epoch ms). */
  at: number;
  data: unknown;
}

const store = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<unknown>>();

/**
 * Ambil data dari cache bila masih segar; jika tidak, jalankan `load`
 * sekali (panggilan bersamaan berbagi promise yang sama) lalu simpan
 * hasilnya selama `ttlMs`. Hasil null/undefined tidak di-cache agar
 * kegagalan tidak terkunci.
 */
export const cached = async <T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T | null>,
): Promise<T | null> => {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttlMs) {
    return hit.data as T;
  }

  // Single-flight: panggilan bersamaan untuk key yang sama berbagi load.
  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T | null>;

  const task = load()
    .then((data) => {
      if (data !== null && data !== undefined) {
        store.set(key, { at: Date.now(), data });
      }
      return data;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, task);
  return task;
};
