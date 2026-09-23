import { NextResponse, type NextRequest } from "next/server";
import {
  clearAuthFlow,
  exchangeCodeForTokens,
  persistSpotifySession,
  readAuthFlow,
  resolveWebOrigin,
} from "@/lib/spotify";

/** Redirect ke beranda dengan penanda error yang aman untuk URL. */
const redirectWithError = (
  request: NextRequest,
  reason: string,
): NextResponse =>
  NextResponse.redirect(
    new URL(`/?auth_error=${reason}`, resolveWebOrigin(request)),
  );

/**
 * Balikan Spotify setelah user menyetujui izin: validasi state (anti-CSRF),
 * tukar code + verifier menjadi token, simpan sesi, lalu arahkan ke beranda.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const spotifyError = url.searchParams.get("error");

  const flow = await readAuthFlow();
  await clearAuthFlow();

  if (spotifyError) {
    return redirectWithError(request, spotifyError);
  }

  if (!code || !state || !flow) {
    return redirectWithError(request, "invalid_callback");
  }

  if (flow.state !== state) {
    return redirectWithError(request, "state_mismatch");
  }

  const session = await exchangeCodeForTokens(
    code,
    flow.verifier,
    flow.redirectUri,
  );
  if (!session) {
    return redirectWithError(request, "token_exchange_failed");
  }

  await persistSpotifySession(session);
  return NextResponse.redirect(new URL("/", resolveWebOrigin(request)));
}
