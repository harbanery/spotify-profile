"use client";

import type { ReactNode } from "react";
import { ConfigProvider, theme } from "antd";

/**
 * Tema global Ant Design — gelap ala Spotify.
 * Token warna diselaraskan dengan token Tailwind di assets/global/index.css.
 */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#1ed760",
          colorBgBase: "#121212",
          colorText: "#ffffff",
          colorTextSecondary: "#b3b3b3",
          borderRadius: 6,
          fontFamily:
            "var(--font-figtree), ui-sans-serif, system-ui, sans-serif",
        },
        components: {
          Button: {
            primaryShadow: "none",
            defaultShadow: "none",
            fontWeight: 600,
          },
          Table: {
            headerBg: "transparent",
            headerColor: "#b3b3b3",
            rowHoverBg: "rgba(255, 255, 255, 0.07)",
            borderColor: "rgba(255, 255, 255, 0.07)",
            cellPaddingBlock: 12,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
