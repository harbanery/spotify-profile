"use client";

import { useEffect, useState } from "react";
import NowPlayingCard from "@/features/web/components/ui/NowPlayingCard";
import { useWebSession } from "@/features/web/hooks/session";
import type { NowPlaying } from "@/services/player";

/** Interval polling dasar (ms) — jangan lebih agresif dari ini (kuota dev). */
const POLL_INTERVAL_MS = 10_000;
/** Interval saat tab tersembunyi (ms) — hemat kuota Spotify. */
const POLL_HIDDEN_MS = 60_000;
/** Batas atas backoff kegagalan (ms). */
const POLL_MAX_BACKOFF_MS = 60_000;

/**
 * Section lagu yang sedang diputar — dipisah dari ProfileSection agar
 * layout profile tidak menekan kartu. Kartu diposisikan tengah (vertikal
 * & horizontal) pada ruang setinggi 60% layar (min-h-[60vh]) dengan
 * lebar sebesar tablet (max-w-2xl); kartu tetap menyesuaikan kontennya.
 * Karena pemutaran bersifat live (lagu terus berputar, berganti, atau
 * dijeda), data dipoll agar kartu selalu up-to-date — P0 proteksi kuota:
 * polling adaptif (jeda panjang saat tab tersembunyi, backoff
 * eksponensial saat gagal, request basi di-abort) dan interval dasar
 * tidak lebih agresif dari 10 detik.
 */
export default function NowPlayingSection() {
  const { status } = useWebSession();
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;

    const schedule = (ms: number) => {
      clearTimeout(timer);
      timer = setTimeout(load, ms);
    };

    const load = async () => {
      // Tab tersembunyi: tunda dengan jeda panjang (hemat kuota Spotify).
      if (document.visibilityState !== "visible") {
        schedule(POLL_HIDDEN_MS);
        return;
      }

      try {
        const response = await fetch("/api/web/spotify/now-playing", {
          signal: controller.signal,
        });
        const data: { nowPlaying?: NowPlaying | null } | null = response.ok
          ? await response.json()
          : null;
        if (!cancelled) {
          // Null dari endpoint = tidak ada pemutaran aktif → kosongkan kartu.
          setNowPlaying(data?.nowPlaying ?? null);
          failures = 0;
        }
      } catch {
        // Gagal fetch sesaat (termasuk abort): pertahankan snapshot
        // terakhir, backoff eksponensial pada kegagalan beruntun.
        if (!cancelled) failures += 1;
      }

      if (!cancelled) {
        const backoff = Math.min(
          POLL_INTERVAL_MS * 2 ** failures,
          POLL_MAX_BACKOFF_MS,
        );
        schedule(backoff);
      }
    };

    const onVisibilityChange = () => {
      if (cancelled) return;
      // Kembali terlihat → langsung segarkan, lalu lanjut interval normal.
      if (document.visibilityState === "visible") {
        clearTimeout(timer);
        load();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    load();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
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
