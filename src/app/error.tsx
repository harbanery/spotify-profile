"use client";

import { useEffect } from "react";
import { Button } from "antd";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-black px-6 text-center">
      <h2 className="text-2xl font-bold text-white">{t("error.title")}</h2>
      <p className="max-w-md text-sm text-subdued">
        {error.message || t("error.fallback")}
      </p>
      <Button type="primary" onClick={reset} className="rounded-full! font-bold!">
        {t("error.retry")}
      </Button>
    </div>
  );
}
