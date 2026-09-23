import TrackTable from "@/features/web/components/ui/TrackTable";
import type { Playlist } from "@/features/web/types";
import { formatTotalDuration } from "@/utils/helpers";

/**
 * Header + daftar lagu halaman playlist ala Spotify — fokus statistik,
 * tanpa kontrol pemutaran (web ini bukan media player).
 */
export default function PlaylistSection({ playlist }: { playlist: Playlist }) {
  const tracks = playlist.tracks ?? [];
  return (
    <div className="pb-24">
      <section
        className="flex flex-col items-start gap-6 p-4 pt-6 md:flex-row md:items-end md:p-6 md:pt-8"
        style={{
          background: `linear-gradient(180deg, ${playlist.color ?? "#1e3264"} 0%, rgba(18, 18, 18, 0.6) 100%)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={playlist.cover}
          alt={`Cover ${playlist.name}`}
          width={232}
          height={232}
          className="size-40 rounded shadow-2xl md:size-56"
        />
        <div className="min-w-0">
          <p className="text-xs font-bold text-white">Playlist</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white md:text-6xl lg:text-7xl">
            {playlist.name}
          </h1>
          <p className="mt-4 text-sm text-white/70">{playlist.description}</p>
          <p className="mt-2 text-sm font-semibold text-white">
            {playlist.owner} • {tracks.length} songs,{" "}
            {formatTotalDuration(tracks.map((track) => track.duration))}
          </p>
        </div>
      </section>

      <section className="bg-gradient-to-b from-black/40 to-transparent px-4 pt-4 md:px-6">
        <TrackTable tracks={tracks} showPlays />
      </section>
    </div>
  );
}
