"use client";

import { Button } from "antd";
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

  if (!mounted || status === "loading") {
    return (
      <div
        className="h-8 w-36 animate-pulse rounded-full bg-white/10"
        aria-hidden
      />
    );
  }

  if (status === "authenticated") {
    return (
      <Button
        type="default"
        shape="round"
        size={size}
        href="/api/web/auth/logout"
        icon={<LogoutOutlined />}
        className="border-white/30! bg-transparent! text-white! hover:border-white! hover:text-white!"
      >
        Log out
      </Button>
    );
  }

  return (
    <Button
      type="primary"
      shape="round"
      size={size}
      href="/api/web/auth/login"
      icon={<LoginOutlined />}
      className="bg-spotify! text-black! hover:bg-spotify-strong! hover:text-black!"
    >
      Log in with Spotify
    </Button>
  );
}
