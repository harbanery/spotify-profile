"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/features/web/components/ui/SectionHeader";
import ArtistCard from "@/features/web/components/ui/ArtistCard";
import PlaylistCard from "@/features/web/components/ui/PlaylistCard";
import MediaRow from "@/features/web/components/ui/MediaRow";
import TrackTable from "@/features/web/components/ui/TrackTable";
import NowPlayingCard from "@/features/web/components/ui/NowPlayingCard";
import type { NowPlaying } from "@/services/player";
import { useWebSession } from "@/features/web/hooks/session";
import type { Artist, Playlist, Track } from "@/features/web/types";

interface ProfileBodySectionProps {
  /** Data dummy untuk pengunjung yang belum login Spotify. */
  topTracks: Track[];
  artists: Artist[];
  playlists: Playlist[];
}

type Tab = "all" | "playlists" | "artists";

/** Data live Spotify; slice yang gagal diambil tetap undefined (fallback dummy). */
interface LiveData {
  nowPlaying?: NowPlaying | null;
  tracks?: Track[];
  artists?: Artist[];
  playlists?: Playlist[];
}

/**
 * Konten bawah halaman profil: lagu favorit, artis teratas, playlist publik.
 * Saat login Spotify, statistik live menggantikan data dummy per-section.
 * Tab "playlists"/"artists" memfokuskan tampilan pada satu jenis konten.
 */
export default function ProfileBodySection({
  topTracks,
  artists,
  playlists,
}: ProfileBodySectionProps) {
  const [tab, setTab] = useState<Tab>("all");
  const { status } = useWebSession();
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

    Promise.all([
      getJson<{ nowPlaying: NowPlaying | null }>(
        "/api/web/spotify/now-playing",
      ),
      getJson<{ tracks: Track[] }>("/api/web/spotify/top-tracks"),
      getJson<{ artists: Artist[] }>("/api/web/spotify/top-artists"),
      getJson<{ playlists: Playlist[] }>("/api/web/spotify/playlists"),
    ]).then(([nowPlaying, tracks, artistsData, playlistsData]) => {
      if (cancelled) return;
      setLive({
        nowPlaying: nowPlaying?.nowPlaying,
        tracks: tracks?.tracks,
        artists: artistsData?.artists,
        playlists: playlistsData?.playlists,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [status]);

  const topTrackList = live?.tracks ?? topTracks;
  const artistList = live?.artists ?? artists;
  // Spotify API tidak menyediakan jumlah pemutaran per playlist —
  // tampilkan 5 playlist teratas milik user.
  const playlistList = (live?.playlists ?? playlists).slice(0, 5);

  return (
    <div className="space-y-10 px-4 pb-24 md:px-6">
      {live?.nowPlaying ? (
        <section>
          <NowPlayingCard nowPlaying={live.nowPlaying} />
        </section>
      ) : null}

      <section className="space-y-4">
        <SectionHeader title="Top tracks this month" />
        <TrackTable tracks={topTrackList} />
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Top artists this month"
          action={
            <span className="flex gap-1">
              {(["all", "playlists", "artists"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                    tab === value
                      ? "bg-white text-black"
                      : "bg-white/10 text-subdued hover:bg-white/20"
                  }`}
                >
                  {value}
                </button>
              ))}
            </span>
          }
        />
        {tab !== "playlists" ? (
          <MediaRow>
            {artistList.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </MediaRow>
        ) : null}
      </section>

      {tab !== "artists" ? (
        <section className="space-y-4">
          <SectionHeader title="Public playlists" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {playlistList.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
