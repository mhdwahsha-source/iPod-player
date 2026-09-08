import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  ArrowUpDown,
  Upload,
  FolderPlus,
  Play,
  Heart,
  Plus,
  Trash2,
  Music,
  User,
  Disc,
  Radio,
  Folder,
  Check,
} from 'lucide-react';
import { Track, ThemeSkin, Playlist } from '../../types';

interface MusicLibraryScreenProps {
  tracks: Track[];
  currentTrackId?: string;
  isPlaying: boolean;
  theme: ThemeSkin;
  selectedIndex: number;
  playlists: Playlist[];
  onPlayTrack: (track: Track, queueList: Track[]) => void;
  onToggleFavorite: (trackId: string) => void;
  onDeleteTrack: (trackId: string) => void;
  onImportFiles: (files: FileList | File[]) => Promise<void>;
  onAddToPlaylist: (playlistId: string, trackId: string) => void;
}

type TabType = 'songs' | 'artists' | 'albums' | 'genres' | 'folders';
type SortOption = 'name' | 'artist' | 'album' | 'dateAdded' | 'playCount';

export const MusicLibraryScreen: React.FC<MusicLibraryScreenProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  theme,
  selectedIndex,
  playlists,
  onPlayTrack,
  onToggleFavorite,
  onDeleteTrack,
  onImportFiles,
  onAddToPlaylist,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('songs');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState<string | null>(null);

  // Drilldown selection state for artists / albums / genres
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered & sorted tracks
  const filteredTracks = useMemo(() => {
    return tracks.filter((track) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        track.title.toLowerCase().includes(q) ||
        track.artist.toLowerCase().includes(q) ||
        track.album.toLowerCase().includes(q) ||
        (track.genre && track.genre.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (selectedArtist && track.artist !== selectedArtist) return false;
      if (selectedAlbum && track.album !== selectedAlbum) return false;
      if (selectedGenre && track.genre !== selectedGenre) return false;
      if (selectedFolder && track.folderPath !== selectedFolder) return false;

      return true;
    });
  }, [tracks, searchQuery, selectedArtist, selectedAlbum, selectedGenre, selectedFolder]);

  const sortedTracks = useMemo(() => {
    return [...filteredTracks].sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
      if (sortBy === 'album') return a.album.localeCompare(b.album);
      if (sortBy === 'dateAdded') return b.dateAdded - a.dateAdded;
      if (sortBy === 'playCount') return (b.playCount || 0) - (a.playCount || 0);
      return 0;
    });
  }, [filteredTracks, sortBy]);

  // Groupings for sub-tabs
  const artistsList = useMemo(() => {
    const map = new Map<string, number>();
    tracks.forEach((t) => map.set(t.artist, (map.get(t.artist) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tracks]);

  const albumsList = useMemo(() => {
    const map = new Map<string, { artist: string; count: number; art?: string }>();
    tracks.forEach((t) => {
      if (!map.has(t.album)) {
        map.set(t.album, { artist: t.artist, count: 1, art: t.albumArtUrl });
      } else {
        map.get(t.album)!.count += 1;
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tracks]);

  const genresList = useMemo(() => {
    const map = new Map<string, number>();
    tracks.forEach((t) => {
      const g = t.genre || 'Other';
      map.set(g, (map.get(g) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tracks]);

  const foldersList = useMemo(() => {
    const map = new Map<string, number>();
    tracks.forEach((t) => {
      const f = t.folderPath || '/';
      map.set(f, (map.get(f) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tracks]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsImporting(true);
      try {
        await onImportFiles(e.target.files);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (folderInputRef.current) folderInputRef.current.value = '';
      }
    }
  };

  const formatDuration = (secs: number) => {
    if (!secs || isNaN(secs)) return '--:--';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        multiple
        accept=".mp3,.m4a,.aac,.wav,.flac,.ogg,audio/*"
        className="hidden"
        id="hidden-music-file-input"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFileInput}
        {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
        multiple
        className="hidden"
        id="hidden-music-folder-input"
      />

      {/* Top Navigation Tabs & Import Button */}
      <div className="h-8 px-2 bg-black/10 flex items-center justify-between border-b border-black/10 text-[10px] shrink-0 font-medium">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('songs');
              setSelectedArtist(null);
              setSelectedAlbum(null);
              setSelectedGenre(null);
              setSelectedFolder(null);
            }}
            className={`px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
              activeTab === 'songs' ? 'bg-black/20 font-bold' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Music className="w-2.5 h-2.5" />
            <span>Songs ({tracks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('artists');
              setSelectedArtist(null);
            }}
            className={`px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
              activeTab === 'artists' ? 'bg-black/20 font-bold' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <User className="w-2.5 h-2.5" />
            <span>Artists</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('albums');
              setSelectedAlbum(null);
            }}
            className={`px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
              activeTab === 'albums' ? 'bg-black/20 font-bold' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Disc className="w-2.5 h-2.5" />
            <span>Albums</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('genres');
              setSelectedGenre(null);
            }}
            className={`px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
              activeTab === 'genres' ? 'bg-black/20 font-bold' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Radio className="w-2.5 h-2.5" />
            <span>Genres</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('folders');
              setSelectedFolder(null);
            }}
            className={`px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
              activeTab === 'folders' ? 'bg-black/20 font-bold' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Folder className="w-2.5 h-2.5" />
            <span>Folders</span>
          </button>
        </div>

        {/* Import Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="px-2 py-0.5 rounded bg-black/15 hover:bg-black/25 flex items-center gap-1 font-pixel text-[9px] active:scale-95 disabled:opacity-50"
            title="Import music files from device"
          >
            <Upload className="w-2.5 h-2.5" />
            <span>{isImporting ? 'SCANNING...' : 'IMPORT'}</span>
          </button>

          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            disabled={isImporting}
            className="p-1 rounded bg-black/15 hover:bg-black/25 active:scale-95 disabled:opacity-50"
            title="Scan folder from device"
          >
            <FolderPlus className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Search Bar & Sort Dropdown */}
      <div className="px-2 py-1.5 flex items-center gap-2 bg-black/5 border-b border-black/10 text-[11px] shrink-0">
        <div className="relative flex-1">
          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            placeholder="Search title, artist, album..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-6 pr-2 py-1 rounded bg-black/10 text-[10px] border border-black/10 placeholder:opacity-50 focus:outline-none focus:bg-black/15 font-mono-lcd"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1 shrink-0 text-[10px]">
          <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Sort library tracks"
            className="bg-black/10 border border-black/10 rounded px-1 py-0.5 text-[9px] focus:outline-none"
          >
            <option value="name">Title (A-Z)</option>
            <option value="artist">Artist</option>
            <option value="album">Album</option>
            <option value="dateAdded">Recently Added</option>
            <option value="playCount">Most Played</option>
          </select>
        </div>
      </div>

      {/* Active Filter Pill if drilled down */}
      {(selectedArtist || selectedAlbum || selectedGenre || selectedFolder) && (
        <div className="px-2 py-1 bg-black/10 flex items-center justify-between text-[10px] border-b border-black/10">
          <span className="truncate font-semibold">
            Filtering by:{' '}
            {selectedArtist || selectedAlbum || selectedGenre || selectedFolder}
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedArtist(null);
              setSelectedAlbum(null);
              setSelectedGenre(null);
              setSelectedFolder(null);
            }}
            className="text-[9px] underline opacity-80 hover:opacity-100"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* TAB: SONGS (OR DRILLED DOWN VIEW) */}
        {(activeTab === 'songs' ||
          selectedArtist ||
          selectedAlbum ||
          selectedGenre ||
          selectedFolder) && (
          <div>
            {sortedTracks.length === 0 ? (
              <div className="p-6 text-center">
                <Music className="w-8 h-8 opacity-30 mx-auto mb-2" />
                <p className="font-bold text-xs">No Songs Found</p>
                <p className="text-[10px] opacity-70 mt-1">
                  Tap &quot;IMPORT&quot; above to add your MP3, M4A, WAV, or FLAC files.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {sortedTracks.map((track, idx) => {
                  const isCurrent = track.id === currentTrackId;

                  return (
                    <div
                      key={track.id}
                      id={`track-row-${track.id}`}
                      onClick={() => onPlayTrack(track, sortedTracks)}
                      className={`px-2 py-1.5 flex items-center justify-between hover:bg-black/5 active:bg-black/10 cursor-pointer transition-colors text-[11px] select-none ${
                        isCurrent ? 'bg-black/15 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* Album art or track index */}
                        <div className="relative w-7 h-7 rounded overflow-hidden shrink-0 border border-black/15 bg-black/10">
                          {track.albumArtUrl ? (
                            <img
                              src={track.albumArtUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-mono-lcd text-[9px] opacity-60">
                              {idx + 1}
                            </div>
                          )}

                          {isCurrent && isPlaying && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Play className="w-3 h-3 fill-white text-white animate-pulse" />
                            </div>
                          )}
                        </div>

                        {/* Title & Artist */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] leading-tight font-medium">
                            {track.title}
                          </p>
                          <p className="truncate text-[9px] opacity-70">
                            {track.artist} • {track.album}
                          </p>
                        </div>
                      </div>

                      {/* Right Action buttons: duration, favorite, playlist add, delete */}
                      <div
                        className="flex items-center gap-1.5 shrink-0 text-[10px] opacity-80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="font-mono-lcd text-[9px]">
                          {formatDuration(track.duration)}
                        </span>

                        <button
                          type="button"
                          onClick={() => onToggleFavorite(track.id)}
                          className={`p-1 rounded hover:bg-black/10 transition-transform active:scale-90 ${
                            track.isFavorite ? 'text-rose-500 opacity-100' : 'opacity-40 hover:opacity-100'
                          }`}
                          title="Favorite"
                        >
                          <Heart className={`w-3 h-3 ${track.isFavorite ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowPlaylistModal(track.id)}
                          className="p-1 rounded hover:bg-black/10 opacity-50 hover:opacity-100"
                          title="Add to Playlist"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteTrack(track.id)}
                          className="p-1 rounded hover:bg-black/10 opacity-30 hover:opacity-90 hover:text-red-600"
                          title="Delete from library"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: ARTISTS */}
        {activeTab === 'artists' && !selectedArtist && (
          <div className="divide-y divide-black/5">
            {artistsList.map(([artistName, count]) => (
              <div
                key={artistName}
                onClick={() => setSelectedArtist(artistName)}
                className="px-3 py-2 flex items-center justify-between hover:bg-black/5 cursor-pointer text-[11px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <User className="w-3.5 h-3.5 opacity-60" />
                  <span className="font-medium truncate">{artistName}</span>
                </div>
                <span className="text-[9px] font-mono-lcd px-1.5 py-0.5 rounded bg-black/10 opacity-70">
                  {count} {count === 1 ? 'song' : 'songs'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* TAB: ALBUMS */}
        {activeTab === 'albums' && !selectedAlbum && (
          <div className="p-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {albumsList.map(([albumName, data]) => (
              <div
                key={albumName}
                onClick={() => setSelectedAlbum(albumName)}
                className="p-2 rounded-lg bg-black/5 hover:bg-black/10 cursor-pointer flex flex-col items-center text-center group border border-black/10"
              >
                <div className="w-16 h-16 rounded overflow-hidden mb-1.5 shadow-sm border border-black/15 bg-black/10">
                  {data.art ? (
                    <img src={data.art} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Disc className="w-8 h-8 opacity-40 m-auto mt-4" />
                  )}
                </div>
                <p className="font-bold text-[10px] truncate w-full">{albumName}</p>
                <p className="text-[8px] opacity-70 truncate w-full">{data.artist}</p>
                <p className="text-[8px] font-mono-lcd opacity-50 mt-0.5">{data.count} tracks</p>
              </div>
            ))}
          </div>
        )}

        {/* TAB: GENRES */}
        {activeTab === 'genres' && !selectedGenre && (
          <div className="divide-y divide-black/5">
            {genresList.map(([genreName, count]) => (
              <div
                key={genreName}
                onClick={() => setSelectedGenre(genreName)}
                className="px-3 py-2 flex items-center justify-between hover:bg-black/5 cursor-pointer text-[11px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <Radio className="w-3.5 h-3.5 opacity-60" />
                  <span className="font-medium truncate">{genreName}</span>
                </div>
                <span className="text-[9px] font-mono-lcd px-1.5 py-0.5 rounded bg-black/10 opacity-70">
                  {count} songs
                </span>
              </div>
            ))}
          </div>
        )}

        {/* TAB: FOLDERS */}
        {activeTab === 'folders' && !selectedFolder && (
          <div className="divide-y divide-black/5">
            {foldersList.map(([folderPath, count]) => (
              <div
                key={folderPath}
                onClick={() => setSelectedFolder(folderPath)}
                className="px-3 py-2 flex items-center justify-between hover:bg-black/5 cursor-pointer text-[11px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder className="w-3.5 h-3.5 opacity-60" />
                  <span className="font-medium truncate font-mono-lcd text-[10px]">
                    {folderPath}
                  </span>
                </div>
                <span className="text-[9px] font-mono-lcd px-1.5 py-0.5 rounded bg-black/10 opacity-70">
                  {count} files
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Playlist Selector Modal */}
      {showPlaylistModal && (
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 z-50"
          onClick={() => setShowPlaylistModal(null)}
        >
          <div
            className="w-full max-w-[240px] bg-gray-100 text-gray-900 rounded-xl p-3 shadow-2xl border border-white/40"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-xs mb-2">Add to Playlist</h3>
            {playlists.length === 0 ? (
              <p className="text-[10px] opacity-70 mb-2">No playlists created yet.</p>
            ) : (
              <div className="max-h-32 overflow-y-auto divide-y divide-gray-200 mb-2">
                {playlists.map((pl) => (
                  <button
                    type="button"
                    key={pl.id}
                    onClick={() => {
                      onAddToPlaylist(pl.id, showPlaylistModal);
                      setShowPlaylistModal(null);
                    }}
                    className="w-full text-left py-1.5 px-2 hover:bg-blue-100 rounded text-[11px] font-medium flex items-center justify-between"
                  >
                    <span>{pl.name}</span>
                    <span className="text-[9px] opacity-60 font-mono-lcd">{pl.trackIds.length} tracks</span>
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowPlaylistModal(null)}
              className="w-full py-1 bg-gray-300 hover:bg-gray-400 rounded text-[10px] font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
