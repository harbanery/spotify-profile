"use client";

import type { UserProfile } from "@/features/web/types";
import { formatCount } from "@/utils/helpers";
import { useWebSession } from "@/features/web/hooks/session";
import SpotifyLoginButton from "@/features/web/components/ui/SpotifyLoginButton";

interface ProfileSectionProps {
  /** Profil dummy untuk pengunjung yang belum login Spotify. */
  user: UserProfile;
}

/**
 * Header profil ala Spotify: avatar bulat besar di atas gradasi biru.
 * Saat login, data dummy diganti profil akun Spotify asli pengguna.
 * Profil pengguna adalah beranda web ini (fokus statistik, bukan player).
 */
export default function ProfileSection({ user }: ProfileSectionProps) {
  const { status, user: sessionUser } = useWebSession();
  const profile =
    status === "authenticated" && sessionUser ? sessionUser : user;

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-80"
        style={{
          background: "linear-gradient(180deg, #2f5c8f 0%, #121212 100%)",
        }}
      />
      <div className="relative flex flex-col items-start gap-6 px-4 pt-10 pb-8 md:flex-row md:items-end md:px-6 md:pt-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.avatar}
          alt={`Avatar ${profile.displayName}`}
          width={208}
          height={208}
          className="size-36 rounded-full object-cover shadow-2xl md:size-52"
        />
        <div className="min-w-0">
          <p className="text-xs font-bold text-white">Profile</p>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-white md:text-8xl">
            {profile.displayName}
          </h1>
          <p className="mt-4 text-sm text-white/80">
            {profile.handle} • {profile.publicPlaylists} public playlists •{" "}
            {formatCount(profile.followers)} followers •{" "}
            {formatCount(profile.following)} following
          </p>
        </div>
      </div>
      {/* overflow-hidden mengurung gradasi dekoratif: tanpa ini gradasi
          (positioned) melukis di atas konten statis section berikutnya dan
          menutupi ~50% judul "Top tracks this month". */}
      <div className="absolute right-4 top-4 md:right-6 md:top-6">
        <SpotifyLoginButton />
      </div>
    </section>
  );
}
