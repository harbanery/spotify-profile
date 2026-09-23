import type { Artist } from "@/features/web/types";
import { displayImage } from "@/utils/helpers";
import { fetchSpotifyApi } from "@/lib/spotify";

/**
 * Data artis dummy. Dipakai saat belum login Spotify;
 * setelah login, halaman memakai getMyTopArtists (Spotify Web API).
 */
const ARTISTS: Artist[] = [
  { id: "a1", name: "Nova Rey", genre: "Synthpop", image: "/images/artists/artist-1.svg", listeners: 2_450_000 },
  { id: "a2", name: "The Midnight Echo", genre: "Indie Rock", image: "/images/artists/artist-2.svg", listeners: 1_820_000 },
  { id: "a3", name: "Luna Waves", genre: "Dream Pop", image: "/images/artists/artist-3.svg", listeners: 964_000 },
  { id: "a4", name: "Kaze", genre: "Ambient", image: "/images/artists/artist-4.svg", listeners: 730_500 },
  { id: "a5", name: "Pixel Palms", genre: "Retrowave", image: "/images/artists/artist-5.svg", listeners: 512_800 },
  { id: "a6", name: "Aurora Skye", genre: "Chillwave", image: "/images/artists/artist-6.svg", listeners: 389_400 },
];

export const getArtists = (): Artist[] => ARTISTS;

export const getArtistById = (id: string): Artist | undefined =>
  ARTISTS.find((artist) => artist.id === id);

/** Bentuk mentah artis dari Spotify Web API. */
interface SpotifyArtistItem {
  id: string;
  name: string;
  genres?: string[];
  images?: Array<{ url: string }>;
  followers?: { total?: number };
}

interface SpotifyTopArtistsPage {
  items: SpotifyArtistItem[];
}

const mapSpotifyArtist = (artist: SpotifyArtistItem): Artist => ({
  id: artist.id,
  name: artist.name,
  genre: artist.genres?.[0] ?? "Music",
  image: displayImage(artist.images?.[0]?.url, "/images/artists/artist-1.svg"),
  // Web API tidak menyediakan monthly listeners; pakai total followers.
  listeners: artist.followers?.total ?? 0,
});

/**
 * Top artists user yang login (Spotify Web API, terurut dari API).
 * Rentang waktu bisa "short_term" (±4 minggu), "medium_term", "long_term".
 */
export const getMyTopArtists = async (
  accessToken: string,
  limit = 10,
  timeRange: "short_term" | "medium_term" | "long_term" = "short_term",
): Promise<Artist[] | null> => {
  const page = await fetchSpotifyApi<SpotifyTopArtistsPage>(
    `/me/top/artists?limit=${limit}&time_range=${timeRange}`,
    accessToken,
  );
  if (!page) return null;
  return page.items.filter((artist) => Boolean(artist?.id)).map(mapSpotifyArtist);
};
