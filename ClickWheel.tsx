import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { ThemeSkin } from '../types';

interface ClickWheelProps {
  theme: ThemeSkin;
  isPlaying: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  sensitivity: number;
  onMenu: () => void;
  onSelect: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onWheelScroll: (direction: 1 | -1) => void;
}

export const ClickWheel: React.FC<ClickWheelProps> = ({
  theme,
  isPlaying,
  soundEnabled,
  soundVolume,
  sensitivity,
  onMenu,
  onSelect,
  onPlayPause,
  onNext,
  onPrev,
  onWheelScroll,
}) => {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef<boolean>(false);
  const lastAngle = useRef<number | null>(null);
  const accumulatedAngle = useRef<number>(0);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  // Degrees per click (adjusted by sensitivity)
  const degreesPerClick = Math.max(8, 16 / sensitivity);

  const getAngle = useCallback((clientX: number, clientY: number): number | null => {
    if (!wheelRef.current) return null;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    // Calculate angle in degrees from -180 to 180
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag if not clicking center button directly
    const target = e.target as HTMLElement;
    if (target.closest('[data-center-button]')) return;

    isDragging.current = true;
    lastAngle.current = getAngle(e.clientX, e.clientY);
    accumulatedAngle.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const currentAngle = getAngle(e.clientX, e.clientY);
    if (currentAngle === null || lastAngle.current === null) return;

    let delta = currentAngle - lastAngle.current;

    // Handle crossing -180 / +180 boundary
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    accumulatedAngle.current += delta;
    lastAngle.current = currentAngle;

    if (Math.abs(accumulatedAngle.current) >= degreesPerClick) {
      const direction = accumulatedAngle.current > 0 ? 1 : -1;
      accumulatedAngle.current -= direction * degreesPerClick;

      audioEngine.playClickSound(soundEnabled, soundVolume);
      onWheelScroll(direction);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    lastAngle.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  // Keyboard navigation shortcuts for testing and accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        audioEngine.playClickSound(soundEnabled, soundVolume);
        onWheelScroll(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        audioEngine.playClickSound(soundEnabled, soundVolume);
        onWheelScroll(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        audioEngine.playClickSound(soundEnabled, soundVolume);
        onSelect();
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        audioEngine.playClickSound(soundEnabled, soundVolume);
        onMenu();
      } else if (e.key === ' ') {
        e.preventDefault();
        audioEngine.playClickSound(soundEnabled, soundVolume);
        onPlayPause();
      } else if (e.key === 'ArrowRight') {
        audioEngine.playClickSound(soundEnabled, soundVolume);
        onNext();
      } else if (e.key === 'ArrowLeft') {
        audioEngine.playClickSound(soundEnabled, soundVolume);
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [soundEnabled, soundVolume, onWheelScroll, onSelect, onMenu, onPlayPause, onNext, onPrev]);

  // Skin styles for the wheel
  let wheelBg = 'bg-[#f4f5f8] border border-gray-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.15)] text-gray-700';
  let centerBg = 'bg-gradient-to-b from-[#f8f9fa] to-[#e4e7ec] border border-gray-300 shadow-[0_2px_4px_rgba(0,0,0,0.12)] text-gray-800';
  let labelColor = 'text-gray-600 font-bold';

  if (theme === 'u2-dark') {
    wheelBg = 'bg-[#18181b] border border-red-900/60 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.5)] text-red-500';
    centerBg = 'bg-gradient-to-b from-[#dc2626] to-[#991b1b] border border-red-800 shadow-[0_2px_5px_rgba(0,0,0,0.6)] text-white';
    labelColor = 'text-red-500 font-bold';
  } else if (theme === 'bondi-blue') {
    wheelBg = 'bg-[#d8f3dc]/60 backdrop-blur-md border border-[#2d6a4f]/30 shadow-[inset_0_2px_5px_rgba(45,106,79,0.15),0_4px_12px_rgba(45,106,79,0.2)] text-[#1b4332]';
    centerBg = 'bg-gradient-to-b from-[#52b788] to-[#2d6a4f] border border-[#1b4332] text-white';
    labelColor = 'text-[#1b4332] font-bold';
  } else if (theme === 'cyber-neon') {
    wheelBg = 'bg-[#0f172a] border border-cyan-500/40 shadow-[inset_0_2px_6px_rgba(6,182,212,0.2),0_0_15px_rgba(6,182,212,0.25)] text-cyan-400';
    centerBg = 'bg-gradient-to-b from-cyan-500 to-blue-600 border border-cyan-300 text-white shadow-[0_0_10px_rgba(6,182,212,0.6)]';
    labelColor = 'text-cyan-400 font-bold';
  } else if (theme === 'bubblegum-pink') {
    wheelBg = 'bg-[#fce7f3] border border-pink-300 shadow-[inset_0_2px_4px_rgba(244,114,182,0.15),0_4px_12px_rgba(244,114,182,0.2)] text-pink-700';
    centerBg = 'bg-gradient-to-b from-pink-400 to-rose-500 border border-pink-400 text-white';
    labelColor = 'text-pink-600 font-bold';
  } else if (theme === 'retro-gold') {
    wheelBg = 'bg-[#fef9c3] border border-amber-300 shadow-[inset_0_2px_4px_rgba(245,158,11,0.15),0_4px_12px_rgba(245,158,11,0.2)] text-amber-800';
    centerBg = 'bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-500 text-amber-950';
    labelColor = 'text-amber-700 font-bold';
  }

  const triggerButton = (name: string, callback: () => void) => {
    setActiveButton(name);
    audioEngine.playClickSound(soundEnabled, soundVolume);
    callback();
    setTimeout(() => setActiveButton(null), 140);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
      {/* The Click Wheel Circular Body */}
      <div
        ref={wheelRef}
        id="click-wheel-ring"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center select-none touch-none transition-transform duration-75 ${wheelBg}`}
      >
        {/* Subtle circular grooves texture */}
        <div className="absolute inset-2 rounded-full border border-black/5 pointer-events-none" />
        <div className="absolute inset-4 rounded-full border border-black/5 pointer-events-none" />

        {/* Top Button: MENU */}
        <button
          type="button"
          id="wheel-menu-btn"
          onClick={(e) => {
            e.stopPropagation();
            triggerButton('menu', onMenu);
          }}
          className={`absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-75 ${labelColor} ${
            activeButton === 'menu' ? 'scale-90 opacity-60' : 'hover:opacity-80 active:scale-90'
          }`}
        >
          MENU
        </button>

        {/* Left Button: PREVIOUS */}
        <button
          type="button"
          id="wheel-prev-btn"
          onClick={(e) => {
            e.stopPropagation();
            triggerButton('prev', onPrev);
          }}
          className={`absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-2 transition-all duration-75 ${labelColor} ${
            activeButton === 'prev' ? 'scale-90 opacity-60' : 'hover:opacity-80 active:scale-90'
          }`}
          title="Previous Track (Double click/hold to rewind)"
        >
          <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
        </button>

        {/* Right Button: NEXT */}
        <button
          type="button"
          id="wheel-next-btn"
          onClick={(e) => {
            e.stopPropagation();
            triggerButton('next', onNext);
          }}
          className={`absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2 transition-all duration-75 ${labelColor} ${
            activeButton === 'next' ? 'scale-90 opacity-60' : 'hover:opacity-80 active:scale-90'
          }`}
          title="Next Track (Hold to fast forward)"
        >
          <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
        </button>

        {/* Bottom Button: PLAY / PAUSE */}
        <button
          type="button"
          id="wheel-play-btn"
          onClick={(e) => {
            e.stopPropagation();
            triggerButton('play', onPlayPause);
          }}
          className={`absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 transition-all duration-75 ${labelColor} ${
            activeButton === 'play' ? 'scale-90 opacity-60' : 'hover:opacity-80 active:scale-90'
          }`}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          <div className="flex items-center gap-1">
            <Play className={`w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ${isPlaying ? 'opacity-40' : ''}`} />
            <Pause className={`w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ${!isPlaying ? 'opacity-40' : ''}`} />
          </div>
        </button>

        {/* Center SELECT Button */}
        <button
          type="button"
          id="wheel-center-select-btn"
          data-center-button="true"
          onClick={(e) => {
            e.stopPropagation();
            triggerButton('select', onSelect);
          }}
          className={`w-18 h-18 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-75 cursor-pointer z-10 ${centerBg} ${
            activeButton === 'select' ? 'scale-95 shadow-inner' : 'active:scale-95 hover:brightness-105'
          }`}
          title="Select / Confirm"
        >
          <div className="w-4 h-4 rounded-full border border-black/10 opacity-40 pointer-events-none" />
        </button>
      </div>

      {/* Wheel control hint */}
      <div className="mt-2 text-[10px] uppercase font-pixel tracking-wider text-gray-500/70 flex items-center gap-2">
        <span>ROTATE TO SCROLL</span>
        <span>•</span>
        <span>TAP CENTER TO SELECT</span>
      </div>
    </div>
  );
};
