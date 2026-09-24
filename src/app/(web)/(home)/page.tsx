import type { Metadata } from "next";
import ProfileSection from "./section/ProfileSection";
import NowPlayingSection from "./section/NowPlayingSection";
import ProfileBodySection from "./section/ProfileBodySection";
import LoginGateSection from "./section/LoginGateSection";
import WebFooter from "@/features/web/components/layout/footer/WebFooter";
import { getProfile } from "@/services/profile";
import { getPublicPlaylists } from "@/services/playlist";
import { getTopTracks } from "@/services/track";
import { isSessionViable, readSpotifySession } from "@/lib/spotify";
import { OWNER_NAME } from "@/utils/config/variables";

export const metadata: Metadata = {
  title: OWNER_NAME,
};

/**
 * Entry point beranda — setipis mungkin, data dari services.
 * Belum login → gerbang login satu layar (LoginGateSection); pesan error
 * alur OAuth datang via ?auth_error=... Setelah login → statistik personal
 * (token kedaluwarsa disegarkan route handler lewat refresh token).
 */
export default async function HomePage({
  searchParams,
}: PageProps<"/">) {
  const [{ auth_error: authError, origin }, session] = await Promise.all([
    searchParams,
    readSpotifySession(),
  ]);

  if (!isSessionViable(session)) {
    const error = Array.isArray(authError) ? authError[0] : authError;
    const originValue = Array.isArray(origin) ? origin[0] : origin;
    return <LoginGateSection authError={error} origin={originValue} />;
  }

  return (
    <div>
      <ProfileSection user={getProfile()} />
      <NowPlayingSection />
      <ProfileBodySection
        topTracks={getTopTracks(5)}
        playlists={getPublicPlaylists()}
      />
      <WebFooter />
    </div>
  );
}
