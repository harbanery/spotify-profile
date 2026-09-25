"use client";

import type { UserProfile } from "@/features/web/types";
import { formatCount } from "@/utils/helpers";
import { useWebSession } from "@/features/web/hooks/session";
import { useLocale } from "@/components/i18n/LocaleProvider";
import WebNavbar from "@/features/web/components/layout/navbar/WebNavbar";

interface ProfileSectionProps {
  /** Profil dummy untuk pengunjung yang belum login Spotify. */
  user: UserProfile;
}

/**
 * Header profil ala Spotify: avatar bulat besar di atas gradasi aksen
 * ke base (warna mengikuti tema aktif), konten selebar max-w-4xl di
 * tengah. Saat login, data dummy diganti profil akun Spotify asli
 * pengguna. Kartu "Now Playing" hidup di section terpisah
 * (NowPlayingSection); navbar (fixed, mengikuti scroll) memuat toggle
 * bahasa, toggle tema, dan tombol login/logout.
 */
export default function ProfileSection({ user }: ProfileSectionProps) {
  const { status, user: sessionUser } = useWebSession();
  const { t } = useLocale();
  const profile =
    status === "authenticated" && sessionUser ? sessionUser : user;

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-80"
        style={{
          background:
            "linear-gradient(180deg, var(--c-accent) 0%, var(--c-base) 100%)",
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
            <h1 className="mt-2 text-5xl font-black tracking-tight text-ink md:text-8xl">
              {profile.displayName}
            </h1>
            <p className="mt-4 text-sm text-ink/80">
              {profile.handle}
              {profile.publicPlaylists > 0 &&
                ` • ${t("profile.publicPlaylists", {
                  count: profile.publicPlaylists,
                })}`}
              {profile.followers > 0 &&
                ` • ${t("profile.followers", {
                  count: formatCount(profile.followers),
                })}`}
            </p>
          </div>
        </div>
      </div>
      {/* overflow-hidden mengurung gradasi dekoratif: tanpa ini gradasi
          (positioned) melukis di atas konten statis section berikutnya. */}
      <WebNavbar />
    </section>
  );
}
