"use client";

import { APP_NAME } from "@/utils/config/variables";
import { useLocale } from "@/components/i18n/LocaleProvider";

/** Tahun berjalan untuk baris hak cipta. */
const YEAR = new Date().getFullYear();

/**
 * Footer web statistik: identitas aplikasi dan atribusi data Spotify.
 * Konten disejajarkan dengan lebar konten utama (max-w-5xl) di tengah;
 * teks mengikuti locale aktif, warna mengikuti tema aktif.
 */
export default function WebFooter() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-line px-4 py-8 md:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
        <div>
          <p className="text-sm font-bold text-ink">{APP_NAME}</p>
          <p className="text-xs text-subdued">{t("footer.tagline")}</p>
        </div>
        <p className="text-xs text-subdued">
          {t("footer.data", { year: YEAR })}
        </p>
      </div>
    </footer>
  );
}
