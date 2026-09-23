"use client";

import { Alert } from "antd";
import { CustomerServiceOutlined } from "@ant-design/icons";
import SpotifyLoginButton from "@/features/web/components/ui/SpotifyLoginButton";

/** Pesan ramah untuk tiap kode ?auth_error dari route handler auth. */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  unconfigured:
    "Kredensial Spotify belum dikonfigurasi. Isi SPOTIFY_CLIENT_ID di .env.local (lihat .env.example), lalu jalankan ulang npm run dev.",
  invalid_callback: "Callback login tidak valid. Silakan coba login ulang.",
  state_mismatch: "Parameter state tidak cocok. Silakan coba login ulang.",
  token_exchange_failed:
    "Gagal menukar kode autorisasi dengan token. Silakan coba lagi.",
  access_denied: "Login dibatalkan atau akses ditolak.",
  unregistered_origin:
    "Halaman ini dibuka dari origin yang belum terdaftar di Spotify.",
};

interface LoginSectionProps {
  authError?: string;
  /** Origin yang ditolak (untuk pesan unregistered_origin). */
  origin?: string;
}

/** Tampilkan origin hanya bila formatnya wajar (http/https tanpa path). */
const safeOrigin = (origin?: string): string | null => {
  if (!origin) return null;
  return /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(origin) ? origin : null;
};

/**
 * Halaman login ala Spotify, satu layar penuh (h-screen): logo, ajakan
 * masuk, tombol OAuth, dan pesan error bila alur login gagal.
 * Web ini read-only — hanya membaca statistik (lagu, artis, playlist),
 * tidak melakukan pemutaran maupun perubahan pada akun.
 */
export default function LoginSection({ authError, origin }: LoginSectionProps) {
  const rejectedOrigin = safeOrigin(origin);
  const errorMessage = authError
    ? (AUTH_ERROR_MESSAGES[authError] ?? AUTH_ERROR_MESSAGES.invalid_callback)
    : null;
  const detail =
    authError === "unregistered_origin" && rejectedOrigin
      ? `Origin ${rejectedOrigin} belum terdaftar. Tambahkan ${rejectedOrigin}/api/web/auth/callback ke Redirect URIs di Spotify Developer Dashboard dan SPOTIFY_REDIRECT_URIS di .env.local, atau buka aplikasi lewat origin yang sudah terdaftar.`
      : null;

  return (
    <div className="flex h-dvh flex-col items-center justify-center overflow-y-auto bg-gradient-to-b from-[#1e3264] via-base to-base px-6 py-10 text-center scrollbar-thin">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex size-20 items-center justify-center rounded-full bg-spotify shadow-2xl">
          <CustomerServiceOutlined className="text-4xl! text-black!" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Log in to Spotify Profile
          </h1>
          <p className="text-sm text-subdued">
            Masuk dengan akun Spotify untuk melihat statistik personalmu: lagu
            dan artis teratas, serta playlist yang sering kamu dengar.
          </p>
        </div>

        {errorMessage ? (
          <div className="w-full">
            <Alert type="error" showIcon message={errorMessage} description={detail} />
          </div>
        ) : null}

        <SpotifyLoginButton size="large" />

        <p className="text-xs leading-relaxed text-subdued">
          Akses bersifat baca-saja (read-only). Web ini bukan media player —
          tidak ada pemutaran lagu atau perubahan pada akun Spotify-mu.
        </p>
      </div>
    </div>
  );
}
