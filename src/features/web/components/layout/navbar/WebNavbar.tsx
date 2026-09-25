"use client";

import LanguageToggle from "@/components/i18n/LanguageToggle";
import ThemeToggle from "@/components/ui/theme/ThemeToggle";
import SpotifyLoginButton from "@/features/web/components/ui/SpotifyLoginButton";

/**
 * Navbar mini di sudut kanan atas — tidak full screen, menempel mengikuti
 * screen/scroll (fixed), latar transparan dengan blur tipis, bentuk
 * rounded pill. Berisi toggle bahasa (LanguageToggle), toggle tema
 * (ThemeToggle), pemisah tipis, lalu tombol login/logout Spotify.
 * Warna mengikuti tema aktif (token CSS variable).
 */
export default function WebNavbar() {
  return (
    <nav
      aria-label="Menu akun"
      className="fixed right-4 top-4 z-50 flex items-center gap-0.5 rounded-full border border-line bg-page/30 p-1 backdrop-blur-md md:right-6 md:top-6"
    >
      <LanguageToggle />
      <ThemeToggle />
      <span aria-hidden className="mx-1 h-5 w-px bg-line-strong" />
      <SpotifyLoginButton />
    </nav>
  );
}
