import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI,
  SPOTIFY_REDIRECT_URIS,
  SPOTIFY_SCOPES,
} from "@/utils/config/variables";

/**
 * Integrasi Spotify Web API (server-only):
 * OAuth Authorization Code + PKCE, penyimpanan sesi di cookie httpOnly,
 * refresh token otomatis, dan wrapper fetch untuk https://api.spotify.com/v1.
 * Referensi: https://developer.spotify.com/documentation/web-api
 */

const SPOTIFY_ACCOUNTS_BASE = "https://accounts.spotify.com";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

/** Cookie alur login (verifier + state), berumur singkat. */
const SPOTIFY_AUTH_FLOW_COOKIE = "spotify_auth_flow";
/** Cookie sesi login (access + refresh token). Dipakai juga proxy.ts. */
export const SPOTIFY_SESSION_COOKIE = "spotify_session";
/** Umur sesi: 30 hari (harus login ulang Spotify setelahnya). */
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
/** Margins 60 detik agar token tidak dipakai tepat saat kedaluwarsa. */
const EXPIRY_MARGIN_MS = 60_000;

export interface SpotifySession {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms kedaluwarsa access token. */
  expiresAt: number;
  scope: string;
}

interface SpotifyTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type: string;
}

/** random bytes -> base64url (tanpa padding), sesuai spesifikasi PKCE. */
const toBase64Url = (buffer: Buffer): string => buffer.toString("base64url");

export const generateCodeVerifier = (): string => toBase64Url(randomBytes(48));

export const generateState = (): string => toBase64Url(randomBytes(24));

/** code_challenge = BASE64URL(SHA256(code_verifier)). */
export const createCodeChallenge = (verifier: string): string =>
  toBase64Url(createHash("sha256").update(verifier).digest());

export const buildAuthorizeUrl = (input: {
  state: string;
  codeChallenge: string;
  redirectUri: string;
}): string => {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: input.redirectUri,
    scope: SPOTIFY_SCOPES,
    code_challenge_method: "S256",
    code_challenge: input.codeChallenge,
    state: input.state,
  });
  return `${SPOTIFY_ACCOUNTS_BASE}/authorize?${params.toString()}`;
};

/**
 * Origin web asli dari request: prioritaskan x-forwarded-host/proto
 * (standar balik proxy/dev tunnel) di atas request.url — di balik tunnel,
 * request.url bisa salah port (mis. "tunnel.dev:3000") dan membuat
 * redirect Spotify serta cookie sesi mendarat di domain/port yang beda.
 */
export const resolveWebOrigin = (request: NextRequest): string => {
  const fallback = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host =
    forwardedHost?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    fallback.host;
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto =
    forwardedProto?.split(",")[0]?.trim() ?? fallback.protocol.replace(":", "");
  return `${proto}://${host}`;
};

/** Semua callback yang diizinkan (gabungan env SPOTIFY_REDIRECT_URIS + _URI). */
const allowedCallbackUris = (): string[] => [
  ...SPOTIFY_REDIRECT_URIS,
  ...(SPOTIFY_REDIRECT_URI ? [SPOTIFY_REDIRECT_URI] : []),
];

/**
 * Redirect URI untuk alur OAuth dari origin request: hanya origin yang
 * callback-nya terdaftar (Spotify Dashboard + env) yang boleh memulai
 * login — return null bila belum terdaftar, sehingga user diarahkan ke
 * halaman login dengan pesan jelas, bukan error "Not matching
 * configuration" dari Spotify. Cookie sesi pun selalu satu domain.
 */
export const callbackUriFor = (requestOrigin: string): string | null => {
  const originCallback = `${requestOrigin}/api/web/auth/callback`;
  return allowedCallbackUris().includes(originCallback) ? originCallback : null;
};

