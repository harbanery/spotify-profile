"use client";

import { Spin } from "antd";

export default function Loading() {
  return (
    <div className="flex h-dvh items-center justify-center bg-page">
      <Spin size="large" />
    </div>
  );
}
