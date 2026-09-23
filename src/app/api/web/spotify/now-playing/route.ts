import { getValidAccessToken } from "@/lib/spotify";
import { getNowPlaying } from "@/services/player";

/**
 * Lagu yang sedang diputar untuk user yang login (null bila tidak ada).
 */
export async function GET() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const nowPlaying = await getNowPlaying(accessToken);
  return Response.json({ nowPlaying });
}
