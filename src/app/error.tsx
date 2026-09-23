"use client";

import { useEffect } from "react";
import { Button } from "antd";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-black px-6 text-center">
      <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
      <p className="max-w-md text-sm text-subdued">
        {error.message || "Terjadi kesalahan yang tidak terduga."}
      </p>
      <Button type="primary" onClick={reset} className="rounded-full! font-bold!">
        Try again
      </Button>
    </div>
  );
}
