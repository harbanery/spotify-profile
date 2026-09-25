"use client";

import type { Track } from "@/features/web/types";
import { displayImage } from "@/utils/helpers";

interface TrackListProps {
  tracks: Track[];
}

/**
 * Daftar lagu vertikal ala Spotify (mode list): tiap baris kiri-ke-kanan
 * cover album, lalu judul lagu dengan nama artis sebagai subjudul.
 * Berdiri sebagai kolom kanan pada grid 2 kolom mode list (top artists
 * di kiri); turun menjadi 1 kolom di resolusi tablet/hp.
 */
export default function TrackList({ tracks }: TrackListProps) {
  return (
    <ol className="space-y-1">
      {tracks.map((track) => (
        <li
          key={track.id}
          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-hoverfill"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImage(track.image, "/images/covers/cover-1.svg")}
            alt={`Cover ${track.album || track.title}`}
            width={48}
            height={48}
            className="size-12 shrink-0 rounded object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {track.title}
            </p>
            <p className="truncate text-sm text-subdued">{track.artist}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
