export const APP_NAME = "Spotify Profile";

export const APP_DESCRIPTION =
  "Web profil bergaya Spotify — dibangun dengan Next.js, Ant Design, dan Tailwind CSS. Saat ini masih menggunakan data dummy.";

export const OWNER_NAME = "Ryusu";

/**
 * Konfigurasi Spotify Web API (https://developer.spotify.com/documentation/web-api).
 * Isi SPOTIFY_CLIENT_ID di .env.local (lihat .env.example) setelah mendaftarkan
 * aplikasi di Spotify Developer Dashboard.
 */
export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID ?? "";
/** Opsional: hanya untuk aplikasi tipe "Web app" (confidential client). */
export const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET ?? "";
/** Harus persis sama dengan Redirect URIs di Dashboard Spotify. */
export const SPOTIFY_REDIRECT_URI =
  process.env.SPOTIFY_REDIRECT_URI ?? "http://localhost:3000/api/web/auth/callback";

/**
 * Daftar putih semua callback yang terdaftar di Dashboard Spotify (dipisah
 * koma). Login hanya boleh dimulai dari origin yang callback-nya ada di
 * daftar ini — mencegah error "redirect_uri: Not matching configuration"
 * dari Spotify dan cookie sesi yang tertukar domain.
 */
export const SPOTIFY_REDIRECT_URIS = (process.env.SPOTIFY_REDIRECT_URIS ?? "")
  .split(",")
  .map((uri) => uri.trim())
  .filter(Boolean);

/** Scope yang dibutuhkan web statistik profil ini. */
export const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
  "user-follow-read",
  "playlist-read-private",
  "playlist-read-collaborative",
].join(" ");

export const isSpotifyConfigured = (): boolean => SPOTIFY_CLIENT_ID.length > 0;
