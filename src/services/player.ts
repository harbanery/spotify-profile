import { fetchSpotifyApi } from "@/lib/spotify";
import { mapSpotifyTrack, type SpotifyTrackItem } from "./track";
import type { Track } from "@/features/web/types";

/** Statistik pemutaran yang sedang berlangsung. */
export interface NowPlaying {
  track: Track;
  /** Posisi pemutaran saat diambil (ms). */
  progressMs: number;
  isPlaying: boolean;
}

/**
 * Lagu yang sedang diputar user (GET /me/player/currently-playing).
 * Return null bila tidak ada pemutaran aktif atau scope belum diizinkan.
 */
export const getNowPlaying = async (
  accessToken: string,
): Promise<NowPlaying | null> => {
  const data = await fetchSpotifyApi<{
    is_playing?: boolean;
    progress_ms?: number;
    item?: SpotifyTrackItem | null;
  }>("/me/player/currently-playing?additional_types=track", accessToken);
  if (!data?.item?.id) return null;

  return {
    track: mapSpotifyTrack(data.item),
    progressMs: data.progress_ms ?? 0,
    isPlaying: Boolean(data.is_playing),
  };
};
