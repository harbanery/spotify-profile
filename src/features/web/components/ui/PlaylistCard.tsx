"use client";

import { useRouter } from "next/navigation";
import type { Playlist } from "@/features/web/types";

/**
 * Kartu playlist ala Spotify — navigasi ke halaman playlist memakai
 * useRouter (tanpa overlay play: web ini bukan media player).
 */
export default function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const router = useRouter();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/playlist/${playlist.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/playlist/${playlist.id}`);
        }
      }}
      className="w-full cursor-pointer rounded-lg bg-elevated p-3 text-left transition-colors hover:bg-[#282828]"
    >
      <div className="relative mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={playlist.cover}
          alt={`Cover ${playlist.name}`}
          width={200}
          height={200}
          className="aspect-square w-full rounded object-cover shadow-lg"
        />
      </div>
      <p className="truncate font-semibold text-white">{playlist.name}</p>
      <p className="mt-1 line-clamp-2 min-h-8 text-sm text-subdued">{playlist.description}</p>
    </div>
  );
}
