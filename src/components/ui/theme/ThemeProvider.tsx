"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useStoredPreference } from "@/hooks/useStoredPreference";

/**
 * Tema global (halaman + antd). Mode yang tersedia (dipilih via
 * ThemeToggle di navbar):
 * - "spotify" (default): tampilan asli halaman — gelap, aksen hijau.
 * - "dark": gradient gelap hitam/abu — tombol primary abu gelap, teks terang.
 * - "light": gradient terang — hijau jadi putih, primary gelap + teks terang.
 * - "compact": palet spotify dengan density komponen antd kompak.
 * Tema diterapkan dua lapis: atribut data-theme di <html> mengganti CSS
 * variable palet halaman (assets/global/index.css — inilah yang membuat
 * dark/light benar-benar terlihat), dan ConfigProvider mengatur token
 * komponen antd — termasuk Menu (dropdown LanguageToggle/ThemeToggle)
 * yang diberi token warna selaras tiap tema. Pilihan disimpan di
 * localStorage (useStoredPreference).
 */

export type ThemeMode = "spotify" | "dark" | "light" | "compact";

export const THEME_MODES: Array<{ value: ThemeMode; label: string }> = [
  { value: "spotify", label: "Default" },
  { value: "compact", label: "Compact" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
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

/** Token antd gelap ala Spotify (mode spotify & compact). */
const spotifyAntdTokens = {
  colorPrimary: "#1ed760",
  colorBgBase: "#121212",
  colorText: "#ffffff",
  colorTextSecondary: "#b3b3b3",
  borderRadius: 6,
  fontFamily: "var(--font-figtree), ui-sans-serif, system-ui, sans-serif",
};

/** Tema dropdown (Menu) selaras palet CSS variable tiap mode. */
const menuTokens = {
  spotify: {
    colorItemBg: "#181818",
    colorItemBgHover: "#242424",
    colorItemBgSelected: "rgba(30, 215, 96, 0.15)",
  },
  dark: {
    colorItemBg: "#27272a",
    colorItemBgHover: "#3f3f46",
    colorItemBgSelected: "rgba(82, 82, 91, 0.4)",
  },
  light: {
    colorItemBg: "#ffffff",
    colorItemBgHover: "#f4f4f5",
    colorItemBgSelected: "rgba(24, 24, 27, 0.08)",
  },
} as const;

/** Konfigurasi tema antd per mode — selaras palet CSS variable. */
const buildThemeConfig = (mode: ThemeMode) => {
  switch (mode) {
    case "dark":
      return {
        algorithm: antdTheme.darkAlgorithm,
        token: {
          // Abu gelap (hitam/abu) — selaras aksen CSS variable tema.
          colorPrimary: "#3f3f46",
          colorBgBase: "#18181b",
          colorText: "#fafafa",
          colorTextSecondary: "#a1a1aa",
          borderRadius: 6,
          fontFamily:
            "var(--font-figtree), ui-sans-serif, system-ui, sans-serif",
        },
        components: { Menu: menuTokens.dark },
      };
    case "light":
      return {
        algorithm: antdTheme.defaultAlgorithm,
        token: {
          // Primary gelap dengan teks terang (teks dihitung antd otomatis).
          colorPrimary: "#18181b",
          colorBgBase: "#ffffff",
          colorText: "#18181b",
          colorTextSecondary: "#52525b",
          borderRadius: 6,
          fontFamily:
            "var(--font-figtree), ui-sans-serif, system-ui, sans-serif",
        },
        components: { Menu: menuTokens.light },
      };
    case "compact":
      return {
        algorithm: [antdTheme.darkAlgorithm, antdTheme.compactAlgorithm],
        token: spotifyAntdTokens,
        components: { Menu: menuTokens.spotify },
      };
    default:
      return {
        algorithm: antdTheme.darkAlgorithm,
        token: spotifyAntdTokens,
        components: {
          Button: {
            primaryShadow: "none",
            defaultShadow: "none",
            fontWeight: 600,
          },
          Menu: menuTokens.spotify,
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

  // Terapkan palet halaman: data-theme di <html> mengganti CSS variable.
  // Compact berbagi palet spotify — pembedanya density komponen antd.
  useEffect(() => {
    document.documentElement.dataset.theme =
      themeMode === "compact" ? "spotify" : themeMode;
  }, [themeMode]);

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
