import React, { useEffect, useState } from 'react';
import { Play, Pause, Battery, Volume2, Music } from 'lucide-react';
import { ThemeSkin } from '../types';

interface LcdScreenProps {
  title: string;
  isPlaying: boolean;
  theme: ThemeSkin;
  showScanlines: boolean;
  volume: number;
  children: React.ReactNode;
  wallpaperUrl?: string;
  wallpaperOpacity?: number;
}

export const LcdScreen: React.FC<LcdScreenProps> = ({
  title,
  isPlaying,
  theme,
  showScanlines,
  volume,
  children,
  wallpaperUrl,
  wallpaperOpacity = 0.25,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // LCD Color Palettes depending on skin
  let screenBg = 'bg-[#e4ebf2] text-[#1c2430]';
  let statusBarBg = 'bg-gradient-to-b from-[#b8c6d4] to-[#a2b5c7] border-b border-[#8299af] text-[#16212e]';
  let scanlineOpacity = 'opacity-30';

  if (theme === 'u2-dark') {
    screenBg = 'bg-[#121418] text-[#e2e8f0]';
    statusBarBg = 'bg-gradient-to-b from-[#1f242d] to-[#141820] border-b border-red-900/60 text-[#f87171]';
    scanlineOpacity = 'opacity-40';
  } else if (theme === 'bondi-blue') {
    screenBg = 'bg-[#e0f2fe] text-[#034078]';
    statusBarBg = 'bg-gradient-to-b from-[#bae6fd] to-[#7dd3fc] border-b border-[#38bdf8] text-[#0284c7]';
  } else if (theme === 'cyber-neon') {
    screenBg = 'bg-[#090d16] text-[#38bdf8]';
    statusBarBg = 'bg-gradient-to-b from-[#0f172a] to-[#0b1120] border-b border-cyan-500/50 text-cyan-400';
    scanlineOpacity = 'opacity-50';
  } else if (theme === 'bubblegum-pink') {
    screenBg = 'bg-[#fff1f2] text-[#881337]';
    statusBarBg = 'bg-gradient-to-b from-[#fecdd3] to-[#fda4af] border-b border-[#fb7185] text-[#9f1239]';
  } else if (theme === 'retro-gold') {
    screenBg = 'bg-[#fefce8] text-[#713f12]';
    statusBarBg = 'bg-gradient-to-b from-[#fef08a] to-[#fde047] border-b border-[#eab308] text-[#854d0e]';
  }

  return (
    <div
      id="lcd-display-container"
      className={`relative w-full rounded-xl overflow-hidden border-2 border-black/30 shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)] flex flex-col ${screenBg}`}
      style={{ height: '310px' }}
    >
      {/* Optional LCD Wallpaper Background */}
      {wallpaperUrl && (
        <div
          className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center transition-opacity duration-300"
          style={{
            backgroundImage: `url("${wallpaperUrl}")`,
            opacity: wallpaperOpacity,
            mixBlendMode: theme === 'u2-dark' || theme === 'cyber-neon' ? 'screen' : 'multiply',
          }}
        />
      )}

      {/* Top LCD Status Bar */}
      <div
        id="lcd-status-bar"
        className={`h-7 px-2.5 flex items-center justify-between select-none shrink-0 font-pixel text-[10px] tracking-tight z-20 ${statusBarBg}`}
      >
        {/* Left: Play/Pause Icon & App Title */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          {isPlaying ? (
            <div className="flex items-center gap-1 bg-black/10 px-1 py-0.5 rounded">
              <Play className="w-2.5 h-2.5 fill-current animate-pulse text-emerald-600" />
              <span className="text-[9px]">PLAY</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-black/10 px-1 py-0.5 rounded opacity-75">
              <Pause className="w-2.5 h-2.5 fill-current" />
              <span className="text-[9px]">PAUSE</span>
            </div>
          )}

          <div className="font-bold truncate max-w-[130px] sm:max-w-[180px]">
            {title}
          </div>
        </div>

        {/* Center: Offline indicator */}
        <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/15 text-[8px] font-mono-lcd uppercase font-bold tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping mr-0.5" />
          OFFLINE
        </div>

        {/* Right: Volume, Clock, Battery */}
        <div className="flex items-center gap-2">
          {/* Volume icon */}
          <div className="flex items-center gap-0.5" title={`Volume: ${Math.round(volume * 100)}%`}>
            <Volume2 className="w-2.5 h-2.5 opacity-80" />
            <span className="text-[8px] font-mono-lcd">{Math.round(volume * 100)}%</span>
          </div>

          {/* Clock */}
          <span className="font-mono-lcd font-bold text-[10px]">{timeStr}</span>

          {/* Battery gauge */}
          <div className="flex items-center gap-0.5" title="Battery: 98% (Offline Power)">
            <div className="relative w-4 h-2.5 border border-current rounded-xs p-0.5 flex gap-0.5 items-center">
              <div className="h-full w-1 bg-current rounded-2xs" />
              <div className="h-full w-1 bg-current rounded-2xs" />
              <div className="h-full w-1 bg-current rounded-2xs" />
              <div className="absolute -right-1 top-0.5 w-0.5 h-1.5 bg-current rounded-r-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Screen Content Body */}
      <div className="relative flex-1 overflow-hidden flex flex-col z-10">
        {children}
      </div>

      {/* Retro LCD Scanlines Overlay (Optional in Settings) */}
      {showScanlines && (
        <div className={`lcd-scanlines absolute inset-0 pointer-events-none z-30 ${scanlineOpacity}`} />
      )}

      {/* Subtle glossy glass reflection across the screen */}
      <div className="glossy-sheen absolute inset-0 pointer-events-none z-30" />
    </div>
  );
};
