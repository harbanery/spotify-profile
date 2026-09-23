import type { Track } from "@/features/web/types";
import { fetchSpotifyApi } from "@/lib/spotify";

/** Bentuk mentah track dari Spotify Web API (full maupun simplified). */
export interface SpotifyTrackItem {
  id: string;
  name: string;
  duration_ms: number;
  artists: Array<{ name: string }>;
  album?: { name: string; images?: Array<{ url: string }> };
}

/** Map track Spotify ke tipe domain; plays tidak tersedia di Web API. */
export const mapSpotifyTrack = (track: SpotifyTrackItem): Track => ({
  id: track.id,
  title: track.name,
  artist: track.artists.map((artist) => artist.name).join(", "),
  album: track.album?.name ?? "",
  image: track.album?.images?.[0]?.url,
  duration: Math.round(track.duration_ms / 1000),
});

/**
 * Kolam lagu dummy. Nantinya digantikan data Spotify API.
 */
const TRACK_POOL: Track[] = [
  { id: "t1", title: "Golden Hour", artist: "Nova Rey", album: "Parallax", duration: 212, plays: 845_231_004 },
  { id: "t2", title: "Neon Skyline", artist: "The Midnight Echo", album: "Midnight Drive", duration: 198, plays: 412_887_130 },
  { id: "t3", title: "Paper Planes", artist: "Luna Waves", album: "Drift", duration: 245, plays: 298_140_552 },
  { id: "t4", title: "Solar Winds", artist: "Kaze", album: "Atmosphere", duration: 233, plays: 187_362_911 },
  { id: "t5", title: "Velvet Static", artist: "Pixel Palms", album: "Retro Grade", duration: 187, plays: 96_415_078 },
  { id: "t6", title: "Aurora", artist: "Aurora Skye", album: "Northern Lights", duration: 260, plays: 521_776_389 },
  { id: "t7", title: "Midnight Coffee", artist: "Nova Rey", album: "Parallax", duration: 176, plays: 143_209_846 },
  { id: "t8", title: "Slow Motion", artist: "Luna Waves", album: "Drift", duration: 228, plays: 88_934_271 },
  { id: "t9", title: "City Lights", artist: "The Midnight Echo", album: "Midnight Drive", duration: 205, plays: 233_560_194 },
  { id: "t10", title: "Monsoon", artist: "Kaze", album: "Atmosphere", duration: 241, plays: 74_618_330 },
  { id: "t11", title: "Sunset Drive", artist: "Pixel Palms", album: "Retro Grade", duration: 219, plays: 121_385_607 },
  { id: "t12", title: "Starlit", artist: "Aurora Skye", album: "Northern Lights", duration: 254, plays: 367_402_815 },
  { id: "t13", title: "Fool's Gold", artist: "Nova Rey", album: "Parallax", duration: 199, plays: 58_913_472 },
  { id: "t14", title: "Gravity", artist: "The Midnight Echo", album: "Midnight Drive", duration: 231, plays: 205_749_561 },
  { id: "t15", title: "Tidal", artist: "Luna Waves", album: "Drift", duration: 240, plays: 66_827_149 },
  { id: "t16", title: "Paper Moon", artist: "Kaze", album: "Atmosphere", duration: 224, plays: 49_250_638 },
  { id: "t17", title: "Chrome Heart", artist: "Pixel Palms", album: "Retro Grade", duration: 193, plays: 37_114_895 },
  { id: "t18", title: "Polaris", artist: "Aurora Skye", album: "Northern Lights", duration: 271, plays: 158_963_270 },
];

const byIds = (ids: string[]): Track[] =>
  ids
    .map((id) => TRACK_POOL.find((track) => track.id === id))
    .filter((track): track is Track => Boolean(track));

export const getTracks = (): Track[] => TRACK_POOL;

export const getTopTracks = (limit = 10): Track[] =>
  [...TRACK_POOL]
    .sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0))
    .slice(0, limit);

export const getTracksByIds = byIds;

/** Bentuk mentah endpoint GET /me/top/tracks. */
interface SpotifyTopTracksPage {
  items: SpotifyTrackItem[];
}

/**
 * Top tracks user yang login (Spotify Web API, terurut dari API).
 * Rentang waktu bisa "short_term" (±4 minggu), "medium_term", "long_term".
 */
export const getMyTopTracks = async (
  accessToken: string,
  limit = 10,
  timeRange: "short_term" | "medium_term" | "long_term" = "short_term",
): Promise<Track[] | null> => {
  const page = await fetchSpotifyApi<SpotifyTopTracksPage>(
    `/me/top/tracks?limit=${limit}&time_range=${timeRange}`,
    accessToken,
  );
  if (!page) return null;
  return page.items
    .filter((track) => Boolean(track?.id))
    .map(mapSpotifyTrack);
};
