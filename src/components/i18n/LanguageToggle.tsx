"use client";

import { Button, Dropdown } from "antd";
import { CheckOutlined, GlobalOutlined } from "@ant-design/icons";
import { LOCALES, useLocale } from "./LocaleProvider";
import type { Locale } from "./translations";

/**
 * Toggle bahasa (English / Bahasa Indonesia) untuk navbar: tombol ikon
 * bola dunia dengan popover pilihan; item aktif ditandai centang hijau.
 * className Tailwind pada komponen antd wajib berakhiran "!" (konvensi).
 */
export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        selectedKeys: [locale],
        onClick: ({ key }) => setLocale(key as Locale),
        items: LOCALES.map((entry) => ({
          key: entry.value,
          label: (
            <span className="flex items-center gap-2">
              {entry.label}
              {locale === entry.value ? (
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
        icon={<GlobalOutlined />}
        aria-label="Change language"
        className="text-white! hover:bg-white/10!"
      />
    </Dropdown>
  );
}
