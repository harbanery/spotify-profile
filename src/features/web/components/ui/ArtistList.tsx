"use client";

import type { Artist } from "@/features/web/types";

interface ArtistListProps {
  artists: Artist[];
}

/**
 * Daftar artis vertikal (mode list) — pasangan ArtistCard: foto bulat di
 * kiri, hanya nama artis di kanan (tanpa teks genre/placeholder "Music").
 * Berdiri sebagai kolom kiri pada grid 2 kolom mode list (top tracks di
 * kanan); turun menjadi 1 kolom di resolusi tablet/hp.
 */
export default function ArtistList({ artists }: ArtistListProps) {
  return (
    <ol className="space-y-1">
      {artists.map((artist) => (
        <li
          key={artist.id}
          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artist.image}
            alt={`Foto ${artist.name}`}
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {artist.name}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
