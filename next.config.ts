import type { NextConfig } from "next";

/** Relaksasi CSP khusus dev (HMR websocket + eval runtime Next). */
const isDev = process.env.NODE_ENV === "development";

/**
 * Hardening P1 (rekomendasi_feature.md S1+S2):
 * - poweredByHeader false: jangan umumkan stack lewat header X-Powered-By.
 * - Security headers dasar untuk semua route: nosniff, anti-clickjacking,
 *   referrer policy, permissions policy, dan CSP.
 * Catatan CSP: antd menyuntik style inline dan Next memakai inline script
 * runtime (unsafe-inline); gambar dari CDN Spotify diizinkkan eksplisit;
 * client hanya memanggil origin sendiri (panggilan Spotify terjadi
 * server-side, tidak dibatasi connect-src browser).
 */
const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' data: https://i.scdn.co https://mosaic.scdn.co https://image-cdn-fa.spotifycdn.com https://platform-lookaside.fbsbx.com",
              "style-src 'self' 'unsafe-inline'",
              isDev
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
                : "script-src 'self' 'unsafe-inline'",
              isDev ? "connect-src 'self' ws:" : "connect-src 'self'",
              "font-src 'self' data:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
