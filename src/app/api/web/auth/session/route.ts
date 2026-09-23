import { getValidAccessToken } from "@/lib/spotify";
import { getMyProfile } from "@/services/profile";

/**
 * Status sesi login Spotify untuk client (useWebSession):
 * { authenticated: true, user } atau { authenticated: false }.
 * Access token yang hampir kedaluwarsa disegarkan otomatis di sini.
 */
export async function GET() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return Response.json({ authenticated: false });
  }

  const user = await getMyProfile(accessToken);
  if (!user) {
    return Response.json({ authenticated: false });
  }

  return Response.json({ authenticated: true, user });
}
