import React, { useState, useEffect } from 'react';
import { Sliders, RotateCcw } from 'lucide-react';
import { audioEngine, EQ_PRESETS, EQ_FREQUENCIES } from '../../services/audioEngine';
import { ThemeSkin, EqualizerBand } from '../../types';
import { Visualizer } from '../Visualizer';

interface EqualizerScreenProps {
  theme: ThemeSkin;
  isPlaying: boolean;
  onBack?: () => void;
}

export const EqualizerScreen: React.FC<EqualizerScreenProps> = ({
  theme,
  isPlaying,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('Flat');
  const [bands, setBands] = useState<EqualizerBand[]>([]);

  useEffect(() => {
    setBands(audioEngine.getBands());
  }, []);

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = EQ_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      audioEngine.applyEqPreset(preset);
      setBands(audioEngine.getBands());
    }
  };

  const handleBandChange = (index: number, gainValue: number) => {
    setSelectedPreset('Custom');
    audioEngine.setEqBand(index, gainValue);
    setBands(audioEngine.getBands());
  };

  const handleReset = () => {
    handlePresetChange('Flat');
  };

  return (
    <div className="flex-1 flex flex-col p-2 overflow-hidden justify-between">
      {/* Top EQ Header & Preset Selector */}
      <div className="flex items-center justify-between pb-1.5 border-b border-black/10 gap-1 shrink-0">
        <div className="flex items-center gap-1 font-bold text-xs">
          <Sliders className="w-3.5 h-3.5" />
          <span>10-Band EQ</span>
        </div>

        <div className="flex items-center gap-1.5">
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            aria-label="Equalizer Preset"
            className="px-1.5 py-0.5 rounded bg-black/10 border border-black/15 text-[10px] font-medium focus:outline-none"
          >
            {EQ_PRESETS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleReset}
            className="p-1 rounded bg-black/10 hover:bg-black/20 text-[9px] flex items-center gap-1 active:scale-95"
            title="Reset Equalizer"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Mini Spectrum Visualizer Preview */}
      <div className="h-7 my-1 bg-black/10 rounded px-1 flex items-center overflow-hidden border border-black/10">
        <Visualizer
          mode="bars"
          isPlaying={isPlaying}
          colorScheme={theme === 'cyber-neon' ? 'neon' : 'lcd'}
        />
      </div>

      {/* 10 Vertical Sliders Grid */}
      <div className="flex-1 grid grid-cols-10 gap-1 items-center justify-items-center py-1">
        {bands.map((band, idx) => {
          return (
            <div
              key={band.frequency}
              className="h-full flex flex-col items-center justify-between w-full"
            >
              {/* dB readout */}
              <span className="font-mono-lcd text-[8px] font-semibold text-center w-full">
                {band.gain > 0 ? `+${Math.round(band.gain)}` : Math.round(band.gain)}
              </span>

              {/* Vertical slider input */}
              <div className="h-24 sm:h-28 flex items-center justify-center py-1">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={band.gain}
                  onChange={(e) => handleBandChange(idx, parseFloat(e.target.value))}
                  aria-label={`EQ Band ${band.label}`}
                  className="h-20 sm:h-24 w-1.5 accent-blue-600 cursor-pointer [writing-mode:vertical-lr] [direction:rtl]"
                />
              </div>

              {/* Frequency Label */}
              <span className="font-mono-lcd text-[7px] sm:text-[8px] font-bold text-center w-full truncate">
                {band.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Range Marks */}
      <div className="flex justify-between items-center text-[8px] font-mono-lcd opacity-60 border-t border-black/10 pt-1">
        <span>BASS (60Hz)</span>
        <span>MIDS (1kHz)</span>
        <span>TREBLE (16kHz)</span>
      </div>
    </div>
  );
};
