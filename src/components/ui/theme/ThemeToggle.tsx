"use client";

import { Button, Dropdown } from "antd";
import { CheckOutlined, FormatPainterOutlined } from "@ant-design/icons";
import { THEME_MODES, useThemeMode } from "./ThemeProvider";

/**
 * Toggle tema antd untuk navbar: tombol ikon kuas dengan popover pilihan
 * mode (Spotify default / Dark / Light / Compact); item aktif ditandai
 * centang hijau. className Tailwind pada komponen antd wajib berakhiran
 * "!" (konvensi proyek).
 */
export default function ThemeToggle() {
  const { themeMode, setThemeMode } = useThemeMode();

  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        selectedKeys: [themeMode],
        onClick: ({ key }) => setThemeMode(key as typeof themeMode),
        items: THEME_MODES.map((entry) => ({
          key: entry.value,
          label: (
            <span className="flex items-center gap-2">
              {entry.label}
              {themeMode === entry.value ? (
                <CheckOutlined className="text-spotify!" />
              ) : null}
            </span>
          ),
        })),
      }}
    >
      <Button
        type="text"
        shape="circle"
        icon={<FormatPainterOutlined />}
        aria-label="Change theme"
        className="text-ink! hover:bg-hoverfill!"
      />
    </Dropdown>
  );
}
