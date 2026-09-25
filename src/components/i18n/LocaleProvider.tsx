"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useStoredPreference } from "@/hooks/useStoredPreference";
import {
  translations,
  type Locale,
  type TranslationKey,
} from "./translations";

/** Opsi bahasa yang tersedia (dipakai LanguageToggle di navbar). */
export const LOCALES: Array<{ value: Locale; label: string }> = [
  { value: "en", label: "English" },
  { value: "id", label: "Bahasa Indonesia" },
];

const LOCALE_STORAGE_KEY = "spotify-profile:locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Teks terjemahan untuk key, dengan interpolasi variabel {nama}. */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Provider bahasa UI (en default / id) — pilihan disimpan di localStorage
 * (external store, lihat useStoredPreference). Default "en" mempertahankan
 * bahasa tampilan halaman saat ini.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useStoredPreference<Locale>(
    LOCALE_STORAGE_KEY,
    "en",
    LOCALES.map((entry) => entry.value),
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => {
        let text: string = translations[locale][key];
        if (vars) {
          for (const [name, replacement] of Object.entries(vars)) {
            text = text.split(`{${name}}`).join(String(replacement));
          }
        }
        return text;
      },
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale harus dipakai di dalam LocaleProvider");
  }
  return context;
}
