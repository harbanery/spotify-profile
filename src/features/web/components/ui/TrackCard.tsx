"use client";

import type { Track } from "@/features/web/types";
import { displayImage } from "@/utils/helpers";

/**
 * Kartu lagu untuk deret grid Top tracks — pasangan TrackList di mode
 * list: cover album kotak (rounded) di atas, judul lagu + artis di
 * bawah, ala ArtistCard. shrink-0 agar kartu tidak menyusut saat
 * deretnya discroll di resolusi tablet/hp.
 */
export default function TrackCard({ track }: { track: Track }) {
  return (
    <div className="w-36 shrink-0 rounded-lg bg-transparent p-3 text-center transition-colors hover:bg-raised md:w-40">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displayImage(track.image, "/images/covers/cover-1.svg")}
        alt={`Cover ${track.album || track.title}`}
        width={160}
        height={160}
        className="mx-auto mb-3 aspect-square w-full rounded-lg object-cover shadow-lg"
      />
      <p className="truncate text-sm font-semibold text-ink">
        {track.title}
      </p>
      <p className="mt-0.5 truncate text-xs text-subdued">{track.artist}</p>
    </div>
  );
}
