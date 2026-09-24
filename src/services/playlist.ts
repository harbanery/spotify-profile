import type { Playlist } from "@/features/web/types";
import { OWNER_NAME } from "@/utils/config/variables";
import { displayImage } from "@/utils/helpers";
import { fetchSpotifyApi } from "@/lib/spotify";
import {
  getTracksByIds,
  mapSpotifyTrack,
  type SpotifyTrackItem,
} from "./track";

/**
 * Data playlist dummy. Dipakai saat belum login Spotify;
 * setelah login, halaman memakai getMyPlaylists (Spotify Web API).
 */
const PLAYLISTS: Playlist[] = [
  {
    id: "liked-songs",
    name: "Liked Songs",
    description: "Semua lagu yang kamu sukai dalam satu tempat.",
    cover: "/images/covers/liked-songs.svg",
    color: "#5038a0",
    owner: OWNER_NAME,
    tracks: getTracksByIds(["t6", "t1", "t12", "t2", "t9", "t3", "t14", "t4"]),
  },
  {
    id: "daily-mix-1",
    name: "Daily Mix 1",
    description:
      "Nova Rey, Aurora Skye, Luna Waves dan lainnya. Diperbarui untukmu.",
    cover: "/images/covers/cover-1.svg",
    color: "#1e3264",
    owner: "Spotify",
    tracks: getTracksByIds(["t1", "t7", "t13", "t6", "t12", "t18", "t3", "t8"]),
  },
  {
    id: "discover-weekly",
    name: "Discover Weekly",
    description: "Mixtape mingguanmu dari Spotify. Diperbarui setiap Senin.",
    cover: "/images/covers/cover-2.svg",
    color: "#8400e7",
    owner: "Spotify",
    tracks: getTracksByIds([
      "t2",
      "t9",
      "t14",
      "t4",
      "t10",
      "t16",
      "t5",
      "t11",
    ]),
  },
  {
    id: "on-repeat",
    name: "On Repeat",
    description: "Lagu yang terus kamu putar berulang-ulang.",
    cover: "/images/covers/cover-3.svg",
    color: "#e8115b",
    owner: "Spotify",
    tracks: getTracksByIds(["t6", "t1", "t12", "t11", "t5", "t17"]),
  },
  {
    id: "deep-focus",
    name: "Deep Focus",
    description: "Musik ambient untuk konsentrasi dalam waktu lama.",
    cover: "/images/covers/cover-4.svg",
    color: "#158a08",
    owner: "Spotify",
    tracks: getTracksByIds(["t4", "t10", "t16", "t8", "t15", "t3"]),
  },
  {
    id: "throwback-hits",
    name: "Throwback Hits",
    description: "Nostalgia penuh warna dari dekade lalu.",
    cover: "/images/covers/cover-5.svg",
    color: "#e13300",
    owner: OWNER_NAME,
    tracks: getTracksByIds(["t11", "t17", "t5", "t2", "t14", "t9", "t13"]),
  },
  {
    id: "indie-sunrise",
    name: "Indie Sunrise",
    description: "Guitar pop ceria untuk pagi yang segar.",
    cover: "/images/covers/cover-6.svg",
    color: "#0d73ec",
    owner: OWNER_NAME,
    tracks: getTracksByIds(["t3", "t8", "t15", "t1", "t7", "t12"]),
  },
  {
    id: "midnight-drive",
    name: "Midnight Drive",
    description: "Synth yang mengalun untuk perjalanan malam.",
    cover: "/images/covers/cover-7.svg",
    color: "#27856a",
    owner: OWNER_NAME,
    tracks: getTracksByIds(["t2", "t9", "t14", "t6", "t18", "t10"]),
  },
  {
    id: "party-anthems",
    name: "Party Anthems",
    description: "Tempat pesta dimulai.",
    cover: "/images/covers/cover-8.svg",
    color: "#b02897",
    owner: "Spotify",
    tracks: getTracksByIds(["t5", "t17", "t11", "t1", "t13", "t6", "t2"]),
  },
];

export const getPlaylists = (): Playlist[] => PLAYLISTS;

export const getPlaylistById = (id: string): Playlist | undefined =>
  PLAYLISTS.find((playlist) => playlist.id === id);

/** Total pemutaran playlist dummy = jumlah plays lagu-lagunya. */
const totalPlays = (playlist: Playlist): number =>
  (playlist.tracks ?? []).reduce((sum, track) => sum + (track.plays ?? 0), 0);

/**
 * Playlist publik dummy terurut dari yang paling sering didengar
 * (dihitung dari jumlah pemutaran lagu di dalam tiap playlist).
 */
export const getPublicPlaylists = (): Playlist[] =>
  [...PLAYLISTS]
    .filter((playlist) => playlist.owner !== "Spotify")
    .sort((a, b) => totalPlays(b) - totalPlays(a));

/** Bentuk mentah playlist (list) dari Spotify Web API. */
interface SpotifyPlaylistItem {
  id: string;
  name: string;
  description?: string;
  images?: Array<{ url: string }>;
  owner?: { display_name?: string };
}

/** Bentuk mentah detail playlist dengan track-nya. */
interface SpotifyPlaylistDetail extends SpotifyPlaylistItem {
  tracks?: {
    items?: Array<{ track: SpotifyTrackItem | null }>;
  };
}

