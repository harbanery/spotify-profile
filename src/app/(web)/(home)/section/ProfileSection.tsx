"use client";

import type { UserProfile } from "@/features/web/types";
import { formatCount } from "@/utils/helpers";
import { useWebSession } from "@/features/web/hooks/session";
import WebNavbar from "@/features/web/components/layout/navbar/WebNavbar";

interface ProfileSectionProps {
  /** Profil dummy untuk pengunjung yang belum login Spotify. */
  user: UserProfile;
}

/**
 * Header profil ala Spotify: avatar bulat besar di atas gradasi biru,
 * konten selebar max-w-5xl di tengah. Saat login, data dummy diganti
 * profil akun Spotify asli pengguna. Kartu "Now Playing" hidup di
 * section terpisah (NowPlayingSection); tombol login/logout ada di
 * WebNavbar (fixed, mengikuti scroll).
 */
export default function ProfileSection({ user }: ProfileSectionProps) {
  const { status, user: sessionUser } = useWebSession();
  const profile =
    status === "authenticated" && sessionUser ? sessionUser : user;
  console.log({ profile });

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-80"
        style={{
          background: "linear-gradient(180deg, #1ed760 0%, #121212 100%)",
        }}
      />
      <div className="relative w-full max-w-4xl mx-auto flex flex-col gap-6 px-4 pt-10 pb-8 md:px-6 md:pt-16">
        <div className="flex min-w-0 flex-col items-start gap-6 md:flex-row md:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatar}
            alt={`Avatar ${profile.displayName}`}
            width={208}
            height={208}
            className="size-36 rounded-full object-cover shadow-2xl md:size-52"
          />
          <div className="min-w-0">
            <h1 className="mt-2 text-5xl font-black tracking-tight text-white md:text-8xl">
              {profile.displayName}
            </h1>
            <p className="mt-4 text-sm text-white/80">
              {profile.handle}
              {profile.publicPlaylists > 0 &&
                ` • ${profile.publicPlaylists} public playlists`}
              {profile.followers > 0 &&
                ` • ${formatCount(profile.followers)} followers`}
            </p>
          </div>
        </div>
      </div>
      {/* overflow-hidden mengurung gradasi dekoratif: tanpa ini gradasi
          (positioned) melukis di atas konten statis section berikutnya dan
          menutupi ~50% judul "Top tracks". */}
      <WebNavbar />
    </section>
  );
}
