"use client";

import SpotifyLoginButton from "@/features/web/components/ui/SpotifyLoginButton";

/**
 * Navbar mini di sudut kanan atas — tidak full screen, menempel mengikuti
 * screen/scroll (fixed), latar transparan dengan blur tipis, bentuk
 * rounded pill. Tombol login/logout (SpotifyLoginButton) masuk di dalam
 * navbar ini, menggantikan tombol pojok absolut versi lama.
 */
export default function WebNavbar() {
  return (
    <nav
      aria-label="Menu akun"
      className="fixed right-4 top-4 z-50 flex items-center rounded-full border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-md md:right-6 md:top-6"
    >
      <SpotifyLoginButton />
    </nav>
  );
}