interface SpotifyPlaylistsPage {
  items: SpotifyPlaylistItem[];
}

/** Warna aksen default untuk header playlist live. */
const LIVE_PLAYLIST_COLOR = "#1e3264";

/** Peta playlist live ke tipe domain. */
const mapLivePlaylist = (playlist: SpotifyPlaylistItem): Playlist => ({
  id: playlist.id,
  name: playlist.name,
  description: playlist.description ?? "",
  cover: displayImage(playlist.images?.[0]?.url),
  color: LIVE_PLAYLIST_COLOR,
  owner: playlist.owner?.display_name ?? "Spotify",
});

/**
 * Playlist milik user yang login (Spotify Web API).
 * Endpoint list tidak menyertakan isi lagu — tracks diisi saat detail.
 */
export const getMyPlaylists = async (
  accessToken: string,
  limit = 50,
): Promise<Playlist[] | null> => {
  const page = await fetchSpotifyApi<SpotifyPlaylistsPage>(
    `/me/playlists?limit=${limit}`,
    accessToken,
  );
  if (!page) return null;
  return page.items
    .filter((playlist) => Boolean(playlist?.id))
    .map(mapLivePlaylist);
};

/** Referensi track di playlist (cukup id untuk skoring). */
interface SpotifyPlaylistTrackRef {
  items?: Array<{ track?: { id?: string } | null }>;
}

/** Referensi item top tracks user (cukup id untuk skoring). */
interface SpotifyTopTracksRef {
  items?: Array<{ id?: string }>;
}

/**
 * Playlist yang paling sering didengar user. Spotify Web API tidak
 * menyediakan play count per playlist, jadi skor dihitung dari isi
 * playlist: setiap track yang muncul di top tracks user (gabungan short
 * term + long term, masing-masing dibobot peringkat lalu dijumlahkan)
 * menambah skornya — playlist berisi lagu favorit user dianggap paling
 * sering didengar. Bila tidak ada yang cocok, kembali ke urutan playlist
 * user (perilaku lama).
 */
export const getMyTopPlaylists = async (
  accessToken: string,
  limit = 5,
): Promise<Playlist[] | null> => {
  const [shortTop, longTop, playlistsPage] = await Promise.all([
    fetchSpotifyApi<SpotifyTopTracksRef>(
      "/me/top/tracks?limit=50&time_range=short_term",
      accessToken,
    ),
    fetchSpotifyApi<SpotifyTopTracksRef>(
      "/me/top/tracks?limit=50&time_range=long_term",
      accessToken,
    ),
    fetchSpotifyApi<SpotifyPlaylistsPage>(
      "/me/playlists?limit=50",
      accessToken,
    ),
  ]);
  if (!playlistsPage?.items) return null;

  // Bobot gabungan: lagu yang jadi favorit di kedua rentang bertambah
  // skornya, sehingga pemeringkat lebih stabil.
  const weights = new Map<string, number>();
  const addWeights = (items: Array<{ id?: string }>) => {
    items.forEach((item, index) => {
      if (!item?.id) return;
      weights.set(
        item.id,
        (weights.get(item.id) ?? 0) + (items.length - index),
      );
    });
  };
  if (shortTop?.items) addWeights(shortTop.items);
  if (longTop?.items) addWeights(longTop.items);
  // Analisis maksimal 30 playlist pertama agar tidak membentur rate limit.
  const candidates = playlistsPage.items
    .filter((playlist) => Boolean(playlist?.id))
    .slice(0, 30);

  console.log({ candidates });

  const scored = await Promise.all(
    candidates.map(async (playlist) => {
      // GET /playlists/{id}/items — referensi:
      // https://developer.spotify.com/documentation/web-api/reference/get-playlists-items
      const tracks = await fetchSpotifyApi<SpotifyPlaylistTrackRef>(
        `/playlists/${playlist.id}/items?limit=100&fields=items(track(id))`,
        accessToken,
      );
      console.log({ playlist, tracks });
      const score = (tracks?.items ?? []).reduce(
        (sum, item) =>
          sum + (item.track?.id ? (weights.get(item.track.id) ?? 0) : 0),
        0,
      );
      return { playlist, score };
    }),
  );

  const ranked = scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => mapLivePlaylist(entry.playlist));

  console.log({ ranked });

  return ranked.length > 0
    ? ranked
    : candidates.slice(0, limit).map(mapLivePlaylist);
};

/**
 * Detail satu playlist via Spotify Web API (halaman /playlist/[id] live).
 * Catatan: skeleton ini hanya memuat halaman track pertama (maks 100 lagu).
 */
export const getPlaylistLive = async (
  id: string,
  accessToken: string,
): Promise<Playlist | null> => {
  const detail = await fetchSpotifyApi<SpotifyPlaylistDetail>(
    `/playlists/${encodeURIComponent(id)}`,
    accessToken,
  );
  if (!detail) return null;

  const tracks = (detail.tracks?.items ?? [])
    .map((item) => item.track)
    .filter((track): track is SpotifyTrackItem =>
      Boolean(track?.id && track.name),
    )
    .map(mapSpotifyTrack);

  return {
    id: detail.id,
    name: detail.name,
    description: detail.description ?? "",
    cover: displayImage(detail.images?.[0]?.url),
    color: LIVE_PLAYLIST_COLOR,
    owner: detail.owner?.display_name ?? "Spotify",
    tracks,
  };
};
