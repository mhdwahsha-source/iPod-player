import React from 'react';
import { Play, Pause, SkipForward, Maximize2 } from 'lucide-react';
import { Track, ThemeSkin } from '../types';

interface MiniPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  theme: ThemeSkin;
  onPlayPause: () => void;
  onNext: () => void;
  onExpand: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  track,
  isPlaying,
  currentTime,
  duration,
  theme,
  onPlayPause,
  onNext,
  onExpand,
}) => {
  if (!track) return null;

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  // Mini-player styling matching the theme
  let miniBg = 'bg-gradient-to-r from-[#202938] to-[#111827] text-white border-t border-black/30 shadow-lg';
  let progressColor = 'bg-blue-500';

  if (theme === 'u2-dark') {
    miniBg = 'bg-gradient-to-r from-[#18181b] to-[#09090b] text-white border-t border-red-900/60 shadow-lg';
    progressColor = 'bg-red-600';
  } else if (theme === 'bondi-blue') {
    miniBg = 'bg-gradient-to-r from-[#0369a1] to-[#0c4a6e] text-white border-t border-[#38bdf8] shadow-lg';
    progressColor = 'bg-sky-400';
  } else if (theme === 'cyber-neon') {
    miniBg = 'bg-gradient-to-r from-[#020617] to-[#0f172a] text-cyan-300 border-t border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]';
    progressColor = 'bg-cyan-400';
  } else if (theme === 'bubblegum-pink') {
    miniBg = 'bg-gradient-to-r from-[#831843] to-[#be185d] text-white border-t border-pink-400/40 shadow-lg';
    progressColor = 'bg-pink-400';
  } else if (theme === 'retro-gold') {
    miniBg = 'bg-gradient-to-r from-[#78350f] to-[#451a03] text-amber-200 border-t border-amber-500/40 shadow-lg';
    progressColor = 'bg-amber-400';
  }

  return (
    <div
      id="mini-player-bar"
      onClick={onExpand}
      className={`relative h-11 px-2.5 flex items-center justify-between cursor-pointer select-none shrink-0 transition-all ${miniBg}`}
    >
      {/* Top micro progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-black/40">
        <div
          className={`h-full transition-all duration-150 ${progressColor}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Left: Thumbnail & Song Info */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="relative w-8 h-8 rounded overflow-hidden shrink-0 border border-white/20 shadow-xs bg-black/30">
          <img
            src={track.albumArtUrl}
            alt=""
            className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-bold text-[11px] truncate leading-tight">{track.title}</p>
          <p className="text-[9px] opacity-75 truncate leading-tight">{track.artist}</p>
        </div>
      </div>

      {/* Right Controls: Play/Pause, Next, Expand */}
      <div
        className="flex items-center gap-1.5 shrink-0 ml-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          id="mini-player-play-btn"
          onClick={onPlayPause}
          className="p-1.5 rounded-full hover:bg-white/20 active:scale-90 transition-transform"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
        </button>

        <button
          type="button"
          id="mini-player-next-btn"
          onClick={onNext}
          className="p-1.5 rounded-full hover:bg-white/20 active:scale-90 transition-transform"
          title="Next Track"
        >
          <SkipForward className="w-3.5 h-3.5 fill-current" />
        </button>

        <button
          type="button"
          id="mini-player-expand-btn"
          onClick={onExpand}
          className="p-1.5 rounded-full hover:bg-white/20 opacity-70 hover:opacity-100 transition-opacity"
          title="Open Now Playing"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
