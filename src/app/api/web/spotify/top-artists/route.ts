import { getValidAccessToken } from "@/lib/spotify";
import { getMyTopArtists } from "@/services/artist";

/**
 * Top artists bulan ini (short_term) untuk user yang login.
 */
export async function GET() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const artists = await getMyTopArtists(accessToken, 10);
  if (!artists) {
    return Response.json({ error: "spotify_unavailable" }, { status: 502 });
  }

  return Response.json({ artists });
}
