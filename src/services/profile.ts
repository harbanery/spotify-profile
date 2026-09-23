import type { UserProfile } from "@/features/web/types";
import { OWNER_NAME } from "@/utils/config/variables";
import { displayImage } from "@/utils/helpers";
import { fetchSpotifyApi } from "@/lib/spotify";
import { getPublicPlaylists } from "./playlist";

/**
 * Profil pemilik web (dummy). Dipakai saat belum login Spotify;
 * setelah login, halaman memakai getMyProfile (Spotify Web API).
 */
export const getProfile = (): UserProfile => ({
  id: "user-1",
  displayName: OWNER_NAME,
  handle: "@ryusu",
  avatar: "/images/avatar.svg",
  followers: 128,
  following: 342,
  publicPlaylists: getPublicPlaylists().length,
});

/** Bentuk mentah endpoint GET /me. */
interface SpotifyMe {
  id: string;
  display_name?: string | null;
  email?: string | null;
  images?: Array<{ url: string }>;
  followers?: { total?: number };
}

/** Bentuk mentah GET /me/following (total yang diikuti). */
interface SpotifyFollowing {
  artists?: { total?: number };
}

/** Bentuk mentah GET /me/playlists (total playlist milik user). */
interface SpotifyPlaylistPage {
  total?: number;
}

/**
 * Profil user yang sedang login (Spotify Web API):
 * /me, /me/following, dan /me/playlists diambil paralel.
 */
export const getMyProfile = async (
  accessToken: string,
): Promise<UserProfile | null> => {
  const [me, following, playlists] = await Promise.all([
    fetchSpotifyApi<SpotifyMe>("/me", accessToken),
    fetchSpotifyApi<SpotifyFollowing>(
      "/me/following?type=artist&limit=1",
      accessToken,
    ),
    fetchSpotifyApi<SpotifyPlaylistPage>("/me/playlists?limit=1", accessToken),
  ]);
  if (!me) return null;

  return {
    id: me.id,
    displayName: me.display_name?.trim() || me.id,
    handle: me.email ? `@${me.email.split("@")[0]}` : `@${me.id.slice(0, 10)}`,
    avatar: displayImage(me.images?.[0]?.url, "/images/avatar.svg"),
    followers: me.followers?.total ?? 0,
    following: following?.artists?.total ?? 0,
    publicPlaylists: playlists?.total ?? 0,
  };
};
