import { NextResponse, type NextRequest } from "next/server";
import {
  buildAuthorizeUrl,
  callbackUriFor,
  createCodeChallenge,
  generateCodeVerifier,
  generateState,
  resolveWebOrigin,
  saveAuthFlow,
} from "@/lib/spotify";
import { isSpotifyConfigured } from "@/utils/config/variables";

/**
 * Mulai alur login Spotify (Authorization Code + PKCE):
 * simpan verifier+state+redirect_uri di cookie httpOnly, lalu redirect ke
 * halaman izin Spotify. Redirect URI mengikuti origin request (dibaca dari
 * x-forwarded-host/proto agar benar di balik dev tunnel) dan hanya origin
 * yang callback-nya terdaftar (SPOTIFY_REDIRECT_URIS di .env + Dashboard
 * Spotify) yang boleh — domain cookie sesi pun selalu konsisten.
 */
export async function GET(request: NextRequest) {
  const origin = resolveWebOrigin(request);

  if (!isSpotifyConfigured()) {
    return NextResponse.redirect(
      new URL("/?auth_error=unconfigured", origin),
    );
  }

  const redirectUri = callbackUriFor(origin);
  if (!redirectUri) {
    const params = new URLSearchParams({
      auth_error: "unregistered_origin",
      origin,
    });
    return NextResponse.redirect(new URL(`/?${params}`, origin));
  }

  const verifier = generateCodeVerifier();
  const state = generateState();
  await saveAuthFlow(verifier, state, redirectUri);

  return NextResponse.redirect(
    buildAuthorizeUrl({
      state,
      codeChallenge: createCodeChallenge(verifier),
      redirectUri,
    }),
  );
}
