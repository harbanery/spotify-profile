"use client";

import { useEffect, useState } from "react";
import { Button } from "antd";
import SectionHeader from "@/features/web/components/ui/SectionHeader";
import TrackList from "@/features/web/components/ui/TrackList";
import PlaylistList from "@/features/web/components/ui/PlaylistList";
import ArtistCard from "@/features/web/components/ui/ArtistCard";
import { useWebSession } from "@/features/web/hooks/session";
import type { Artist, Playlist, Track } from "@/features/web/types";

interface ProfileBodySectionProps {
  /** Data dummy untuk pengunjung yang belum login Spotify. */
  topTracks: Track[];
  topArtists: Artist[];
  playlists: Playlist[];
}

/** Data live Spotify; slice yang gagal diambil tetap undefined (fallback dummy). */
interface LiveData {
  tracks?: Track[];
  artists?: Artist[];
  playlists?: Playlist[];
}

/** Rentang waktu statistik (tombol round "This month/This year"). */
type TimeRange = "short_term" | "long_term";

const TIME_RANGE_TERMS: Array<{ label: string; value: TimeRange }> = [
  { label: "This month", value: "short_term" },
  { label: "This year", value: "long_term" },
];

/**
 * Statistik pendengaran di bawah kartu now playing: top tracks (list),
 * top artists (3 kartu horizontal, foto bulat di atas nama di bawah),
 * dan top playlists (list) — semua height auto (bukan satu layar penuh),
 * lebar sebesar laptop (max-w-4xl). Filter rentang waktu digabung satu
 * di paling atas (antd Button round ala tombol login/logout, className
 * Tailwind wajib berakhiran "!" sesuai konvensi proyek) dan berlaku ke
 * top tracks + top artists; playlist tidak difilter karena Spotify API
 * tidak punya konsep waktu pada playlist — pemeringkatannya internal
 * (lihat services/playlist.ts → getMyTopPlaylists). Saat login, data
 * live menggantikan dummy per-section.
 */
export default function ProfileBodySection({
  topTracks,
  topArtists,
  playlists,
}: ProfileBodySectionProps) {
  const { status } = useWebSession();
  const [timeRange, setTimeRange] = useState<TimeRange>("short_term");
  const [live, setLive] = useState<LiveData | null>(null);

  useEffect(() => {
    // Reset/dummy cukup lewat render turunan: live?.tracks ?? topTracks.
    if (status !== "authenticated") return;

    let cancelled = false;
    const getJson = async <T,>(url: string): Promise<T | undefined> => {
      try {
        const response = await fetch(url);
        if (!response.ok) return undefined;
        return (await response.json()) as T;
      } catch {
        return undefined;
      }
    };

    // Rentang waktu berlaku pada top tracks dan top artists; playlist tetap.
    Promise.all([
      getJson<{ tracks: Track[] }>(
        `/api/web/spotify/top-tracks?time_range=${timeRange}`,
      ),
      getJson<{ artists: Artist[] }>(
        `/api/web/spotify/top-artists?time_range=${timeRange}`,
      ),
    ]).then(([tracks, artists]) => {
      if (cancelled) return;
      setLive((prev) => ({
        ...prev,
        tracks: tracks?.tracks ?? prev?.tracks,
        artists: artists?.artists ?? prev?.artists,
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [status, timeRange]);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    fetch("/api/web/spotify/playlists")
      .then((response) => (response.ok ? response.json() : undefined))
      .then((data: { playlists?: Playlist[] } | undefined) => {
        if (cancelled || !data?.playlists) return;
        setLive((prev) => ({ ...prev, playlists: data.playlists }));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [status]);

  const topTrackList = live?.tracks ?? topTracks;
  const topArtistList = (live?.artists ?? topArtists).slice(0, 3);
  // Playlist terurut frekuensi dengar (skor track favorit di dalamnya).
  const playlistList = (live?.playlists ?? playlists).slice(0, 5);

  console.log({ topTrackList, playlistList });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-4 pb-24 md:px-6">
      <div className="flex gap-2">
        {TIME_RANGE_TERMS.map((term) => (
          <Button
            key={term.value}
            type={timeRange === term.value ? "primary" : "default"}
            shape="round"
            onClick={() => setTimeRange(term.value)}
            className={
              timeRange === term.value
                ? "bg-spotify! text-black! hover:bg-spotify-strong! hover:text-black!"
                : "border-white/30! bg-transparent! text-white! hover:border-white! hover:text-white!"
            }
          >
            {term.label}
          </Button>
        ))}
      </div>

      <section className="space-y-4">
        <SectionHeader title="Top tracks" />
        <TrackList tracks={topTrackList} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Top artists" />
        <div className="flex gap-4">
          {topArtistList.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader title="Top playlists" />
        <PlaylistList playlists={playlistList} />
      </section>
    </div>
  );
}
