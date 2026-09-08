import React from 'react';
import {
  Music,
  PlaySquare,
  ListMusic,
  User,
  Disc,
  Radio,
  Heart,
  Clock,
  Flame,
  Sliders,
  Settings as SettingsIcon,
  ChevronRight,
} from 'lucide-react';
import { ScreenType, Track, ThemeSkin } from '../../types';

interface MenuItem {
  id: ScreenType;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface MainMenuProps {
  selectedIndex: number;
  onSelectScreen: (screen: ScreenType) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  tracksCount: number;
  playlistsCount: number;
  favoritesCount: number;
  theme: ThemeSkin;
}

export const MENU_ITEMS: MenuItem[] = [
  { id: 'music', label: 'Music Library', icon: <Music className="w-3.5 h-3.5" /> },
  { id: 'now-playing', label: 'Now Playing', icon: <PlaySquare className="w-3.5 h-3.5" /> },
  { id: 'playlists', label: 'Playlists', icon: <ListMusic className="w-3.5 h-3.5" /> },
  { id: 'artists', label: 'Artists', icon: <User className="w-3.5 h-3.5" /> },
  { id: 'albums', label: 'Albums', icon: <Disc className="w-3.5 h-3.5" /> },
  { id: 'genres', label: 'Genres', icon: <Radio className="w-3.5 h-3.5" /> },
  { id: 'favorites', label: 'Favorites', icon: <Heart className="w-3.5 h-3.5" /> },
  { id: 'recently-played', label: 'Recently Played', icon: <Clock className="w-3.5 h-3.5" /> },
  { id: 'most-played', label: 'Most Played', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'equalizer', label: 'Equalizer', icon: <Sliders className="w-3.5 h-3.5" /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-3.5 h-3.5" /> },
];

export const MainMenu: React.FC<MainMenuProps> = ({
  selectedIndex,
  onSelectScreen,
  currentTrack,
  isPlaying,
  tracksCount,
  playlistsCount,
  favoritesCount,
  theme,
}) => {
  const currentItem = MENU_ITEMS[selectedIndex] || MENU_ITEMS[0];

  // Selection highlight styles
  let highlightBg = 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-sm';
  if (theme === 'u2-dark') {
    highlightBg = 'bg-gradient-to-r from-[#b91c1c] to-[#dc2626] text-white shadow-sm';
  } else if (theme === 'cyber-neon') {
    highlightBg = 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_8px_rgba(6,182,212,0.4)]';
  } else if (theme === 'bubblegum-pink') {
    highlightBg = 'bg-gradient-to-r from-pink-500 to-rose-500 text-white';
  } else if (theme === 'retro-gold') {
    highlightBg = 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white';
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Menu List */}
      <div className="w-full sm:w-1/2 h-full overflow-y-auto border-r border-black/10 py-1 flex flex-col divide-y divide-black/5">
        {MENU_ITEMS.map((item, index) => {
          const isSelected = index === selectedIndex;
          let badgeVal: string | number | undefined;
          if (item.id === 'music') badgeVal = tracksCount;
          if (item.id === 'playlists') badgeVal = playlistsCount;
          if (item.id === 'favorites') badgeVal = favoritesCount;

          return (
            <div
              key={item.id}
              id={`menu-item-${item.id}`}
              onClick={() => onSelectScreen(item.id)}
              className={`px-3 py-1.5 flex items-center justify-between cursor-pointer transition-colors duration-75 text-[12px] font-medium select-none ${
                isSelected
                  ? highlightBg
                  : 'hover:bg-black/5 active:bg-black/10 text-inherit'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className={`${isSelected ? 'text-white' : 'opacity-70'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                {badgeVal !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full font-mono-lcd ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-black/10 opacity-70'
                    }`}
                  >
                    {badgeVal}
                  </span>
                )}
                <ChevronRight className={`w-3 h-3 ${isSelected ? 'text-white' : 'opacity-40'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Preview Pane (Split Screen feature inspired by 5th-gen MP3 players) */}
      <div className="hidden sm:flex w-1/2 h-full p-3 items-center justify-center flex-col text-center bg-black/5">
        {currentItem.id === 'now-playing' && currentTrack ? (
          <div className="flex flex-col items-center max-w-[150px]">
            <div className="relative w-28 h-28 rounded-lg overflow-hidden shadow-md border border-black/20 mb-2 group">
              <img
                src={currentTrack.albumArtUrl}
                alt={currentTrack.title}
                className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_20s_linear_infinite]' : ''}`}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/20" />
            </div>
            <p className="font-bold text-[11px] truncate w-full">{currentTrack.title}</p>
            <p className="text-[10px] opacity-75 truncate w-full">{currentTrack.artist}</p>
          </div>
        ) : currentItem.id === 'favorites' ? (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-rose-500/15 flex items-center justify-center mb-2 text-rose-500">
              <Heart className="w-10 h-10 fill-current" />
            </div>
            <p className="font-bold text-[11px]">Favorite Songs</p>
            <p className="text-[10px] opacity-70 font-mono-lcd">{favoritesCount} saved tracks</p>
          </div>
        ) : currentItem.id === 'equalizer' ? (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-xl bg-cyan-500/15 flex items-center justify-center mb-2 text-cyan-600">
              <Sliders className="w-10 h-10" />
            </div>
            <p className="font-bold text-[11px]">10-Band EQ</p>
            <p className="text-[10px] opacity-70 font-mono-lcd">Biquad DSP Filter</p>
          </div>
        ) : currentTrack ? (
          <div className="flex flex-col items-center max-w-[150px]">
            <div className="w-24 h-24 rounded-lg overflow-hidden shadow-sm border border-black/15 mb-2">
              <img
                src={currentTrack.albumArtUrl}
                alt={currentTrack.album}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-bold text-[11px] truncate w-full">{currentTrack.album}</p>
            <p className="text-[10px] opacity-70 font-mono-lcd">{tracksCount} songs in library</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center mb-2 opacity-60">
              <Disc className="w-8 h-8" />
            </div>
            <p className="font-bold text-[11px]">BLACKBOX·POD 2004</p>
            <p className="text-[10px] opacity-70 font-mono-lcd">{tracksCount} songs loaded</p>
          </div>
        )}
      </div>
    </div>
  );
};
