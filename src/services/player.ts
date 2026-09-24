import { fetchSpotifyApi } from "@/lib/spotify";
import { mapSpotifyTrack, type SpotifyTrackItem } from "./track";
import type { Track } from "@/features/web/types";

/** Statistik pemutaran yang sedang berlangsung. */
export interface NowPlaying {
  track: Track;
  /** Posisi pemutaran saat diambil (ms). */
  progressMs: number;
  isPlaying: boolean;
  /** Nama playlist asal pemutaran (bila konteksnya playlist). */
  playlist?: string;
}

/**
 * Lagu yang sedang diputar user (GET /me/player/currently-playing).
 * Bila diputar dari playlist, nama playlistnya diambil terpisah dari
 * context.uri (spotify:playlist:<id> → GET /playlists/<id>). Return
 * null bila tidak ada pemutaran aktif atau scope belum diizinkan.
 */
export const getNowPlaying = async (
  accessToken: string,
): Promise<NowPlaying | null> => {
  const data = await fetchSpotifyApi<{
    is_playing?: boolean;
    progress_ms?: number;
    item?: SpotifyTrackItem | null;
    context?: { type?: string; uri?: string };
  }>("/me/player/currently-playing?additional_types=track", accessToken);
  if (!data?.item?.id) return null;

  // Konteks playlist: "spotify:playlist:<id>" → ambil namanya.
  const playlistId =
    data.context?.type === "playlist"
      ? (data.context.uri ?? "").split(":").pop()
      : undefined;
  const playlistDetail = playlistId
    ? await fetchSpotifyApi<{ name?: string }>(
        `/playlists/${encodeURIComponent(playlistId)}?fields=name`,
        accessToken,
      )
    : null;

  return {
    track: mapSpotifyTrack(data.item),
    progressMs: data.progress_ms ?? 0,
    isPlaying: Boolean(data.is_playing),
    playlist: playlistDetail?.name,
  };
};