/** Body dasar pertukaran token; client_secret dikirim bila tersedia. */
const tokenRequestBody = (entries: Record<string, string>): URLSearchParams => {
  const body = new URLSearchParams(entries);
  if (SPOTIFY_CLIENT_SECRET) {
    body.set("client_secret", SPOTIFY_CLIENT_SECRET);
  }
  return body;
};

const requestTokens = async (
  body: URLSearchParams,
): Promise<SpotifyTokenResponse | null> => {
  try {
    const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as SpotifyTokenResponse;
  } catch {
    return null;
  }
};

/** Tukar authorization code menjadi token (dengan code_verifier PKCE).
 *  redirectUri harus sama persis dengan yang dipakai saat authorize. */
export const exchangeCodeForTokens = async (
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<SpotifySession | null> => {
  const tokens = await requestTokens(
    tokenRequestBody({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: SPOTIFY_CLIENT_ID,
      code_verifier: codeVerifier,
    }),
  );
  if (!tokens) return null;

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? "",
    expiresAt: Date.now() + tokens.expires_in * 1000,
    scope: tokens.scope ?? SPOTIFY_SCOPES,
  };
};

/** Perbarui access token memakai refresh token. */
export const refreshSpotifyToken = async (
  refreshToken: string,
): Promise<SpotifyTokenResponse | null> =>
  requestTokens(
    tokenRequestBody({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: SPOTIFY_CLIENT_ID,
    }),
  );

const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/** Simpan data alur login (10 menit): verifier, state, dan redirect_uri
 *  yang dipakai saat authorize — wajib identik saat pertukaran token. */
export const saveAuthFlow = async (
  verifier: string,
  state: string,
  redirectUri: string,
) => {
  const cookieStore = await cookies();
  cookieStore.set(
    SPOTIFY_AUTH_FLOW_COOKIE,
    JSON.stringify({ verifier, state, redirectUri }),
    { ...sessionCookieOptions, maxAge: 600 },
  );
};

/** Hapus cookie alur login. */
export const clearAuthFlow = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(SPOTIFY_AUTH_FLOW_COOKIE);
};

/** Ambil kembali data alur login yang tersimpan. */
export const readAuthFlow = async (): Promise<{
  verifier: string;
  state: string;
  redirectUri: string;
} | null> => {
  const raw = (await cookies()).get(SPOTIFY_AUTH_FLOW_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as {
      verifier?: string;
      state?: string;
      redirectUri?: string;
    };
    if (!parsed.verifier || !parsed.state || !parsed.redirectUri) return null;
    return {
      verifier: parsed.verifier,
      state: parsed.state,
      redirectUri: parsed.redirectUri,
    };
  } catch {
    return null;
  }
};

/** Simpan sesi login ke cookie httpOnly. */
export const persistSpotifySession = async (session: SpotifySession) => {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SPOTIFY_SESSION_COOKIE, JSON.stringify(session), {
      ...sessionCookieOptions,
      maxAge: SESSION_MAX_AGE,
    });
  } catch {
    // Konteks read-only (mis. Server Component): abaikan — token tetap valid
    // untuk render ini, penyegaran berikutnya lewat route handler.
  }
};

/** Hapus sesi login (logout). */
export const clearSpotifySession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(SPOTIFY_SESSION_COOKIE);
};

/** Baca sesi dari cookie (null bila belum/tidak valid format). */
export const readSpotifySession = async (): Promise<SpotifySession | null> => {
  const raw = (await cookies()).get(SPOTIFY_SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SpotifySession>;
    if (!parsed.accessToken || !parsed.expiresAt) return null;
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken ?? "",
      expiresAt: parsed.expiresAt,
      scope: parsed.scope ?? "",
    };
  } catch {
    return null;
  }
};

/**
 * Access token yang siap dipakai: refresh otomatis saat hampir kedaluwarsa.
 * Penyimpanan hasil refresh hanya berlaku di route handler/server action;
 * di Server Component token segar dipakai untuk render berjalan saja.
 */
export const isSessionTokenUsable = (session: SpotifySession): boolean =>
  session.expiresAt - EXPIRY_MARGIN_MS > Date.now();

