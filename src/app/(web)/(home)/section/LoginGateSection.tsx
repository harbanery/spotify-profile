"use client";

import { Alert } from "antd";
import { CustomerServiceOutlined } from "@ant-design/icons";
import SpotifyLoginButton from "@/features/web/components/ui/SpotifyLoginButton";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { TranslationKey } from "@/components/i18n/translations";

/** Kode ?auth_error dari route handler auth → key terjemahan pesan. */
const AUTH_ERROR_KEYS: Record<string, TranslationKey> = {
  unconfigured: "authError.unconfigured",
  invalid_callback: "authError.invalidCallback",
  state_mismatch: "authError.stateMismatch",
  token_exchange_failed: "authError.tokenExchange",
  access_denied: "authError.accessDenied",
  unregistered_origin: "authError.unregisteredOrigin",
};

interface LoginGateSectionProps {
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
 * Gerbang login di beranda: tampilan ala halaman login satu layar penuh
 * (h-screen) saat belum login Spotify — statistik personal muncul setelah
 * masuk. Web ini read-only, bukan media player. Teks mengikuti locale
 * aktif (LanguageToggle di navbar halaman login-nya tidak tampil, jadi
 * default "en" berlaku di sini).
 */
export default function LoginGateSection({
  authError,
  origin,
}: LoginGateSectionProps) {
  const { t } = useLocale();
  const rejectedOrigin = safeOrigin(origin);
  const errorKey = authError
    ? (AUTH_ERROR_KEYS[authError] ?? AUTH_ERROR_KEYS.invalid_callback)
    : null;
  const errorMessage = errorKey ? t(errorKey) : null;
  const detail =
    authError === "unregistered_origin" && rejectedOrigin
      ? t("authError.unregisteredOriginDetail", { origin: rejectedOrigin })
      : null;

  return (
    <div className="flex h-dvh flex-col items-center justify-center overflow-y-auto bg-gradient-to-b from-[#1e3264] via-base to-base px-6 py-10 text-center scrollbar-thin">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex size-20 items-center justify-center rounded-full bg-spotify shadow-2xl">
          <CustomerServiceOutlined className="text-4xl! text-black!" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            {t("loginGate.title")}
          </h1>
          <p className="text-sm text-subdued">{t("loginGate.description")}</p>
        </div>

        {errorMessage ? (
          <div className="w-full">
            <Alert
              type="error"
              showIcon
              message={errorMessage}
              description={detail}
            />
          </div>
        ) : null}

        <SpotifyLoginButton size="large" />

        <p className="text-xs leading-relaxed text-subdued">
          {t("loginGate.note")}
        </p>
      </div>
    </div>
  );
}
