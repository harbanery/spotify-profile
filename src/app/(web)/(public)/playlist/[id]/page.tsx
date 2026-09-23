import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PlaylistSection from "./section/PlaylistSection";
import { getPlaylistById, getPlaylists, getPlaylistLive } from "@/services/playlist";
import { readSpotifySession, isSessionTokenUsable } from "@/lib/spotify";

export async function generateMetadata({
  params,
}: PageProps<"/playlist/[id]">): Promise<Metadata> {
  const { id } = await params;
  const playlist = getPlaylistById(id);
  return { title: playlist ? playlist.name : "Playlist" };
}

export function generateStaticParams() {
  return getPlaylists().map((playlist) => ({ id: playlist.id }));
}

/**
 * Detail playlist: dummy untuk ID statis, atau data Spotify Web API saat
 * user login dan ID tersebut adalah playlist asli Spotify. Pembacaan
 * cookie hanya terjadi saat dummy meleset sehingga path dummy tetap statis.
 */
export default async function PlaylistPage({
  params,
}: PageProps<"/playlist/[id]">) {
  const { id } = await params;
  const playlist = getPlaylistById(id);

  if (playlist) {
    return <PlaylistSection playlist={playlist} />;
  }

  // Fallback live: Server Component hanya membaca cookie (tidak refresh
  // token — itu dilakukan route handler). Token kedaluwarsa → 404.
  const session = await readSpotifySession();
  if (session && isSessionTokenUsable(session)) {
    const livePlaylist = await getPlaylistLive(id, session.accessToken);
    if (livePlaylist) {
      return <PlaylistSection playlist={livePlaylist} />;
    }
  }

  notFound();
}
