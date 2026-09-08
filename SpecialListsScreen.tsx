import React from 'react';
import { Heart, Clock, Flame, Play, Trash2, Music } from 'lucide-react';
import { Track, ThemeSkin } from '../../types';

interface SpecialListsScreenProps {
  type: 'favorites' | 'recently-played' | 'most-played';
  tracks: Track[];
  theme: ThemeSkin;
  onPlayTrack: (track: Track, queueList: Track[]) => void;
  onToggleFavorite: (trackId: string) => void;
  onClearHistory?: () => void;
}

export const SpecialListsScreen: React.FC<SpecialListsScreenProps> = ({
  type,
  tracks,
  theme,
  onPlayTrack,
  onToggleFavorite,
  onClearHistory,
}) => {
  let title = 'Favorites';
  let icon = <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />;
  let emptyMsg = 'No favorite tracks yet. Tap the heart on any song to add it here.';
  let displayedTracks = [...tracks];

  if (type === 'favorites') {
    title = 'Favorite Songs';
    displayedTracks = tracks.filter((t) => t.isFavorite);
  } else if (type === 'recently-played') {
    title = 'Recently Played';
    icon = <Clock className="w-3.5 h-3.5" />;
    emptyMsg = 'No playback history yet. Start playing some music!';
    displayedTracks = tracks
      .filter((t) => (t.playCount || 0) > 0 && t.lastPlayed)
      .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
  } else if (type === 'most-played') {
    title = 'Most Played';
    icon = <Flame className="w-3.5 h-3.5 text-amber-500" />;
    emptyMsg = 'No play statistics yet. Play songs to see your top rotation!';
    displayedTracks = tracks
      .filter((t) => (t.playCount || 0) > 0)
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
  }

  const formatDuration = (secs: number) => {
    if (!secs || isNaN(secs)) return '--:--';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="h-8 px-2.5 bg-black/10 flex items-center justify-between border-b border-black/10 text-[10px] shrink-0 font-medium">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="font-bold">{title}</span>
          <span className="font-mono-lcd opacity-60">({displayedTracks.length})</span>
        </div>

        <div className="flex items-center gap-1">
          {displayedTracks.length > 0 && (
            <button
              type="button"
              onClick={() => onPlayTrack(displayedTracks[0], displayedTracks)}
              className="px-2 py-0.5 rounded bg-blue-600 text-white font-pixel text-[9px] flex items-center gap-1 active:scale-95"
            >
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>PLAY ALL</span>
            </button>
          )}

          {type === 'recently-played' && onClearHistory && displayedTracks.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="p-1 rounded bg-black/10 hover:bg-black/20 text-[9px] text-red-500"
              title="Clear Play History"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto">
        {displayedTracks.length === 0 ? (
          <div className="p-6 text-center">
            <Music className="w-8 h-8 opacity-30 mx-auto mb-2" />
            <p className="font-bold text-xs">List is Empty</p>
            <p className="text-[10px] opacity-70 mt-1 max-w-[200px] mx-auto">{emptyMsg}</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {displayedTracks.map((track, idx) => (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track, displayedTracks)}
                className="px-2 py-1.5 flex items-center justify-between hover:bg-black/5 active:bg-black/10 cursor-pointer text-[11px]"
              >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  <span className="font-mono-lcd text-[9px] opacity-60 w-4 text-center">
                    {idx + 1}
                  </span>

                  <div className="w-7 h-7 rounded overflow-hidden shrink-0 border border-black/15 bg-black/10">
                    <img src={track.albumArtUrl} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="truncate">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className="text-[9px] opacity-70 truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-[10px]">
                  {type === 'most-played' && (
                    <span className="font-mono-lcd text-[9px] px-1.5 py-0.5 rounded bg-black/10 font-bold">
                      {track.playCount} {track.playCount === 1 ? 'play' : 'plays'}
                    </span>
                  )}

                  <span className="font-mono-lcd text-[9px] opacity-70">
                    {formatDuration(track.duration)}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(track.id);
                    }}
                    className={`p-1 rounded hover:bg-black/10 ${
                      track.isFavorite ? 'text-rose-500' : 'opacity-40 hover:opacity-100'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${track.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
