import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ListOrdered,
  FileText,
  Sliders,
  Gauge,
  Disc,
} from 'lucide-react';
import { Track, ThemeSkin, VisualizerMode } from '../../types';
import { Visualizer } from '../Visualizer';

interface NowPlayingScreenProps {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  playbackSpeed: number;
  theme: ThemeSkin;
  visualizerMode: VisualizerMode;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onSeekRelative: (delta: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: (trackId: string) => void;
  onChangeSpeed: () => void;
  onOpenQueue: () => void;
  onOpenLyrics: () => void;
  onOpenEqualizer: () => void;
}

export const NowPlayingScreen: React.FC<NowPlayingScreenProps> = ({
  track,
  isPlaying,
  currentTime,
  duration,
  shuffle,
  repeatMode,
  playbackSpeed,
  theme,
  visualizerMode,
  onPlayPause,
  onNext,
  onPrev,
  onSeek,
  onSeekRelative,
  onToggleShuffle,
  onToggleRepeat,
  onToggleFavorite,
  onChangeSpeed,
  onOpenQueue,
  onOpenLyrics,
  onOpenEqualizer,
}) => {
  const [spinDisc, setSpinDisc] = useState<boolean>(false);

  const formatTime = (secs: number): string => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const remainingTime = duration > 0 ? duration - currentTime : 0;
  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  if (!track) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <Disc className="w-12 h-12 opacity-30 mb-2 animate-spin text-current" />
        <p className="font-bold text-sm">No Track Selected</p>
        <p className="text-xs opacity-70 mt-1">Select a song from Music Library to begin playback.</p>
      </div>
    );
  }

  // Accent colors according to theme
  let accentColor = 'text-blue-600';
  let progressFill = 'bg-blue-600';
  if (theme === 'u2-dark') {
    accentColor = 'text-red-500';
    progressFill = 'bg-red-500';
  } else if (theme === 'cyber-neon') {
    accentColor = 'text-cyan-400';
    progressFill = 'bg-cyan-400';
  } else if (theme === 'bubblegum-pink') {
    accentColor = 'text-pink-600';
    progressFill = 'bg-pink-500';
  } else if (theme === 'retro-gold') {
    accentColor = 'text-amber-700';
    progressFill = 'bg-amber-600';
  }

  return (
    <div className="flex-1 flex flex-col p-2.5 justify-between overflow-hidden">
      {/* Top Details: Album Art & Track Meta */}
      <div className="flex gap-3 items-center">
        {/* Album Artwork with CD Jewel Case Effect */}
        <div
          onClick={() => setSpinDisc(!spinDisc)}
          className="relative w-20 h-20 sm:w-22 sm:h-22 shrink-0 rounded-lg overflow-hidden border border-black/20 shadow-md cursor-pointer group bg-black/10"
          title="Click to toggle spinning disc animation"
        >
          <img
            src={track.albumArtUrl}
            alt={track.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              spinDisc && isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''
            }`}
          />
          {/* Glossy glass reflection reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />

          {/* CD Hologram Center Ring */}
          {spinDisc && (
            <div className="absolute inset-0 m-auto w-6 h-6 rounded-full border-2 border-white/60 bg-black/50 pointer-events-none" />
          )}
        </div>

        {/* Track Metadata */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="px-1 py-0.2 rounded bg-black/10 font-mono-lcd text-[8px] uppercase tracking-wider font-bold">
              {track.mimeType.includes('wav') ? 'WAV 16-BIT' : 'MP3 320K'}
            </span>
            {track.year && (
              <span className="font-mono-lcd text-[9px] opacity-70">
                {track.year}
              </span>
            )}
          </div>

          <h2 className="font-bold text-[13px] sm:text-[14px] leading-tight truncate" title={track.title}>
            {track.title}
          </h2>

          <p className="text-[11px] sm:text-[12px] opacity-80 truncate" title={track.artist}>
            {track.artist}
          </p>

          <p className="text-[9px] opacity-60 truncate" title={track.album}>
            {track.album}
          </p>
        </div>
      </div>

      {/* Visualizer Bar on Screen */}
      <div className="h-8 sm:h-9 my-1 rounded bg-black/10 p-1 flex items-center overflow-hidden border border-black/10">
        <Visualizer
          mode={visualizerMode}
          isPlaying={isPlaying}
          colorScheme={theme === 'cyber-neon' ? 'neon' : 'lcd'}
        />
      </div>

      {/* Progress Bar & Elapsed/Remaining Time */}
      <div className="flex flex-col gap-1">
        <div
          id="now-playing-progressbar"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            onSeek(pos * duration);
          }}
          className="relative w-full h-3 bg-black/15 hover:bg-black/20 rounded-full cursor-pointer overflow-hidden border border-black/10 shadow-inner"
        >
          <div
            className={`h-full transition-all duration-100 ${progressFill}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono-lcd font-semibold px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span className="opacity-80">-{formatTime(remainingTime)}</span>
        </div>
      </div>

      {/* Controls Bar: Shuffle, Repeat, Seek, Favorite, Lyrics, Queue, EQ */}
      <div className="flex items-center justify-between pt-1 border-t border-black/10">
        {/* Left Toggles: Shuffle & Repeat */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            id="nowplaying-shuffle-btn"
            onClick={onToggleShuffle}
            className={`p-1.5 rounded-md transition-all ${
              shuffle ? `${accentColor} bg-black/10 font-bold` : 'opacity-50 hover:opacity-100'
            }`}
            title={`Shuffle: ${shuffle ? 'ON' : 'OFF'}`}
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            id="nowplaying-repeat-btn"
            onClick={onToggleRepeat}
            className={`p-1.5 rounded-md transition-all ${
              repeatMode !== 'off' ? `${accentColor} bg-black/10 font-bold` : 'opacity-50 hover:opacity-100'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-3.5 h-3.5" />
            ) : (
              <Repeat className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            id="nowplaying-speed-btn"
            onClick={onChangeSpeed}
            className="px-1.5 py-0.5 rounded bg-black/10 hover:bg-black/15 font-mono-lcd text-[9px] font-bold"
            title="Playback Speed"
          >
            {playbackSpeed}x
          </button>
        </div>

        {/* Center: Seek -10s and +10s */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            id="nowplaying-seek-back-btn"
            onClick={() => onSeekRelative(-10)}
            className="p-1.5 rounded hover:bg-black/10 active:scale-95 transition-transform"
            title="Rewind 10 seconds"
          >
            <RotateCcw className="w-3.5 h-3.5 opacity-75" />
          </button>

          <button
            type="button"
            id="nowplaying-seek-fwd-btn"
            onClick={() => onSeekRelative(10)}
            className="p-1.5 rounded hover:bg-black/10 active:scale-95 transition-transform"
            title="Forward 10 seconds"
          >
            <RotateCw className="w-3.5 h-3.5 opacity-75" />
          </button>
        </div>

        {/* Right Tools: Favorite, Lyrics, Queue, EQ */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            id="nowplaying-favorite-btn"
            onClick={() => onToggleFavorite(track.id)}
            className={`p-1.5 rounded transition-transform active:scale-90 ${
              track.isFavorite ? 'text-rose-500' : 'opacity-50 hover:opacity-100'
            }`}
            title={track.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-3.5 h-3.5 ${track.isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            id="nowplaying-lyrics-btn"
            onClick={onOpenLyrics}
            className="p-1.5 rounded hover:bg-black/10 opacity-70 hover:opacity-100"
            title="View lyrics"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            id="nowplaying-queue-btn"
            onClick={onOpenQueue}
            className="p-1.5 rounded hover:bg-black/10 opacity-70 hover:opacity-100"
            title="View Queue"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            id="nowplaying-eq-btn"
            onClick={onOpenEqualizer}
            className="p-1.5 rounded hover:bg-black/10 opacity-70 hover:opacity-100"
            title="Open Equalizer"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
