import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
}

/**
 * Judul section ala Spotify ("Made For You", dll) beserta aksi opsional.
 */
export default function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">{title}</h2>
      {action ? <div className="text-sm font-semibold text-subdued">{action}</div> : null}
    </div>
  );
}
