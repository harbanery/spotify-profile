"use client";

import type { NowPlaying } from "@/services/player";
import { displayImage } from "@/utils/helpers";
import { useLocale } from "@/components/i18n/LocaleProvider";

interface NowPlayingCardProps {
  nowPlaying: NowPlaying;
}

/**
 * Kartu lagu yang sedang diputar — layout horizontal: cover ukuran
 * besar di kiri, teks di kanan (label "Now playing" dengan dot ping dua
 * lapis ala indikator "available" di portfolio — hanya di label, bukan
 * di sudut gambar — atau "Last playing" saat jeda, lalu judul lagu,
 * artis, dan playlist asal pemutaran di bawahnya). Tanpa durasi dan bar
 * progres; data segar (lagu berganti/play/pause) dijaga section lewat
 * polling. Lebar sebesar tablet (max-w-2xl); posisi tengah ditangani
 * section pembungkusnya. Label mengikuti locale aktif.
 */
export default function NowPlayingCard({ nowPlaying }: NowPlayingCardProps) {
  const { t } = useLocale();
  const { track, isPlaying } = nowPlaying;

  return (
    <div className="flex w-full max-w-2xl items-center gap-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displayImage(track.image, "/images/covers/cover-1.svg")}
        alt={`Cover ${track.album || track.title}`}
        width={256}
        height={256}
        className="size-32 shrink-0 rounded-xl object-cover shadow-2xl md:size-64"
      />

      <div className="min-w-0 h-full flex flex-col gap-4 justify-between">
        <p
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${
            isPlaying ? "text-spotify" : "text-subdued"
          }`}
        >
          {isPlaying ? (
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-spotify opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-spotify" />
            </span>
          ) : null}
          {isPlaying ? t("nowPlaying.now") : t("nowPlaying.last")}
        </p>
        <div className="min-w-0">
          <p className="mt-1 truncate text-xl font-bold text-ink md:text-2xl">
            {track.title}
          </p>
          <p className="truncate text-sm text-subdued">{track.artist}</p>
        </div>
        {nowPlaying.playlist ? (
          <p className="mt-1 truncate text-xs text-subdued">
            {t("nowPlaying.from")}{" "}
            <span className="font-semibold text-ink">
              {nowPlaying.playlist}
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
