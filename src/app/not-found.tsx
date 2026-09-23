"use client";

import { useRouter } from "next/navigation";
import { Button } from "antd";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-black px-6 text-center">
      <p className="text-7xl font-black text-spotify">404</p>
      <h1 className="text-2xl font-bold text-white">Page not found</h1>
      <p className="max-w-md text-sm text-subdued">
        Kami tidak menemukan halaman yang kamu cari.
      </p>
      <Button
        type="primary"
        onClick={() => router.push("/")}
        className="rounded-full! font-bold!"
      >
        Back to home
      </Button>
    </div>
  );
}
