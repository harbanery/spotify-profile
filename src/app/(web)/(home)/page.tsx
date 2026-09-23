import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ProfileSection from "./section/ProfileSection";
import ProfileBodySection from "./section/ProfileBodySection";
import { getProfile } from "@/services/profile";
import { getPublicPlaylists } from "@/services/playlist";
import { getTopTracks } from "@/services/track";
import { getArtists } from "@/services/artist";
import { isSessionViable, readSpotifySession } from "@/lib/spotify";
import { OWNER_NAME } from "@/utils/config/variables";

export const metadata: Metadata = {
  title: OWNER_NAME,
};

/**
 * Entry point beranda — setipis mungkin, data dari services.
 * Beranda statistik wajib login Spotify (proteksi cepat juga di proxy.ts);
 * token kedaluwarsa disegarkan route handler lewat refresh token.
 */
export default async function HomePage() {
  const session = await readSpotifySession();
  if (!isSessionViable(session)) {
    redirect("/login");
  }

  return (
    <div>
      <ProfileSection user={getProfile()} />
      <ProfileBodySection
        topTracks={getTopTracks(5)}
        artists={getArtists()}
        playlists={getPublicPlaylists()}
      />
    </div>
  );
}
