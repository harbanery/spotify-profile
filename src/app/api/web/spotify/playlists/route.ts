import { getValidAccessToken } from "@/lib/spotify";
import { getMyPlaylists } from "@/services/playlist";

/**
 * Playlist milik user yang login — cukup data /me/playlists (tanpa
 * time range, runInBatches, atau pembacaan playlist items).
 */
export async function GET() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const playlists = await getMyPlaylists(accessToken, 5);
  if (!playlists) {
    return Response.json({ error: "spotify_unavailable" }, { status: 502 });
  }

  return Response.json({ playlists });
}
