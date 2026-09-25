import { getValidAccessToken } from "@/lib/spotify";
import { getMyTopTracks } from "@/services/track";
import { cached } from "@/utils/server/cache";
import { allowRequest, quotaKey } from "@/utils/server/rateLimit";

/** Rentang waktu statistik yang diizinkan (?time_range=). */
const TIME_RANGES = ["short_term", "long_term"] as const;
type TimeRange = (typeof TIME_RANGES)[number];

/** TTL cache top tracks — data berubah lambat (ms). */
const TOP_CACHE_MS = 120_000;

/**
 * Top tracks user yang login; rentang waktu dikontrol query ?time_range=
 * (short_term ±4 minggu, long_term ±1 tahun; default short_term).
 * P0 proteksi kuota: rate limit internal per sesi + cache TTL 2 menit
 * per (sesi, rentang waktu) agar toggle filter tidak menghujani Spotify.
 */
export async function GET(request: Request) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!allowRequest(quotaKey(accessToken))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const requested = new URL(request.url).searchParams.get("time_range");
  const timeRange: TimeRange =
    requested && (TIME_RANGES as readonly string[]).includes(requested)
      ? (requested as TimeRange)
      : "short_term";

  const tracks = await cached(
    `top-tracks:${quotaKey(accessToken)}:${timeRange}`,
    TOP_CACHE_MS,
    () => getMyTopTracks(accessToken, 5, timeRange),
  );
  if (!tracks) {
    return Response.json({ error: "spotify_unavailable" }, { status: 502 });
  }

  return Response.json({ tracks });
}
