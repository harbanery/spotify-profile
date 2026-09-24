"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "@/features/web/types";
import { formatCount } from "@/utils/helpers";
import { useWebSession } from "@/features/web/hooks/session";
import SpotifyLoginButton from "@/features/web/components/ui/SpotifyLoginButton";
import NowPlayingCard from "@/features/web/components/ui/NowPlayingCard";
import type { NowPlaying } from "@/services/player";

interface ProfileSectionProps {
  /** Profil dummy untuk pengunjung yang belum login Spotify. */
  user: UserProfile;
}

/**
 * Header profil ala Spotify: avatar bulat besar di atas gradasi biru,
 * dengan kartu "Now Playing" di bawah profil saat ada pemutaran aktif.
 * Saat login, data dummy diganti profil akun Spotify asli pengguna.
 */
export default function ProfileSection({ user }: ProfileSectionProps) {
  const { status, user: sessionUser } = useWebSession();
  const profile =
    status === "authenticated" && sessionUser ? sessionUser : user;
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    fetch("/api/web/spotify/now-playing")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { nowPlaying?: NowPlaying | null } | null) => {
        if (!cancelled) setNowPlaying(data?.nowPlaying ?? null);
      })
      .catch(() => {
        if (!cancelled) setNowPlaying(null);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-80"
        style={{
          background: "linear-gradient(180deg, #2f5c8f 0%, #121212 100%)",
        }}
      />
      <div className="relative flex flex-col gap-6 px-4 pt-10 pb-8 md:px-6 md:pt-16">
        <div className="flex min-w-0 flex-col items-start gap-6 md:flex-row md:items-end">
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

        {nowPlaying ? (
          <div className="w-full md:w-96">
            <NowPlayingCard nowPlaying={nowPlaying} />
          </div>
        ) : null}
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
