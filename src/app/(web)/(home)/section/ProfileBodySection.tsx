"use client";

import { useEffect, useState } from "react";
import { Button } from "antd";
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

/** Rentang waktu statistik (tombol round "This month/This year"). */
type TimeRange = "short_term" | "long_term";

const TIME_RANGE_TERMS: Array<{ label: string; value: TimeRange }> = [
  { label: "This month", value: "short_term" },
  { label: "This year", value: "long_term" },
];

/**
 * Statistik pendengaran di bawah kartu now playing: top tracks dan top
 * playlists masing-masing menjadi satu layar penuh (min-h-screen) yang
 * diposisikan tengah, satu kolom (bukan grid dua kolom), lebar sebesar
 * laptop (max-w-4xl). Filter rentang waktu memakai antd Button round ala
 * tombol login/logout (className Tailwind wajib berakhiran "!" sesuai
 * konvensi proyek); playlist tidak difilter karena Spotify API tidak
 * punya konsep waktu pada playlist — datanya playlist user yang paling
 * relevan/sering dipakai. Saat login, data live menggantikan dummy; top
 * tracks diambil ulang mengikuti rentang waktu.
 */
export default function ProfileBodySection({
  topTracks,
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

    // Rentang waktu hanya berlaku pada top tracks; playlist tetap.
    getJson<{ tracks: Track[] }>(
      `/api/web/spotify/top-tracks?time_range=${timeRange}`,
    ).then((tracks) => {
      if (cancelled || !tracks?.tracks) return;
      setLive((prev) => ({ ...prev, tracks: tracks.tracks }));
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
  // Spotify API tidak menyediakan jumlah pemutaran per playlist —
  // tampilkan 5 playlist teratas milik user.
  const playlistList = (live?.playlists ?? playlists).slice(0, 5);

  console.log({ topTrackList, playlistList });

  return (
    <>
      <section className="flex min-h-screen items-center justify-center px-4 md:px-6">
        <div className="w-full max-w-4xl space-y-4">
          <SectionHeader
            title="Top tracks"
            action={
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
            }
          />
          <TrackList tracks={topTrackList} />
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 pb-24 md:px-6">
        <div className="w-full max-w-4xl space-y-4">
          <SectionHeader title="Top playlists" />
          <PlaylistList playlists={playlistList} />
        </div>
      </section>
    </>
  );
}
