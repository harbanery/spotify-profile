import { NextResponse, type NextRequest } from "next/server";

/**
 * Proteksi rute (konvensi Next.js 16 — proxy, pengganti middleware).
 * Status login tidak lagi dicek di sini: halaman beranda merender gerbang
 * login sendiri saat belum ada sesi. /login (route lama) dialihkan ke /
 * agar bookmark sebelumnya tetap berfungsi.
 */
export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/login"],
};
