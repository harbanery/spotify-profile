import { Figtree } from "next/font/google";

/**
 * Figtree — pengganti gratis terdekat untuk font Circular milik Spotify.
 */
export const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
});
