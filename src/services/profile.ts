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

/** Bentuk mentah GET /me/following (total artis yang diikuti). */
interface SpotifyFollowing {
  artists?: { total?: number };
}

/**
 * Jumlah artis yang diikuti user (GET /me/following?type=artist).
 * Di-retry sekali karena panggilan ini paling rentan kena rate limit
 * saat berjalan paralel dengan /me dan /me/playlists — tanpa retry,
 * kegagalan sesaat membuat profil menampilkan "0 following".
 * Catatan: Spotify Web API hanya menyediakan jumlah ARTIS yang diikuti;
 * jumlah following di profil resmi Spotify (teman/user) tidak diekspos
 * API publik, jadi angka ini adalah yang terdekat tersedia.
 */
const getFollowingCount = async (accessToken: string): Promise<number> => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const data = await fetchSpotifyApi<SpotifyFollowing>(
      "/me/following?type=artist&limit=1",
      accessToken,
    );
    if (typeof data?.artists?.total === "number") {
      return data.artists.total;
    }
  }
  return 0;
};

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
    getFollowingCount(accessToken),
    fetchSpotifyApi<SpotifyPlaylistPage>("/me/playlists?limit=1", accessToken),
  ]);
  if (!me) return null;

  return {
    id: me.id,
    displayName: me.display_name?.trim() || me.id,
    handle: me.email ? `@${me.email.split("@")[0]}` : `@${me.id.slice(0, 10)}`,
    avatar: displayImage(me.images?.[0]?.url, "/images/avatar.svg"),
    followers: me.followers?.total ?? 0,
    following,
    publicPlaylists: playlists?.total ?? 0,
  };
};
