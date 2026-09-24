"use client";

import { Button, ButtonProps } from "antd";
import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { useMounted } from "@/hooks/useMounted";
import { useWebSession } from "@/features/web/hooks/session";

/**
 * Tombol login/logout Spotify memakai antd Button dengan href (render <a>):
 * navigasi penuh disengaja karena alur OAuth harus keluar dari halaman.
 * Menyesuaikan konvensi proyek: className Tailwind pada komponen antd
 * wajib berakhiran "!" (important).
 */
export default function SpotifyLoginButton({
  size = "middle",
}: {
  size?: "middle" | "large";
}) {
  const { status } = useWebSession();
  const mounted = useMounted();
  let buttonProps: ButtonProps = {};
  let buttonLabel: string = "";

  if (!mounted || status === "loading") {
    buttonProps = {
      type: "default",
      loading: true,
      disabled: true,
    };
    buttonLabel = "Loading...";
  } else if (status === "authenticated") {
    buttonProps = {
      type: "default",
      href: "/api/web/auth/logout",
      icon: <LogoutOutlined />,
      className:
        "border-white/30! bg-transparent! text-white! hover:border-white! hover:text-white!",
    };
    buttonLabel = "Log out";
  } else {
    buttonProps = {
      type: "primary",
      href: "/api/web/auth/login",
      icon: <LoginOutlined />,
      className:
        "bg-spotify! text-black! hover:bg-spotify-strong! hover:text-black!",
    };
    buttonLabel = "Log in with Spotify";
  }

  return (
    <Button {...buttonProps} shape="round" size={size}>
      {buttonLabel ?? ""}
    </Button>
  );
}
