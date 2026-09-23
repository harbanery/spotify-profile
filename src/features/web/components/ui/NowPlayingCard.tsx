"use client";

import { useEffect, useState } from "react";
import type { NowPlaying } from "@/services/player";
import { displayImage, formatDuration } from "@/utils/helpers";

interface NowPlayingCardProps {
  nowPlaying: NowPlaying;
}

/**
 * Kartu lagu yang sedang diputar: cover, judul, progres berjalan ( animasi
 * 1 detik dari snapshot progressMs), dan status playing/paused.
 */
export default function NowPlayingCard({ nowPlaying }: NowPlayingCardProps) {
  const { track, isPlaying } = nowPlaying;
  // Snapshot progressMs diambil sekali per mount (tidak berubah); tick
  // bertambah tiap detik via interval sehingga setState hanya di callback.
  const [tickMs, setTickMs] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const startedAt = Date.now();
    const timer = setInterval(() => {
      setTickMs(Date.now() - startedAt);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, nowPlaying.progressMs]);

  const progressMs = isPlaying
    ? Math.min(nowPlaying.progressMs + tickMs, track.duration * 1000)
    : nowPlaying.progressMs;

  const progressPercent = Math.min(
    100,
    (progressMs / Math.max(track.duration * 1000, 1)) * 100,
  );

  return (
    <div className="flex items-center gap-4 rounded-lg bg-elevated p-4">
      <div className="relative shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage(track.image, "/images/covers/cover-1.svg")}
          alt={`Cover ${track.album || track.title}`}
          width={96}
          height={96}
          className="size-20 rounded object-cover shadow-lg md:size-24"
        />
        <span
          className={`absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full shadow ${
            isPlaying ? "animate-pulse bg-spotify" : "bg-raised"
          }`}
          aria-label={isPlaying ? "Playing" : "Paused"}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-spotify">
          {isPlaying ? "Now playing" : "Paused"}
        </p>
        <p className="mt-1 truncate text-base font-semibold text-white md:text-lg">
          {track.title}
        </p>
        <p className="truncate text-sm text-subdued">{track.artist}</p>

        <div className="mt-3 flex items-center gap-2">
          <span className="w-10 text-right text-xs tabular-nums text-subdued">
            {formatDuration(Math.floor(progressMs / 1000))}
          </span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-raised">
            <div
              className="h-full rounded-full bg-spotify"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="w-10 text-xs tabular-nums text-subdued">
            {formatDuration(track.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
