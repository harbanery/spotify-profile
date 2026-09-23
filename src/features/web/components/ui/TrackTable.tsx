"use client";

import { Table } from "antd";
import type { TableProps } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import type { Track } from "@/features/web/types";
import { formatCompact, formatDuration } from "@/utils/helpers";

interface TrackTableProps {
  tracks: Track[];
  showAlbum?: boolean;
  showPlays?: boolean;
}

type TrackColumn = NonNullable<TableProps<Track>["columns"]>[number];

/**
 * Tabel lagu ala Spotify memakai antd Table — fokus statistik daftar
 * putar, tanpa kontrol pemutaran. Styling antd dikontrol lewat token
 * tema; konten sel memakai div + Tailwind agar tidak melawan style antd.
 */
export default function TrackTable({
  tracks,
  showAlbum = true,
  showPlays = false,
}: TrackTableProps) {
  const columns: TableProps<Track>["columns"] = [
    {
      title: "#",
      width: 40,
      render: (_value, _track, index) => (
        <span className="text-sm tabular-nums text-subdued">{index + 1}</span>
      ),
    },
    {
      title: "Title",
      render: (_value, track) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{track.title}</p>
          <p className="truncate text-sm text-subdued">{track.artist}</p>
        </div>
      ),
    },
    ...(showAlbum
      ? [
          {
            title: "Album",
            render: (_value: unknown, track: Track) => (
              <span className="block truncate text-sm text-subdued">{track.album}</span>
            ),
          } satisfies TrackColumn,
        ]
      : []),
    ...(showPlays
      ? [
          {
            title: "Plays",
            align: "right" as const,
            render: (_value: unknown, track: Track) => (
              <span className="text-sm tabular-nums text-subdued">
                {track.plays === undefined ? "—" : formatCompact(track.plays)}
              </span>
            ),
          } satisfies TrackColumn,
        ]
      : []),
    {
      title: <ClockCircleOutlined aria-label="Duration" />,
      align: "right",
      width: 80,
      render: (_value, track) => (
        <span className="text-sm tabular-nums text-subdued">
          {formatDuration(track.duration)}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Table<Track>
        rowKey="id"
        columns={columns}
        dataSource={tracks}
        pagination={false}
        showSorterTooltip={false}
      />
    </div>
  );
}
