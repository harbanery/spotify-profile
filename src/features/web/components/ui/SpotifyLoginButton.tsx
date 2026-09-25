"use client";

import { Button, ButtonProps } from "antd";
import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { useMounted } from "@/hooks/useMounted";
import { useWebSession } from "@/features/web/hooks/session";
import { useLocale } from "@/components/i18n/LocaleProvider";

/**
 * Tombol login/logout Spotify memakai antd Button dengan href (render <a>):
 * navigasi penuh disengaja karena alur OAuth harus keluar dari halaman.
 * Menyesuaikan konvensi proyek: className Tailwind pada komponen antd
 * wajib berakhiran "!" (important). Label mengikuti locale aktif.
 */
export default function SpotifyLoginButton({
  size = "middle",
}: {
  size?: "middle" | "large";
}) {
  const { status } = useWebSession();
  const { t } = useLocale();
  const mounted = useMounted();
  let buttonProps: ButtonProps = {};
  let buttonLabel = "";

  if (!mounted || status === "loading") {
    buttonProps = {
      type: "default",
      loading: true,
      disabled: true,
    };
    buttonLabel = t("nav.loading");
  } else if (status === "authenticated") {
    buttonProps = {
      type: "default",
      href: "/api/web/auth/logout",
      icon: <LogoutOutlined />,
      className:
        "border-line-strong! bg-transparent! text-ink! hover:border-ink! hover:text-ink!",
    };
    buttonLabel = t("nav.logout");
  } else {
    buttonProps = {
      type: "primary",
      href: "/api/web/auth/login",
      icon: <LoginOutlined />,
      className:
        "bg-spotify! text-black! hover:bg-spotify-strong! hover:text-black!",
    };
    buttonLabel = t("nav.login");
  }

  return (
    <Button {...buttonProps} shape="round" size={size}>
      {buttonLabel}
    </Button>
  );
}
