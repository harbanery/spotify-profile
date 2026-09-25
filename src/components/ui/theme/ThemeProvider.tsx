"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useStoredPreference } from "@/hooks/useStoredPreference";

/**
 * Tema global Ant Design. Mode yang tersedia (dipilih via ThemeToggle
 * di navbar):
 * - "spotify" (default): gelap ala Spotify — tampilan halaman saat ini.
 * - "dark": gelap netral ala antd (aksen default antd).
 * - "light": terang ala antd.
 * - "compact": gelap ala Spotify dengan density kompak.
 * Pilihan disimpan di localStorage. Tema berlaku pada komponen antd
 * (tombol, popover, spin, dll); cangkang halaman tetap gelap ala
 * Spotify karena itulah tampilan default halaman ini.
 */

export type ThemeMode = "spotify" | "dark" | "light" | "compact";

export const THEME_MODES: Array<{ value: ThemeMode; label: string }> = [
  { value: "spotify", label: "Spotify (default)" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "compact", label: "Compact" },
];

const THEME_STORAGE_KEY = "spotify-profile:theme";

/** Nilai mode tema yang valid (untuk validasi nilai tersimpan). */
const THEME_MODE_VALUES = THEME_MODES.map((entry) => entry.value);

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeContextValue | null>(null);

export function useThemeMode(): ThemeContextValue {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode harus dipakai di dalam ThemeProvider");
  }
  return context;
}

/** Token warna gelap ala Spotify, diselaraskan dengan token Tailwind. */
const spotifyTokens = {
  colorPrimary: "#1ed760",
  colorBgBase: "#121212",
  colorText: "#ffffff",
  colorTextSecondary: "#b3b3b3",
  borderRadius: 6,
  fontFamily: "var(--font-figtree), ui-sans-serif, system-ui, sans-serif",
};

/** Konfigurasi tema ConfigProvider per mode. */
const buildThemeConfig = (mode: ThemeMode) => {
  switch (mode) {
    case "dark":
      return { algorithm: antdTheme.darkAlgorithm };
    case "light":
      return { algorithm: antdTheme.defaultAlgorithm };
    case "compact":
      return {
        algorithm: [antdTheme.darkAlgorithm, antdTheme.compactAlgorithm],
        token: spotifyTokens,
      };
    default:
      return {
        algorithm: antdTheme.darkAlgorithm,
        token: spotifyTokens,
        components: {
          Button: {
            primaryShadow: "none",
            defaultShadow: "none",
            fontWeight: 600,
          },
        },
      };
  }
};

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useStoredPreference<ThemeMode>(
    THEME_STORAGE_KEY,
    "spotify",
    THEME_MODE_VALUES,
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ themeMode, setThemeMode }),
    [themeMode, setThemeMode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ConfigProvider theme={buildThemeConfig(themeMode)}>
        {children}
      </ConfigProvider>
    </ThemeModeContext.Provider>
  );
}
