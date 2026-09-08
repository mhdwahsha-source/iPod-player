export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  albumArtUrl?: string;
  genre?: string;
  trackNumber?: number;
  year?: number;
  dateAdded: number; // timestamp
  playCount: number;
  lastPlayed?: number; // timestamp
  isFavorite?: boolean;
  mimeType: string;
  fileSize: number; // in bytes
  fileName: string;
  folderPath?: string;
  lyrics?: string;
  // Audio source: either Blob or data URL or object URL
  audioBlob?: Blob;
}

export interface Playlist {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  trackIds: string[];
  description?: string;
  coverArtUrl?: string;
}

export type ThemeSkin =
  | 'classic-silver'
  | 'u2-dark'
  | 'bondi-blue'
  | 'cyber-neon'
  | 'bubblegum-pink'
  | 'retro-gold';

export type VisualizerMode = 'bars' | 'wave' | 'dots';

export interface PlayerSettings {
  theme: ThemeSkin;
  soundEffectsEnabled: boolean;
  soundVolume: number; // 0 to 1
  crossfadeDuration: number; // 0 to 10 seconds
  gapless: boolean;
  visualizerMode: VisualizerMode;
  clickWheelSensitivity: number; // 0.5 to 2
  showScanlines: boolean;
  playbackSpeed: number; // 0.5, 0.75, 1, 1.25, 1.5, 2
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  volume: number; // 0 to 1
  customBackgroundUrl?: string;
  backgroundTarget?: 'workspace' | 'screen' | 'both';
  backgroundDim?: number; // 0 to 80%
  backgroundBlur?: number; // 0 to 20px
  screenWallpaperOpacity?: number; // 0.1 to 0.7
}

export type ScreenType =
  | 'main-menu'
  | 'music'
  | 'now-playing'
  | 'songs'
  | 'artists'
  | 'artist-detail'
  | 'albums'
  | 'album-detail'
  | 'genres'
  | 'genre-detail'
  | 'folders'
  | 'playlists'
  | 'playlist-detail'
  | 'favorites'
  | 'recently-played'
  | 'most-played'
  | 'equalizer'
  | 'settings'
  | 'queue'
  | 'lyrics';

export interface EqualizerPreset {
  name: string;
  gains: number[]; // dB values for each frequency band (-12 to +12)
}

export interface EqualizerBand {
  frequency: number;
  label: string;
  gain: number;
}
