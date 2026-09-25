"use client";

import { useRouter } from "next/navigation";
import { Button } from "antd";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function NotFound() {
  const router = useRouter();
  const { t } = useLocale();

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-black px-6 text-center">
      <p className="text-7xl font-black text-spotify">404</p>
      <h1 className="text-2xl font-bold text-white">{t("notFound.title")}</h1>
      <p className="max-w-md text-sm text-subdued">
        {t("notFound.description")}
      </p>
      <Button
        type="primary"
        onClick={() => router.push("/")}
        className="rounded-full! font-bold!"
      >
        {t("notFound.back")}
      </Button>
    </div>
  );
}
