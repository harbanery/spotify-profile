import { getValidAccessToken } from "@/lib/spotify";
import { getMyTopPlaylists } from "@/services/playlist";

/**
 * Playlist yang paling sering didengar user yang login: skor dihitung
 * dari track di tiap playlist yang muncul di top tracks user (lihat
 * services/playlist.ts → getMyTopPlaylists).
 */
export async function GET() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const playlists = await getMyTopPlaylists(accessToken, 5);
  if (!playlists) {
    return Response.json({ error: "spotify_unavailable" }, { status: 502 });
  }

  return Response.json({ playlists });
}
