import { APP_NAME } from "@/utils/config/variables";

/** Tahun berjalan untuk baris hak cipta. */
const YEAR = new Date().getFullYear();

/**
 * Footer web statistik: identitas aplikasi dan atribusi data Spotify.
 * Konten disejajarkan dengan lebar konten utama (max-w-5xl) di tengah.
 */
export default function WebFooter() {
  return (
    <footer className="border-t border-white/10 px-4 py-8 md:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
        <div>
          <p className="text-sm font-bold text-white">{APP_NAME}</p>
          <p className="text-xs text-subdued">
            Statistik pendengaran pribadi — bukan media player.
          </p>
        </div>
        <p className="text-xs text-subdued">
          Data © {YEAR} Spotify, via Spotify Web API • Akses baca-saja
        </p>
      </div>
    </footer>
  );
}
