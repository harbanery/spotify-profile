export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  /** Cover album (URL Spotify CDN) — tidak ada pada data dummy. */
  image?: string;
  /** Durasi dalam detik. */
  duration: number;
  /** Jumlah pemutaran (dummy) — tidak tersedia di Spotify Web API. */
  plays?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  /** Path gambar cover (SVG gradient dummy / URL Spotify CDN). */
  cover: string;
  /** Warna aksen untuk gradasi header halaman playlist. */
  color?: string;
  owner: string;
  /** Daftar lagu — tidak diisi pada endpoint list (grid playlist). */
  tracks?: Track[];
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  image: string;
  /** Pendengar bulanan (dummy). */
  listeners: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  handle: string;
  avatar: string;
  followers: number;
  following: number;
  publicPlaylists: number;
}
