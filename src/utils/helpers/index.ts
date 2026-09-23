/**
 * Format detik menjadi "m:ss" (contoh 212 -> "3:32").
 */
export const formatDuration = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
};

/**
 * Format angka dengan pemisah ribuan (contoh 2450000 -> "2,450,000").
 */
export const formatCount = (value: number): string =>
  new Intl.NumberFormat("en-US").format(value);

/**
 * Format ringkas untuk jumlah besar (contoh 2450000 -> "2.4M").
 */
export const formatCompact = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return formatCount(value);
};

/**
 * Total durasi daftar lagu dalam format "X hr, Y min" atau "Y min, Z sec".
 */
export const formatTotalDuration = (durations: number[]): string => {
  const totalSeconds = durations.reduce((sum, duration) => sum + duration, 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours} hr ${minutes} min`;
  if (minutes > 0) return `${minutes} min ${seconds} sec`;
  return `${seconds} sec`;
};

/**
 * Kembalikan gambar utama, atau fallback bila kosong/tidak tersedia.
 */
export const displayImage = (
  src?: string | null,
  fallback = "/images/covers/cover-1.svg",
): string => (src && src.trim().length > 0 ? src : fallback);


