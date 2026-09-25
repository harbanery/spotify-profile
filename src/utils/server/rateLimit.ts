import "server-only";

/**
 * Rate limit internal (token bucket per sesi) — P0 proteksi kuota dari
 * rekomendasi_feature.md: melindungi kuota rate limit Spotify yang sempit
 * (mode development, rolling window 30 detik) dari pemanggilan berlebihan
 * lewat route internal, sekaligus membatasi efek skrip yang memakai cookie
 * sesi si user. In-memory per proses — cukup untuk single-instance/dev.
 */

const buckets = new Map<string, { tokens: number; at: number }>();

/**
 * Izinkan satu request untuk `key` (token bucket): `limit` token dalam
 * jendela `windowMs`, token terisi ulang proporsional seiring waktu.
 */
export const allowRequest = (
  key: string,
  limit = 30,
  windowMs = 60_000,
): boolean => {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: limit, at: now };

  // Isi ulang token sejak pemeriksaan terakhir, maksimal penuh.
  const refill = ((now - bucket.at) / windowMs) * limit;
  const tokens = Math.min(limit, bucket.tokens + refill);

  if (tokens < 1) {
    buckets.set(key, { tokens, at: now });
    return false;
  }

  buckets.set(key, { tokens: tokens - 1, at: now });
  return true;
};

/**
 * Kunci kuota per pengguna: ekor access token — unik per sesi login dan
 * ikut berganti saat token di-refresh, tanpa perlu memanggil /me.
 */
export const quotaKey = (accessToken: string): string =>
  accessToken.slice(-16);
