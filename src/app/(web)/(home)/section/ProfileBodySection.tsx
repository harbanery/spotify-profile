"use client";

import { useEffect, useState } from "react";
import { Button, Empty, Spin } from "antd";
import {
  CustomerServiceOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
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

/** Data live Spotify; slice yang gagal diambil menjadi [] (state empty). */
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
 * Statistik pendengaran di bawah kartu now playing, lebar max-w-4xl di
 * tengah: top artists (5 kartu horizontal, foto bulat atas + nama tengah,
 * judul & data terpusat), lalu top tracks (kiri) dan top playlists
 * (kanan) digabung grid dua kolom pada resolusi laptop — tablet/hp
 * turun menjadi satu kolom. Semua section (artists, tracks, playlists)
 * punya state loading (antd Spin) dan empty (antd Empty, ikon sesuai
 * section) dengan height mengikuti total data. Filter rentang waktu
 * satu di paling atas (antd Button
 * round, className Tailwind wajib berakhiran "!" sesuai konvensi proyek)
 * dan hanya berlaku ke top tracks dan top artists — playlist diambil
 * sekali per sesi (cukup data /me/playlists, tanpa skoring: layaknya
 * takeout time range, runInBatches, dan playlist items).
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

    // Rentang waktu hanya berlaku pada top tracks dan top artists
    // (playlist punya effect sendiri, tanpa filter).
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
        // Gagal ambil → [] (empty state per section).
        tracks: tracks?.tracks ?? prev?.tracks ?? [],
        artists: artists?.artists ?? prev?.artists ?? [],
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [status, timeRange]);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    // Playlist diambil sekali per sesi (cukup data /me/playlists) —
    // tidak mengikuti filter rentang waktu top tracks/artists.
    fetch("/api/web/spotify/playlists")
      .then((response) => (response.ok ? response.json() : undefined))
      .then((data: { playlists?: Playlist[] } | undefined) => {
        if (cancelled) return;
        setLive((prev) => ({
          ...prev,
          playlists: data?.playlists ?? prev?.playlists ?? [],
        }));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [status]);

  // Loading hanya saat sesi login aktif dan data live belum sempat tiba.
  const tracksLoading =
    status === "authenticated" && live?.tracks === undefined;
  const artistsLoading =
    status === "authenticated" && live?.artists === undefined;
  const playlistsLoading =
    status === "authenticated" && live?.playlists === undefined;

  const topTrackList = live?.tracks ?? topTracks;
  const topArtistList = (live?.artists ?? topArtists).slice(0, 5);
  // Playlist apa adanya dari /me/playlists (urutan API, tanpa skoring).
  const playlistList = (live?.playlists ?? playlists).slice(0, 5);

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

      <section className="space-y-4 text-center">
        <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
          Top artists
        </h2>
        {artistsLoading ? (
          <div className="flex justify-center items-center h-full min-h-48">
            <Spin />
          </div>
        ) : topArtistList.length === 0 ? (
          <div className="flex justify-center items-center h-full min-h-48">
            <Empty
              image={<TeamOutlined className="text-5xl! text-subdued!" />}
              description="No top artists yet"
            />
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            {topArtistList.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <section className="min-w-0 space-y-4">
          <SectionHeader title="Top tracks" />
          {tracksLoading ? (
            <div className="flex justify-center items-center h-full max-h-84">
              <Spin />
            </div>
          ) : topTrackList.length === 0 ? (
            <div className="flex justify-center items-center h-full max-h-84">
              <Empty
                image={
                  <CustomerServiceOutlined className="text-5xl! text-subdued!" />
                }
                description="No top tracks yet"
              />
            </div>
          ) : (
            <TrackList tracks={topTrackList} />
          )}
        </section>

        <section className="min-w-0 space-y-4">
          <SectionHeader title="Top playlists" />
          {playlistsLoading ? (
            <div className="flex justify-center items-center h-full max-h-84">
              <Spin />
            </div>
          ) : playlistList.length === 0 ? (
            <div className="flex justify-center items-center h-full max-h-84">
              <Empty
                image={
                  <UnorderedListOutlined className="text-5xl! text-subdued!" />
                }
                description="No playlists yet"
              />
            </div>
          ) : (
            <PlaylistList playlists={playlistList} />
          )}
        </section>
      </div>
    </div>
  );
}
