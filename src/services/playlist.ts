import type { Playlist } from "@/features/web/types";
import { OWNER_NAME } from "@/utils/config/variables";
import { getTracksByIds } from "./track";

/**
 * Data playlist dummy — kini hanya menopang jumlah "public playlists"
 * pada profil dummy (fitur Top playlists dan halaman playlist sudah
 * di-takeout; playlist live tidak lagi diambil dari Spotify Web API).
 */
const PLAYLISTS: Playlist[] = [
  {
    id: "liked-songs",
    name: "Liked Songs",
    description: "Semua lagu yang kamu sukai dalam satu tempat.",
    cover: "/images/covers/liked-songs.svg",
    color: "#5038a0",
    owner: OWNER_NAME,
    tracks: getTracksByIds(["t6", "t1", "t12", "t2", "t9", "t3", "t14", "t4"]),
  },
  {
    id: "daily-mix-1",
    name: "Daily Mix 1",
    description:
      "Nova Rey, Aurora Skye, Luna Waves dan lainnya. Diperbarui untukmu.",
    cover: "/images/covers/cover-1.svg",
    color: "#1e3264",
    owner: "Spotify",
    tracks: getTracksByIds(["t1", "t7", "t13", "t6", "t12", "t18", "t3", "t8"]),
  },
  {
    id: "discover-weekly",
    name: "Discover Weekly",
    description: "Mixtape mingguanmu dari Spotify. Diperbarui setiap Senin.",
    cover: "/images/covers/cover-2.svg",
    color: "#8400e7",
    owner: "Spotify",
    tracks: getTracksByIds([
      "t2",
      "t9",
      "t14",
      "t4",
      "t10",
      "t16",
      "t5",
      "t11",
    ]),
  },
  {
    id: "on-repeat",
    name: "On Repeat",
    description: "Lagu yang terus kamu putar berulang-ulang.",
    cover: "/images/covers/cover-3.svg",
    color: "#e8115b",
    owner: "Spotify",
    tracks: getTracksByIds(["t6", "t1", "t12", "t11", "t5", "t17"]),
  },
  {
    id: "deep-focus",
    name: "Deep Focus",
    description: "Musik ambient untuk konsentrasi dalam waktu lama.",
    cover: "/images/covers/cover-4.svg",
    color: "#158a08",
    owner: "Spotify",
    tracks: getTracksByIds(["t4", "t10", "t16", "t8", "t15", "t3"]),
  },
  {
    id: "throwback-hits",
    name: "Throwback Hits",
    description: "Nostalgia penuh warna dari dekade lalu.",
    cover: "/images/covers/cover-5.svg",
    color: "#e13300",
    owner: OWNER_NAME,
    tracks: getTracksByIds(["t11", "t17", "t5", "t2", "t14", "t9", "t13"]),
  },
  {
    id: "indie-sunrise",
    name: "Indie Sunrise",
    description: "Guitar pop ceria untuk pagi yang segar.",
    cover: "/images/covers/cover-6.svg",
    color: "#0d73ec",
    owner: OWNER_NAME,
    tracks: getTracksByIds(["t3", "t8", "t15", "t1", "t7", "t12"]),
  },
  {
    id: "midnight-drive",
    name: "Midnight Drive",
    description: "Synth yang mengalun untuk perjalanan malam.",
    cover: "/images/covers/cover-7.svg",
    color: "#27856a",
    owner: OWNER_NAME,
    tracks: getTracksByIds(["t2", "t9", "t14", "t6", "t18", "t10"]),
  },
  {
    id: "party-anthems",
    name: "Party Anthems",
    description: "Tempat pesta dimulai.",
    cover: "/images/covers/cover-8.svg",
    color: "#b02897",
    owner: "Spotify",
    tracks: getTracksByIds(["t5", "t17", "t11", "t1", "t13", "t6", "t2"]),
  },
];

/** Total pemutaran playlist dummy = jumlah plays lagu-lagunya. */
const totalPlays = (playlist: Playlist): number =>
  (playlist.tracks ?? []).reduce((sum, track) => sum + (track.plays ?? 0), 0);

/**
 * Playlist publik dummy terurut dari yang paling sering didengar
 * (dihitung dari jumlah pemutaran lagu di dalam tiap playlist) —
 * dipakai service profile untuk jumlah "public playlists".
 */
export const getPublicPlaylists = (): Playlist[] =>
  [...PLAYLISTS]
    .filter((playlist) => playlist.owner !== "Spotify")
    .sort((a, b) => totalPlays(b) - totalPlays(a));
