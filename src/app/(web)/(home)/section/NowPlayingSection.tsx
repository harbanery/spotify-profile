"use client";

import { useEffect, useState } from "react";
import NowPlayingCard from "@/features/web/components/ui/NowPlayingCard";
import { useWebSession } from "@/features/web/hooks/session";
import type { NowPlaying } from "@/services/player";

/** Interval polling pemutaran (ms) — seimbang vs rate limit Spotify API. */
const POLL_INTERVAL_MS = 10_000;

/**
 * Section lagu yang sedang diputar — dipisah dari ProfileSection agar
 * layout profile tidak menekan kartu. Kartu diposisikan tengah (vertikal
 * & horizontal) pada ruang setinggi 60% layar (min-h-[60vh]) dengan
 * lebar sebesar tablet (max-w-2xl); kartu tetap menyesuaikan kontennya.
 * Karena pemutaran bersifat live (lagu terus berputar, berganti, atau
 * dijeda), data dipoll berkala agar kartu selalu up-to-date; gangguan
 * jaringan sesaat mempertahankan data terakhir.
 */
export default function NowPlayingSection() {
  const { status } = useWebSession();
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const response = await fetch("/api/web/spotify/now-playing");
        const data: { nowPlaying?: NowPlaying | null } | null = response.ok
          ? await response.json()
          : null;
        // Null dari endpoint = tidak ada pemutaran aktif → kosongkan kartu.
        if (!cancelled) setNowPlaying(data?.nowPlaying ?? null);
      } catch {
        // Gagal fetch sesaat: pertahankan snapshot terakhir, tetap poll.
      }
      if (!cancelled) timer = setTimeout(load, POLL_INTERVAL_MS);
    };

    load();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [status]);

  // Tanpa pemutaran aktif, section tidak merender apa pun (tanpa spacer).
  if (!nowPlaying) return null;

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-10 md:px-6">
      <NowPlayingCard nowPlaying={nowPlaying} />
    </section>
  );
}
