import { NextResponse, type NextRequest } from "next/server";
import { clearSpotifySession, resolveWebOrigin } from "@/lib/spotify";

/**
 * Logout: hapus cookie sesi Spotify lalu kembali ke beranda
 * (proxy akan mengarahkan ke /login karena sesi sudah kosong).
 */
export async function GET(request: NextRequest) {
  await clearSpotifySession();
  return NextResponse.redirect(new URL("/", resolveWebOrigin(request)));
}
