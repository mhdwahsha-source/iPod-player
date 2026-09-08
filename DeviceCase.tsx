import React, { useState, useRef } from 'react';
import { Lock, Unlock, Headphones, Volume2, Sparkles, Maximize2, Minimize2, Image as ImageIcon } from 'lucide-react';
import { ThemeSkin } from '../types';

interface DeviceCaseProps {
  theme: ThemeSkin;
  isHoldLocked: boolean;
  onToggleHold: () => void;
  childrenScreen: React.ReactNode;
  childrenWheel: React.ReactNode;
  miniPlayerNode?: React.ReactNode;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onUploadBackground?: (file: File) => void;
  onOpenSettings?: () => void;
  hasCustomBackground?: boolean;
}

export const DeviceCase: React.FC<DeviceCaseProps> = ({
  theme,
  isHoldLocked,
  onToggleHold,
  childrenScreen,
  childrenWheel,
  miniPlayerNode,
  fullscreen,
  onToggleFullscreen,
  onUploadBackground,
  onOpenSettings,
  hasCustomBackground,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadBackground) {
      onUploadBackground(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/') && onUploadBackground) {
      onUploadBackground(file);
    }
  };
  // Determine chassis background and styling according to theme
  let chassisClass = 'bg-gradient-to-b from-[#e8ebf0] via-[#d6d9e0] to-[#c2c6cf] border-4 border-[#b0b4be] text-gray-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.9)]';
  let chromeBezel = 'border-[#cbd5e1]';

  if (theme === 'u2-dark') {
    chassisClass = 'bg-gradient-to-b from-[#27272a] via-[#18181b] to-[#09090b] border-4 border-[#3f3f46] text-gray-200 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.1)]';
    chromeBezel = 'border-[#ef4444]/40';
  } else if (theme === 'bondi-blue') {
    chassisClass = 'bg-gradient-to-b from-[#bae6fd]/90 via-[#7dd3fc]/80 to-[#38bdf8]/90 backdrop-blur-xl border-4 border-[#0284c7]/40 text-[#034078] shadow-[0_25px_50px_-12px_rgba(2,132,199,0.5),inset_0_2px_8px_rgba(255,255,255,0.8)]';
    chromeBezel = 'border-[#38bdf8]';
  } else if (theme === 'cyber-neon') {
    chassisClass = 'bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#020617] border-4 border-cyan-500/50 text-cyan-300 shadow-[0_0_35px_rgba(6,182,212,0.35),inset_0_2px_4px_rgba(6,182,212,0.2)]';
    chromeBezel = 'border-cyan-400';
  } else if (theme === 'bubblegum-pink') {
    chassisClass = 'bg-gradient-to-b from-[#fce7f3] via-[#fbcfe8] to-[#f472b6] border-4 border-[#ec4899]/50 text-pink-900 shadow-[0_25px_50px_-12px_rgba(236,72,153,0.4),inset_0_2px_8px_rgba(255,255,255,0.8)]';
    chromeBezel = 'border-pink-300';
  } else if (theme === 'retro-gold') {
    chassisClass = 'bg-gradient-to-b from-[#fef08a] via-[#fde047] to-[#d97706] border-4 border-[#b45309]/50 text-amber-950 shadow-[0_25px_50px_-12px_rgba(217,119,6,0.4),inset_0_2px_8px_rgba(255,255,255,0.9)]';
    chromeBezel = 'border-amber-300';
  }

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto ${fullscreen ? 'max-w-none' : 'max-w-md mx-auto'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input for quick background upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="quick-background-upload-input"
      />

      {/* Top Device Header Details: Headphone Jack, Wallpaper button, View Toggle, HOLD Switch */}
      <div className="w-full max-w-[390px] flex items-center justify-between px-3 pb-1 text-[10px] select-none gap-1">
        {/* Headphone jack */}
        <div className="flex items-center gap-1 opacity-70 font-mono-lcd">
          <div className="w-4 h-4 rounded-full bg-black/60 border border-white/20 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-black" />
          </div>
          <span className="hidden sm:inline">3.5mm STEREO</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Upload Wallpaper button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-1 rounded transition-opacity flex items-center gap-1 font-mono-lcd ${
              hasCustomBackground
                ? 'bg-blue-600/60 text-white hover:bg-blue-600/80 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 opacity-75 hover:opacity-100'
            }`}
            title="Upload custom background wallpaper (or drag & drop any image)"
          >
            <ImageIcon className="w-3 h-3" />
            <span className="text-[9px]">BG</span>
          </button>

          {/* View Toggle */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-1 rounded bg-white/10 hover:bg-white/20 opacity-75 hover:opacity-100 transition-opacity flex items-center gap-1 font-mono-lcd"
            title={fullscreen ? 'Compact Handheld View' : 'Expand View'}
          >
            {fullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span className="text-[9px]">{fullscreen ? 'COMPACT' : 'EXPAND'}</span>
          </button>

          {/* HOLD Switch Button */}
          <button
            type="button"
            onClick={onToggleHold}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all active:scale-95 font-pixel text-[8px] tracking-wider ${
              isHoldLocked
                ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-sm'
                : 'bg-black/20 text-white/70 border-white/10 hover:bg-black/30'
            }`}
            title="Toggle Hardware HOLD switch (Locks wheel buttons)"
          >
            {isHoldLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
            <span>{isHoldLocked ? 'HOLD ON' : 'HOLD OFF'}</span>
          </button>
        </div>
      </div>

      {/* The Physical MP3 Player Hardware Chassis */}
      <div
        id="mp3-player-chassis"
        className={`relative w-full max-w-[390px] rounded-[38px] p-4 sm:p-5 flex flex-col justify-between select-none transition-all duration-300 ${chassisClass}`}
        style={{ minHeight: '660px' }}
      >
        {/* Drag Over Wallpaper Drop Overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-50 rounded-[38px] bg-blue-600/75 backdrop-blur-sm border-4 border-dashed border-white flex flex-col items-center justify-center text-white pointer-events-none p-6 text-center animate-pulse">
            <ImageIcon className="w-12 h-12 mb-2" />
            <p className="font-pixel text-sm font-bold">DROP IMAGE TO SET BACKGROUND</p>
            <p className="text-xs font-mono-lcd mt-1 opacity-90">Upload as pod wallpaper</p>
          </div>
        )}
        {/* Subtle Chrome Rim highlight around inner edges */}
        <div className="absolute inset-1 rounded-[34px] border border-white/40 pointer-events-none" />

        {/* Screen Bezel & LCD Section */}
        <div className="relative z-10 w-full mb-3 flex flex-col rounded-2xl overflow-hidden shadow-md">
          {childrenScreen}
          {miniPlayerNode}
        </div>

        {/* Brand / Logo Stamp */}
        <div className="text-center py-1 opacity-70 font-pixel text-[10px] tracking-widest flex items-center justify-center gap-1.5">
          <span>BLACKBOX</span>
          <span className="w-1.5 h-1.5 rounded-full bg-current inline-block opacity-60" />
          <span>POD</span>
          <span className="text-[8px] font-mono-lcd opacity-60 tracking-normal ml-1">20GB</span>
        </div>

        {/* Click Wheel Area (With Lock overlay if HOLD is engaged) */}
        <div className="relative z-10 w-full flex items-center justify-center my-auto">
          {childrenWheel}

          {isHoldLocked && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-full flex flex-col items-center justify-center text-amber-400 pointer-events-auto">
              <Lock className="w-8 h-8 animate-bounce mb-1" />
              <span className="font-pixel text-[10px] font-bold tracking-widest">WHEEL LOCKED</span>
              <span className="text-[9px] font-mono-lcd text-white/80">Switch HOLD off to unlock</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
