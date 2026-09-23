import { getValidAccessToken } from "@/lib/spotify";
import { getMyTopTracks } from "@/services/track";

/**
 * Top tracks bulan ini (short_term) untuk user yang login.
 */
export async function GET() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const tracks = await getMyTopTracks(accessToken, 5);
  if (!tracks) {
    return Response.json({ error: "spotify_unavailable" }, { status: 502 });
  }

  return Response.json({ tracks });
}
