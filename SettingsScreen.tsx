import React, { useState, useRef } from 'react';
import {
  Palette,
  Volume2,
  Sliders,
  Sparkles,
  Database,
  RotateCcw,
  Music,
  Check,
  Zap,
  Image as ImageIcon,
  Upload,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import { PlayerSettings, ThemeSkin, VisualizerMode } from '../../types';
import { PRESET_WALLPAPERS, fileToDataUrl } from '../../services/wallpapers';

interface SettingsScreenProps {
  settings: PlayerSettings;
  tracksCount: number;
  totalStorageBytes: number;
  onUpdateSettings: (newSettings: Partial<PlayerSettings>) => void;
  onClearHistory: () => void;
  onResetApp: () => void;
  onLoadDemoTracks: () => void;
  onOpenEqualizer: () => void;
}

const THEMES: { id: ThemeSkin; name: string; color: string; desc: string }[] = [
  { id: 'classic-silver', name: 'Classic Silver (2004)', color: '#d1d5db', desc: 'The iconic brushed silver & white look' },
  { id: 'u2-dark', name: 'Special Edition Black & Red', color: '#18181b', desc: 'Matte obsidian chassis with ruby red wheel' },
  { id: 'bondi-blue', name: 'Bondi Ice Blue', color: '#38bdf8', desc: 'Early 2000s translucent ocean shell' },
  { id: 'cyber-neon', name: 'Cyber Neon Matrix', color: '#06b6d4', desc: 'Y2K techno-futuristic neon glow' },
  { id: 'bubblegum-pink', name: 'Bubblegum Y2K Pink', color: '#f472b6', desc: 'Vibrant pop millennium nostalgia' },
  { id: 'retro-gold', name: 'Golden Champagne', color: '#fbbf24', desc: 'Collector edition brushed gold' },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  tracksCount,
  totalStorageBytes,
  onUpdateSettings,
  onClearHistory,
  onResetApp,
  onLoadDemoTracks,
  onOpenEqualizer,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'appearance' | 'wallpaper' | 'audio' | 'storage'>('appearance');
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      onUpdateSettings({ customBackgroundUrl: dataUrl });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Failed to load image');
    }
    if (e.target) e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      onUpdateSettings({ customBackgroundUrl: dataUrl });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Failed to load image');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Settings Top Subtabs */}
      <div className="h-8 px-2 bg-black/10 flex items-center justify-between border-b border-black/10 text-[10px] shrink-0 font-medium">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveSubTab('appearance')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
              activeSubTab === 'appearance' ? 'bg-black/20 font-bold' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Skins
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('wallpaper')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeSubTab === 'wallpaper' ? 'bg-black/20 font-bold' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <ImageIcon className="w-2.5 h-2.5" />
            <span>Wallpaper</span>
            {settings.customBackgroundUrl && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('audio')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
              activeSubTab === 'audio' ? 'bg-black/20 font-bold' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Audio & Wheel
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('storage')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
              activeSubTab === 'storage' ? 'bg-black/20 font-bold' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Storage
          </button>
        </div>
      </div>

      {/* Main Settings List */}
      <div className="flex-1 overflow-y-auto p-3 text-[11px] space-y-3">
        {/* APPEARANCE SUBTAB */}
        {activeSubTab === 'appearance' && (
          <div className="space-y-3">
            <div>
              <p className="font-bold text-xs mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>Y2K MP3 Player Skins</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {THEMES.map((themeItem) => {
                  const isCurrent = settings.theme === themeItem.id;
                  return (
                    <div
                      key={themeItem.id}
                      onClick={() => onUpdateSettings({ theme: themeItem.id })}
                      className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2 select-none ${
                        isCurrent
                          ? 'border-blue-600 bg-black/15 shadow-sm'
                          : 'border-black/10 bg-black/5 hover:bg-black/10'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-inner"
                        style={{ backgroundColor: themeItem.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[10px] leading-tight truncate">
                          {themeItem.name}
                        </p>
                        <p className="text-[8px] opacity-60 truncate">{themeItem.desc}</p>
                      </div>
                      {isCurrent && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visualizer Mode & CRT Scanlines */}
            <div className="pt-2 border-t border-black/10 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[11px]">Visualizer Mode</p>
                  <p className="text-[9px] opacity-60">Display animation on LCD</p>
                </div>
                <div className="flex gap-1">
                  {(['bars', 'wave', 'dots'] as VisualizerMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onUpdateSettings({ visualizerMode: mode })}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono-lcd uppercase ${
                        settings.visualizerMode === mode
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-black/10 hover:bg-black/15'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[11px]">CRT Scanlines Overlay</p>
                  <p className="text-[9px] opacity-60">Simulate retro LCD pixel raster</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ showScanlines: !settings.showScanlines })}
                  className={`px-2.5 py-0.5 rounded text-[9px] font-mono-lcd font-bold ${
                    settings.showScanlines ? 'bg-emerald-600 text-white' : 'bg-black/15 opacity-70'
                  }`}
                >
                  {settings.showScanlines ? 'ENABLED' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WALLPAPER SUBTAB */}
        {activeSubTab === 'wallpaper' && (
          <div className="space-y-3">
            {/* Upload Area / Dropzone */}
            <div>
              <p className="font-bold text-xs mb-1.5 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Background</span>
              </p>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="wallpaper-file-input"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-black/20 hover:border-blue-500/60 bg-black/5 hover:bg-black/10 rounded-lg p-3 text-center cursor-pointer transition-all active:scale-99"
              >
                <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-60 text-blue-600" />
                <p className="font-bold text-[10px]">Click to Choose Image or Drag & Drop</p>
                <p className="text-[8px] opacity-60 mt-0.5">
                  Supports PNG, JPG, GIF, WebP (Saved offline)
                </p>
              </div>

              {uploadError && (
                <p className="text-[9px] text-red-500 mt-1 font-mono-lcd">{uploadError}</p>
              )}
            </div>

            {/* Current Background Preview & Remove */}
            {settings.customBackgroundUrl ? (
              <div className="p-2 rounded-lg bg-black/10 border border-black/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-10 h-7 rounded border border-black/20 bg-cover bg-center shrink-0 shadow-xs"
                    style={{ backgroundImage: `url("${settings.customBackgroundUrl}")` }}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-[10px] truncate leading-tight">Custom Background Active</p>
                    <p className="text-[8px] opacity-60">Applied to: {settings.backgroundTarget || 'workspace'}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onUpdateSettings({ customBackgroundUrl: undefined })}
                  className="px-2 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 flex items-center gap-1 text-[9px] active:scale-95 shrink-0"
                  title="Remove Custom Background"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-black/5 border border-black/5 text-[9px] opacity-70 flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3 opacity-50" />
                <span>No custom background set. Select a preset below or upload one.</span>
              </div>
            )}

            {/* Target Selector */}
            <div className="pt-1 space-y-1">
              <p className="font-medium text-[10px]">Apply Background To:</p>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'workspace', label: 'Backdrop' },
                  { id: 'screen', label: 'Pod LCD' },
                  { id: 'both', label: 'Both' },
                ].map((tgt) => {
                  const isSelected = (settings.backgroundTarget || 'workspace') === tgt.id;
                  return (
                    <button
                      key={tgt.id}
                      type="button"
                      onClick={() =>
                        onUpdateSettings({
                          backgroundTarget: tgt.id as 'workspace' | 'screen' | 'both',
                        })
                      }
                      className={`py-1 rounded text-[9px] font-mono-lcd transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-black/10 hover:bg-black/15 opacity-80'
                      }`}
                    >
                      {tgt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Tuning Sliders */}
            <div className="pt-2 border-t border-black/10 space-y-2">
              <p className="font-bold text-[10px] flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                <span>Background Visual Adjustments</span>
              </p>

              {/* Dim Slider */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[9px] font-mono-lcd">
                  <span>Backdrop Dim Overlay:</span>
                  <span>{settings.backgroundDim ?? 30}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={settings.backgroundDim ?? 30}
                  onChange={(e) =>
                    onUpdateSettings({ backgroundDim: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-1.5 bg-black/15 rounded-lg accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Blur Slider */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[9px] font-mono-lcd">
                  <span>Backdrop Blur Radius:</span>
                  <span>{settings.backgroundBlur ?? 0}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="16"
                  step="2"
                  value={settings.backgroundBlur ?? 0}
                  onChange={(e) =>
                    onUpdateSettings({ backgroundBlur: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-1.5 bg-black/15 rounded-lg accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Screen Wallpaper Opacity (if screen or both is selected) */}
              {((settings.backgroundTarget || 'workspace') === 'screen' ||
                settings.backgroundTarget === 'both') && (
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[9px] font-mono-lcd">
                    <span>LCD Screen Wallpaper Opacity:</span>
                    <span>{Math.round((settings.screenWallpaperOpacity ?? 0.25) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.6"
                    step="0.05"
                    value={settings.screenWallpaperOpacity ?? 0.25}
                    onChange={(e) =>
                      onUpdateSettings({ screenWallpaperOpacity: parseFloat(e.target.value) })
                    }
                    className="w-full h-1.5 bg-black/15 rounded-lg accent-blue-600 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Preset Y2K Retro Wallpapers Gallery */}
            <div className="pt-2 border-t border-black/10 space-y-1.5">
              <p className="font-bold text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Nostalgic Y2K Preset Wallpapers</span>
              </p>

              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_WALLPAPERS.map((preset) => {
                  const isCurrent = settings.customBackgroundUrl === preset.dataUrl;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => onUpdateSettings({ customBackgroundUrl: preset.dataUrl })}
                      className={`p-1.5 rounded-lg border cursor-pointer transition-all flex items-center gap-1.5 select-none ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-500/15 shadow-xs'
                          : 'border-black/10 bg-black/5 hover:bg-black/10'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded border border-black/15 bg-cover bg-center shrink-0 shadow-2xs"
                        style={{ backgroundImage: `url("${preset.dataUrl}")` }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[9px] truncate leading-tight">
                          {preset.name}
                        </p>
                        <p className="text-[7px] opacity-60 font-mono-lcd truncate">
                          {preset.category}
                        </p>
                      </div>
                      {isCurrent && <Check className="w-2.5 h-2.5 text-blue-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* AUDIO & WHEEL SUBTAB */}
        {activeSubTab === 'audio' && (
          <div className="space-y-3">
            {/* Click Wheel Mechanical Sound */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="font-medium">Click Wheel Audio Feedback</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({ soundEffectsEnabled: !settings.soundEffectsEnabled })
                  }
                  className={`px-2 py-0.5 rounded text-[9px] font-mono-lcd font-bold ${
                    settings.soundEffectsEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-black/15 opacity-70'
                  }`}
                >
                  {settings.soundEffectsEnabled ? 'ON' : 'MUTED'}
                </button>
              </div>

              {settings.soundEffectsEnabled && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[9px] font-mono-lcd opacity-70">Click Volume:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={settings.soundVolume}
                    onChange={(e) =>
                      onUpdateSettings({ soundVolume: parseFloat(e.target.value) })
                    }
                    className="flex-1 accent-blue-600 h-1.5 bg-black/15 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono-lcd text-[9px] w-7 text-right">
                    {Math.round(settings.soundVolume * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Wheel Sensitivity */}
            <div className="pt-2 border-t border-black/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[11px]">Wheel Rotation Sensitivity</p>
                  <p className="text-[9px] opacity-60">Adjust scroll speed for circular dragging</p>
                </div>
                <div className="flex gap-1">
                  {[
                    { label: 'LOW', val: 0.7 },
                    { label: 'MED', val: 1.0 },
                    { label: 'HIGH', val: 1.5 },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => onUpdateSettings({ clickWheelSensitivity: s.val })}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono-lcd ${
                        Math.abs(settings.clickWheelSensitivity - s.val) < 0.1
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-black/10 hover:bg-black/15'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Crossfade & Gapless */}
            <div className="pt-2 border-t border-black/10 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[11px]">Equalizer DSP</p>
                  <p className="text-[9px] opacity-60">Configure 10-band hardware filters</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenEqualizer}
                  className="px-2 py-0.5 rounded bg-black/15 hover:bg-black/25 flex items-center gap-1 font-pixel text-[9px]"
                >
                  <Sliders className="w-2.5 h-2.5" />
                  <span>OPEN EQ</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[11px]">Gapless Playback</p>
                  <p className="text-[9px] opacity-60">Instant track transition without pauses</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ gapless: !settings.gapless })}
                  className={`px-2.5 py-0.5 rounded text-[9px] font-mono-lcd font-bold ${
                    settings.gapless ? 'bg-emerald-600 text-white' : 'bg-black/15 opacity-70'
                  }`}
                >
                  {settings.gapless ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STORAGE & RESET SUBTAB */}
        {activeSubTab === 'storage' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-lg bg-black/10 border border-black/10 space-y-1">
              <p className="font-bold text-[11px] flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                <span>Local Offline Storage</span>
              </p>
              <div className="flex justify-between font-mono-lcd text-[10px] pt-1">
                <span>Stored Tracks:</span>
                <span className="font-bold">{tracksCount} songs</span>
              </div>
              <div className="flex justify-between font-mono-lcd text-[10px]">
                <span>Storage Footprint:</span>
                <span className="font-bold">{formatBytes(totalStorageBytes)}</span>
              </div>
              <div className="flex justify-between font-mono-lcd text-[10px] text-emerald-600 font-bold">
                <span>Network Status:</span>
                <span>100% OFFLINE (IndexedDB)</span>
              </div>
            </div>

            {/* Actions: Load Demo Tracks, Clear History, Reset DB */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={onLoadDemoTracks}
                className="w-full py-1.5 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[10px] flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
              >
                <Sparkles className="w-3 h-3" />
                <span>LOAD SYNTHESIZED Y2K SAMPLE TRACKS</span>
              </button>

              <button
                type="button"
                onClick={onClearHistory}
                className="w-full py-1.5 px-3 rounded bg-black/10 hover:bg-black/15 font-medium text-[10px] flex items-center justify-center gap-1.5 active:scale-98"
              >
                <RotateCcw className="w-3 h-3" />
                <span>CLEAR PLAY HISTORY & STATS</span>
              </button>

              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="w-full py-1.5 px-3 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 font-medium text-[10px] flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET ALL APP DATA & TRACKS</span>
                </button>
              ) : (
                <div className="p-2 rounded bg-rose-500/20 border border-rose-500/40 text-center space-y-1.5">
                  <p className="text-[10px] font-bold text-rose-600">
                    Are you sure? This will delete all songs and playlists!
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        onResetApp();
                        setConfirmReset(false);
                      }}
                      className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded"
                    >
                      CONFIRM DELETE
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-1 bg-black/20 text-[10px] rounded"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* About BlackboxPod */}
            <div className="text-center pt-2 text-[9px] opacity-60 font-mono-lcd">
              <p className="font-bold">BLACKBOX·POD MP3 PLAYER 2004</p>
              <p>Designed for Offline Music Enjoyment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
