"use client";

import type { Artist } from "@/features/web/types";

/**
 * Kartu artis untuk deret horizontal top artists: foto bulat di atas,
 * nama artis di bawah, keduanya di tengah (ala kartu artis Spotify).
 */
export default function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <div className="w-36 shrink-0 rounded-lg bg-transparent p-3 text-center transition-colors hover:bg-raised md:w-40">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={artist.image}
        alt={`Foto ${artist.name}`}
        width={160}
        height={160}
        className="mx-auto mb-3 aspect-square w-full rounded-full object-cover shadow-lg"
      />
      <p className="truncate text-sm font-semibold text-white">{artist.name}</p>
    </div>
  );
}
