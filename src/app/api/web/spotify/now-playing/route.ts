import { getValidAccessToken } from "@/lib/spotify";
import { getNowPlaying } from "@/services/player";
import { cached } from "@/utils/server/cache";
import { allowRequest, quotaKey } from "@/utils/server/rateLimit";

/**
 * Lagu yang sedang diputar untuk user yang login (null bila tidak ada).
 * P0 proteksi kuota: dibatasi rate limit internal (token bucket per
 * sesi) dan hasilnya di-coalesce singkat — beberapa tab/polling dalam
 * jendela cache berbagi satu panggilan ke Spotify.
 */

/** Jendela coalesce hasil now-playing (ms). */
const NOW_PLAYING_CACHE_MS = 5_000;

export async function GET() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!allowRequest(quotaKey(accessToken))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const nowPlaying = await cached(
    `now-playing:${quotaKey(accessToken)}`,
    NOW_PLAYING_CACHE_MS,
    () => getNowPlaying(accessToken),
  );
  return Response.json({ nowPlaying });
}
