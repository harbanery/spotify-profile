"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button, Empty, Spin } from "antd";
import {
  AppstoreOutlined,
  CustomerServiceOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import SectionHeader from "@/features/web/components/ui/SectionHeader";
import TrackList from "@/features/web/components/ui/TrackList";
import TrackCard from "@/features/web/components/ui/TrackCard";
import ArtistCard from "@/features/web/components/ui/ArtistCard";
import ArtistList from "@/features/web/components/ui/ArtistList";
import { useWebSession } from "@/features/web/hooks/session";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { TranslationKey } from "@/components/i18n/translations";
import type { Artist, Track } from "@/features/web/types";

interface ProfileBodySectionProps {
  /** Data dummy untuk pengunjung yang belum login Spotify. */
  topTracks: Track[];
  topArtists: Artist[];
}

/** Data live Spotify; slice yang gagal diambil menjadi [] (state empty). */
interface LiveData {
  tracks?: Track[];
  artists?: Artist[];
}

/** Rentang waktu statistik (tombol round "This month/This year"). */
type TimeRange = "short_term" | "long_term";

/** Mode tampilan top artists/tracks (tombol round Grid/List). */
type LayoutMode = "grid" | "list";

const TIME_RANGE_TERMS: Array<{ value: TimeRange; labelKey: TranslationKey }> =
  [
    { value: "short_term", labelKey: "filter.shortTerm" },
    { value: "long_term", labelKey: "filter.longTerm" },
  ];

const LAYOUT_MODES: Array<{
  value: LayoutMode;
  icon: ReactNode;
  labelKey: TranslationKey;
}> = [
  { value: "grid", icon: <AppstoreOutlined />, labelKey: "layout.grid" },
  { value: "list", icon: <UnorderedListOutlined />, labelKey: "layout.list" },
];

/**
 * Deret kartu mode grid: memenuhi lebar max-w-4xl dan di tengah saat
 * resolusi laptop; di resolusi tablet & hp deretnya discroll horizontal
 * (overflow) tanpa menyusutkan kartu.
 */
const CardRow = ({ children }: { children: ReactNode }) => (
  <div className="scrollbar-thin -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:justify-center lg:overflow-visible lg:px-0 lg:pb-0">
    {children}
  </div>
);

/**
 * Statistik pendengaran di bawah kartu now playing, lebar max-w-4xl di
 * tengah: top artists dan top tracks dengan DUA layout lewat filter
 * tampilan di sebelah kanan filter term (gaya tombol sama):
 * - grid: kartu ala top artists — tiap section max-w-4xl, deret kartu
 *   overflow scroll di tablet/hp.
 * - list: baris ala top tracks — keduanya disusun grid 2 kolom max-w-4xl
 *   (top artists kiri, top tracks kanan), turun 1 kolom di tablet/hp
 *   (tiap kolom tetap selebar max-w-4xl).
 * Semua section punya state loading (antd Spin) dan empty (antd Empty,
 * ikon per section) dengan height mengikuti total data. Top playlists
 * sudah di-takeout bersama halaman playlist; filter term berlaku ke
 * kedua section ini. className Tailwind pada antd wajib berakhiran "!"
 * (konvensi proyek).
 */
export default function ProfileBodySection({
  topTracks,
  topArtists,
}: ProfileBodySectionProps) {
  const { status } = useWebSession();
  const { t } = useLocale();
  const [timeRange, setTimeRange] = useState<TimeRange>("short_term");
  const [layout, setLayout] = useState<LayoutMode>("grid");
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

    // Rentang waktu berlaku pada top tracks dan top artists.
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

  // Loading hanya saat sesi login aktif dan data live belum sempat tiba.
  const tracksLoading =
    status === "authenticated" && live?.tracks === undefined;
  const artistsLoading =
    status === "authenticated" && live?.artists === undefined;

  const topTrackList = live?.tracks ?? topTracks;
  const topArtistList = (live?.artists ?? topArtists).slice(0, 5);

  // Isi section per layout — state loading/empty dipakai bersama.
  const artistsBody = artistsLoading ? (
    <div className="flex justify-center items-center h-full min-h-48">
      <Spin />
    </div>
  ) : topArtistList.length === 0 ? (
    <div className="flex justify-center items-center h-full min-h-48">
      <Empty
        image={<TeamOutlined className="text-5xl! text-subdued!" />}
        description={t("empty.topArtists")}
      />
    </div>
  ) : layout === "grid" ? (
    <CardRow>
      {topArtistList.map((artist) => (
        <ArtistCard key={artist.id} artist={artist} />
      ))}
    </CardRow>
  ) : (
    <ArtistList artists={topArtistList} />
  );

  const tracksBody = tracksLoading ? (
    <div className="flex justify-center items-center h-full max-h-84">
      <Spin />
    </div>
  ) : topTrackList.length === 0 ? (
    <div className="flex justify-center items-center h-full max-h-84">
      <Empty
        image={<CustomerServiceOutlined className="text-5xl! text-subdued!" />}
        description={t("empty.topTracks")}
      />
    </div>
  ) : layout === "grid" ? (
    <CardRow>
      {topTrackList.map((track) => (
        <TrackCard key={track.id} track={track} />
      ))}
    </CardRow>
  ) : (
    <TrackList tracks={topTrackList} />
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-4 pb-24 md:px-6">
      {/* Toolbar: filter term di kiri, filter layout di sebelah kanannya. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
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
                  : "border-line-strong! bg-transparent! text-ink! hover:border-ink! hover:text-ink!"
              }
            >
              {t(term.labelKey)}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          {LAYOUT_MODES.map((mode) => (
            <Button
              key={mode.value}
              type={layout === mode.value ? "primary" : "default"}
              shape="round"
              icon={mode.icon}
              onClick={() => setLayout(mode.value)}
              className={
                layout === mode.value
                  ? "bg-spotify! text-black! hover:bg-spotify-strong! hover:text-black!"
                  : "border-line-strong! bg-transparent! text-ink! hover:border-ink! hover:text-ink!"
              }
            >
              {t(mode.labelKey)}
            </Button>
          ))}
        </div>
      </div>

      {layout === "list" ? (
        /* Mode list: grid 2 kolom — top artists kiri, top tracks kanan;
           turun 1 kolom (tiap kolom tetap max-w-4xl) di tablet/hp. */
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <section className="min-w-0 space-y-4">
            <SectionHeader title={t("section.topArtists")} />
            {artistsBody}
          </section>
          <section className="min-w-0 space-y-4">
            <SectionHeader title={t("section.topTracks")} />
            {tracksBody}
          </section>
        </div>
      ) : (
        /* Mode grid: section bertumpuk, tiap deret kartu max-w-4xl. */
        <>
          <section className="space-y-4 text-center">
            <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">
              {t("section.topArtists")}
            </h2>
            {artistsBody}
          </section>
          <section className="space-y-4 text-center">
            <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">
              {t("section.topTracks")}
            </h2>
            {tracksBody}
          </section>
        </>
      )}
    </div>
  );
}
