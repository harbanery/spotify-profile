"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/features/web/components/ui/SectionHeader";
import TrackList from "@/features/web/components/ui/TrackList";
import PlaylistList from "@/features/web/components/ui/PlaylistList";
import { useWebSession } from "@/features/web/hooks/session";
import type { Playlist, Track } from "@/features/web/types";

interface ProfileBodySectionProps {
  /** Data dummy untuk pengunjung yang belum login Spotify. */
  topTracks: Track[];
  playlists: Playlist[];
}

/** Data live Spotify; slice yang gagal diambil tetap undefined (fallback dummy). */
interface LiveData {
  tracks?: Track[];
  playlists?: Playlist[];
}

/**
 * Statistik pendengaran di bawah header profil: top tracks dan top
 * playlists bulan ini dalam bentuk daftar (cover, judul, subjudul artis
 * khusus track). Saat login, data live menggantikan dummy per-section.
 */
export default function ProfileBodySection({
  topTracks,
  playlists,
}: ProfileBodySectionProps) {
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
      getJson<{ tracks: Track[] }>("/api/web/spotify/top-tracks"),
      getJson<{ playlists: Playlist[] }>("/api/web/spotify/playlists"),
    ]).then(([tracks, playlistsData]) => {
      if (cancelled) return;
      setLive({
        tracks: tracks?.tracks,
        playlists: playlistsData?.playlists,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [status]);

  const topTrackList = live?.tracks ?? topTracks;
  // Spotify API tidak menyediakan jumlah pemutaran per playlist —
  // tampilkan 5 playlist teratas milik user.
  const playlistList = (live?.playlists ?? playlists).slice(0, 5);

  console.log({ topTrackList, playlistList });

  return (
    <div className="space-y-10 px-4 pb-24 md:px-6">
      <section className="space-y-4">
        <SectionHeader title="Top tracks this month" />
        <TrackList tracks={topTrackList} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Top playlists this month" />
        <PlaylistList playlists={playlistList} />
      </section>
    </div>
  );
}
