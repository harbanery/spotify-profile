/**
 * Kamus terjemahan UI (en default / id) — konvensi struktur proyek:
 * dipakai LocaleProvider + LanguageToggle (components/i18n).
 */

const en = {
  "nav.loading": "Loading...",
  "nav.login": "Log in with Spotify",
  "nav.logout": "Log out",

  "loginGate.title": "Log in to Spotify Profile",
  "loginGate.description":
    "Masuk dengan akun Spotify untuk melihat statistik personalmu: lagu yang sedang diputar serta lagu dan artis teratas.",
  "loginGate.note":
    "Akses bersifat baca-saja (read-only). Web ini bukan media player — tidak ada pemutaran lagu atau perubahan pada akun Spotify-mu.",

  "authError.unconfigured":
    "Kredensial Spotify belum dikonfigurasi. Isi SPOTIFY_CLIENT_ID di .env.local (lihat .env.example), lalu jalankan ulang npm run dev.",
  "authError.invalidCallback":
    "Callback login tidak valid. Silakan coba login ulang.",
  "authError.stateMismatch":
    "Parameter state tidak cocok. Silakan coba login ulang.",
  "authError.tokenExchange":
    "Gagal menukar kode autorisasi dengan token. Silakan coba lagi.",
  "authError.accessDenied": "Login dibatalkan atau akses ditolak.",
  "authError.unregisteredOrigin":
    "Halaman ini dibuka dari origin yang belum terdaftar di Spotify.",
  "authError.unregisteredOriginDetail":
    "Origin {origin} belum terdaftar. Tambahkan {origin}/api/web/auth/callback ke Redirect URIs di Spotify Developer Dashboard dan SPOTIFY_REDIRECT_URIS di .env.local, atau buka aplikasi lewat origin yang sudah terdaftar.",

  "profile.publicPlaylists": "{count} public playlists",
  "profile.followers": "{count} followers",

  "nowPlaying.now": "Now playing",
  "nowPlaying.last": "Last playing",
  "nowPlaying.from": "From",

  "filter.shortTerm": "This month",
  "filter.longTerm": "This year",

  "layout.grid": "Grid",
  "layout.list": "List",

  "section.topArtists": "Top artists",
  "section.topTracks": "Top tracks",

  "empty.topArtists": "No top artists yet",
  "empty.topTracks": "No top tracks yet",

  "footer.tagline": "Statistik pendengaran pribadi — bukan media player.",
  "footer.data": "Data © {year} Spotify, via Spotify Web API • Akses baca-saja",

  "notFound.title": "Page not found",
  "notFound.description": "Kami tidak menemukan halaman yang kamu cari.",
  "notFound.back": "Back to home",

  "error.title": "Something went wrong",
  "error.fallback": "Terjadi kesalahan yang tidak terduga.",
  "error.retry": "Try again",
};

const id: typeof en = {
  "nav.loading": "Memuat...",
  "nav.login": "Masuk dengan Spotify",
  "nav.logout": "Keluar",

  "loginGate.title": "Masuk ke Spotify Profile",
  "loginGate.description":
    "Masuk dengan akun Spotify untuk melihat statistik personalmu: lagu yang sedang diputar serta lagu dan artis teratas.",
  "loginGate.note":
    "Akses bersifat baca-saja. Web ini bukan media player — tidak ada pemutaran lagu atau perubahan pada akun Spotify-mu.",

  "authError.unconfigured":
    "Kredensial Spotify belum dikonfigurasi. Isi SPOTIFY_CLIENT_ID di .env.local (lihat .env.example), lalu jalankan ulang npm run dev.",
  "authError.invalidCallback":
    "Callback login tidak valid. Silakan coba login ulang.",
  "authError.stateMismatch":
    "Parameter state tidak cocok. Silakan coba login ulang.",
  "authError.tokenExchange":
    "Gagal menukar kode otorisasi dengan token. Silakan coba lagi.",
  "authError.accessDenied": "Login dibatalkan atau akses ditolak.",
  "authError.unregisteredOrigin":
    "Halaman ini dibuka dari origin yang belum terdaftar di Spotify.",
  "authError.unregisteredOriginDetail":
    "Origin {origin} belum terdaftar. Tambahkan {origin}/api/web/auth/callback ke Redirect URIs di Spotify Developer Dashboard dan SPOTIFY_REDIRECT_URIS di .env.local, atau buka aplikasi lewat origin yang sudah terdaftar.",

  "profile.publicPlaylists": "{count} playlist publik",
  "profile.followers": "{count} pengikut",

  "nowPlaying.now": "Sedang diputar",
  "nowPlaying.last": "Terakhir diputar",
  "nowPlaying.from": "Dari",

  "filter.shortTerm": "Bulan ini",
  "filter.longTerm": "Tahun ini",

  "layout.grid": "Grid",
  "layout.list": "List",

  "section.topArtists": "Artis teratas",
  "section.topTracks": "Lagu teratas",

  "empty.topArtists": "Belum ada artis teratas",
  "empty.topTracks": "Belum ada lagu teratas",

  "footer.tagline": "Statistik pendengaran pribadi — bukan media player.",
  "footer.data": "Data © {year} Spotify, via Spotify Web API • Akses baca-saja",

  "notFound.title": "Halaman tidak ditemukan",
  "notFound.description": "Kami tidak menemukan halaman yang kamu cari.",
  "notFound.back": "Kembali ke beranda",

  "error.title": "Terjadi kesalahan",
  "error.fallback": "Terjadi kesalahan yang tidak terduga.",
  "error.retry": "Coba lagi",
};

export type Locale = "en" | "id";
export type TranslationKey = keyof typeof en;
export const translations: Record<Locale, typeof en> = { en, id };
