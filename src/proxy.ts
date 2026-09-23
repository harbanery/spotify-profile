import { NextResponse, type NextRequest } from "next/server";
import {
  isSessionCookieUsable,
  SPOTIFY_SESSION_COOKIE,
} from "@/lib/spotify";

/**
 * Proteksi rute (konvensi Next.js 16 — proxy, pengganti middleware).
 * Cek di sini bersifat optimistik (hanya membaca cookie); validasi penuh
 * token tetap dilakukan page/route handler lewat lib/spotify.
 *
 * - "/" (beranda statistik) wajib login Spotify → tanpa sesi arahkan /login.
 * - "/login" dilewati bila sesi masih aktif → langsung ke beranda.
 */

const LOGIN_PATH = "/login";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SPOTIFY_SESSION_COOKIE)?.value;

  if (pathname === LOGIN_PATH) {
    if (isSessionCookieUsable(sessionCookie)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/" && !sessionCookie) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Jalankan untuk semua halaman kecuali API, aset statis, dan file metadata.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
