"use client";

import { useRouter } from "next/navigation";
import type { Playlist } from "@/features/web/types";
import { displayImage } from "@/utils/helpers";

interface PlaylistListProps {
  playlists: Playlist[];
}

/**
 * Daftar playlist vertikal ala Spotify, tiap baris kiri-ke-kanan:
 * cover playlist lalu namanya. Navigasi ke halaman playlist memakai
 * useRouter (tanpa next/link sesuai konvensi proyek).
 */
export default function PlaylistList({ playlists }: PlaylistListProps) {
  const router = useRouter();

  return (
    <ol className="space-y-1">
      {playlists.map((playlist) => (
        <li
          key={playlist.id}
          role="button"
          tabIndex={0}
          onClick={() => router.push(`/playlist/${playlist.id}`)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              router.push(`/playlist/${playlist.id}`);
            }
          }}
          className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImage(playlist.cover, "/images/covers/cover-1.svg")}
            alt={`Cover ${playlist.name}`}
            width={48}
            height={48}
            className="size-12 shrink-0 rounded object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {playlist.name}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
