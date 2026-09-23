"use client";

import type { Artist } from "@/features/web/types";
import { formatCompact } from "@/utils/helpers";

/**
 * Kartu artis bulat ala Spotify.
 */
export default function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <div className="group w-36 shrink-0 cursor-pointer rounded-lg bg-elevated p-3 transition-colors hover:bg-[#282828] md:w-40">
      <div className="relative mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artist.image}
          alt={artist.name}
          width={160}
          height={160}
          className="aspect-square w-full rounded-full object-cover shadow-lg"
        />
      </div>
      <p className="truncate font-semibold text-white">{artist.name}</p>
      <p className="mt-1 text-sm text-subdued">
        {artist.genre} • {formatCompact(artist.listeners)} listeners
      </p>
    </div>
  );
}
