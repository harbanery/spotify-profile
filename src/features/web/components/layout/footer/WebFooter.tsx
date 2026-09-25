import { APP_NAME } from "@/utils/config/variables";

/**
 * Footer web statistik: identitas aplikasi dan atribusi data Spotify.
 * Konten disejajarkan dengan lebar konten utama (max-w-5xl) di tengah.
 */
export default function WebFooter() {
  return (
    <footer className="border-t border-white/10 px-4 py-8 md:px-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
        <div>
          <p className="text-sm font-bold text-white">{APP_NAME}</p>
          <p className="text-xs text-subdued">Perjalanan musik pribadi.</p>
        </div>
        <p className="text-xs text-subdued">
          Raihan Yusuf © 2026 • Built via Spotify Web API with Next.js • Akses
          read-only
        </p>
      </div>
    </footer>
  );
}