/**
 * true bila sesi layak melanjutkan tanpa login ulang: token masih aktif
 * ATAU ada refresh token untuk disegarkan route handler.
 */
export const isSessionViable = (session: SpotifySession | null): boolean => {
  if (!session) return false;
  return isSessionTokenUsable(session) || session.refreshToken.length > 0;
};

/** Cek optimistik cookie sesi mentah (dipakai proxy.ts, tanpa cookies()). */
export const isSessionCookieUsable = (raw: string | undefined): boolean => {
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as Partial<SpotifySession>;
    if (!parsed.accessToken || !parsed.expiresAt) return false;
    return isSessionTokenUsable({
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken ?? "",
      expiresAt: parsed.expiresAt,
      scope: parsed.scope ?? "",
    });
  } catch {
    return false;
  }
};

export const getValidAccessToken = async (): Promise<string | null> => {
  const session = await readSpotifySession();
  if (!session) return null;

  if (isSessionTokenUsable(session)) {
    return session.accessToken;
  }

  if (!session.refreshToken) return null;

  const refreshed = await refreshSpotifyToken(session.refreshToken);
  if (!refreshed) return null;

  const nextSession: SpotifySession = {
    ...session,
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token ?? session.refreshToken,
    expiresAt: Date.now() + refreshed.expires_in * 1000,
  };
  await persistSpotifySession(nextSession);
  return nextSession.accessToken;
};

/** Jeda singkat (ms) antar percobaan ulang. */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Cap tunggu Retry-After dari Spotify (ms) agar request tidak menggantung. */
const RETRY_AFTER_CAP_MS = 5_000;
/** Backoff eksponensial untuk kegagalan 5xx/jaringan (ms per percobaan). */
const SERVER_ERROR_BACKOFF_MS = [500, 1000] as const;
/** Jitter ±25% agar banyak client tidak tersinkron menghujani API. */
const jitter = (ms: number): number => ms * (0.75 + Math.random() * 0.5);

/**
 * GET {path} ke Spotify Web API dengan Bearer token — P0 proteksi kuota:
 * 429 dihormati lewat header Retry-After (dicap 5 detik, maks 1x ulang),
 * kegagalan 5xx/jaringan di-backoff eksponensial + jitter (maks 2x ulang).
 * Null bila tetap gagal (termasuk 401/404) — pemanggil menentukan fallback.
 * Referensi rate limit:
 * https://developer.spotify.com/documentation/web-api/concepts/rate-limits
 */
export const fetchSpotifyApi = async <T>(
  path: string,
  accessToken: string,
): Promise<T | null> => {
  const maxAttempts = SERVER_ERROR_BACKOFF_MS.length + 1;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(`${SPOTIFY_API_BASE}${path}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
    } catch {
      // Kegagalan jaringan — backoff lalu ulangi.
      if (attempt + 1 >= maxAttempts) return null;
      await sleep(jitter(SERVER_ERROR_BACKOFF_MS[attempt]));
      continue;
    }

    if (response.ok) {
      // 204 No Content (mis. tidak ada pemutaran aktif) tidak punya body.
      if (response.status === 204) return null;
      try {
        return (await response.json()) as T;
      } catch {
        return null;
      }
    }

    if (response.status === 429 && attempt + 1 < maxAttempts) {
      // Hormati Retry-After (detik) dari Spotify, dicap agar tak menggantung.
      const retryAfterMs = Math.min(
        (Number(response.headers.get("Retry-After")) || 1) * 1000,
        RETRY_AFTER_CAP_MS,
      );
      await sleep(retryAfterMs);
      continue;
    }

    if (response.status >= 500 && attempt + 1 < maxAttempts) {
      await sleep(jitter(SERVER_ERROR_BACKOFF_MS[attempt]));
      continue;
    }

    // 4xx lain (401/403/404) atau budget percobaan habis — tidak di-retry.
    return null;
  }

  return null;
};
