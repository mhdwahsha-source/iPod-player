import React, { useState } from 'react';
import { ListMusic, Plus, Play, Trash2, Edit2, Music, Check, X } from 'lucide-react';
import { Playlist, Track, ThemeSkin } from '../../types';

interface PlaylistManagerProps {
  playlists: Playlist[];
  tracks: Track[];
  theme: ThemeSkin;
  onPlayTrack: (track: Track, queueList: Track[]) => void;
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (id: string) => void;
  onRenamePlaylist: (id: string, newName: string) => void;
  onRemoveTrackFromPlaylist: (playlistId: string, trackId: string) => void;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  playlists,
  tracks,
  theme,
  onPlayTrack,
  onCreatePlaylist,
  onDeletePlaylist,
  onRenamePlaylist,
  onRemoveTrackFromPlaylist,
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');

  const currentPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
  const playlistTracks = currentPlaylist
    ? currentPlaylist.trackIds
        .map((tid) => tracks.find((t) => t.id === tid))
        .filter((t): t is Track => !!t)
    : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      onRenamePlaylist(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top Action Bar */}
      <div className="h-8 px-2.5 bg-black/10 flex items-center justify-between border-b border-black/10 text-[10px] shrink-0 font-medium">
        <div className="flex items-center gap-1.5">
          <ListMusic className="w-3.5 h-3.5" />
          <span className="font-bold">
            {selectedPlaylistId ? currentPlaylist?.name : 'My Playlists'}
          </span>
        </div>

        <div>
          {selectedPlaylistId ? (
            <button
              type="button"
              onClick={() => setSelectedPlaylistId(null)}
              className="px-2 py-0.5 rounded bg-black/15 hover:bg-black/25 text-[9px] font-pixel"
            >
              &lt; BACK
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="px-2 py-0.5 rounded bg-black/15 hover:bg-black/25 flex items-center gap-1 font-pixel text-[9px] active:scale-95"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>NEW PLAYLIST</span>
            </button>
          )}
        </div>
      </div>

      {/* Creation Modal / Inline Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="p-2 bg-black/15 border-b border-black/10 flex items-center gap-1.5 text-[11px]"
        >
          <input
            type="text"
            placeholder="Playlist Name (e.g. Y2K Party Hits)"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            autoFocus
            className="flex-1 px-2 py-1 rounded bg-black/20 text-[10px] font-mono-lcd border border-black/15 focus:outline-none"
          />
          <button
            type="submit"
            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
            title="Create"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="p-1 rounded bg-black/20 hover:bg-black/30"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Main List */}
      <div className="flex-1 overflow-y-auto">
        {!selectedPlaylistId ? (
          // Playlists Overview
          <div>
            {playlists.length === 0 ? (
              <div className="p-6 text-center">
                <ListMusic className="w-8 h-8 opacity-30 mx-auto mb-2" />
                <p className="font-bold text-xs">No Playlists</p>
                <p className="text-[10px] opacity-70 mt-1">
                  Create a custom playlist to organize your favorite tracks.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    className="px-3 py-2 flex items-center justify-between hover:bg-black/5 cursor-pointer text-[11px] group"
                    onClick={() => setSelectedPlaylistId(pl.id)}
                  >
                    <div className="flex items-center gap-2 truncate flex-1">
                      <div className="w-7 h-7 rounded bg-black/10 flex items-center justify-center shrink-0 border border-black/10">
                        <ListMusic className="w-3.5 h-3.5 opacity-60" />
                      </div>

                      {editingId === pl.id ? (
                        <div
                          className="flex items-center gap-1 flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono-lcd border border-black/20"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(pl.id)}
                            className="p-1 bg-emerald-600 text-white rounded"
                          >
                            <Check className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="truncate">
                          <p className="font-medium truncate">{pl.name}</p>
                          <p className="text-[9px] font-mono-lcd opacity-60">
                            {pl.trackIds.length} {pl.trackIds.length === 1 ? 'track' : 'tracks'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div
                      className="flex items-center gap-1 opacity-60 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(pl.id);
                          setEditName(pl.name);
                        }}
                        className="p-1 hover:bg-black/10 rounded"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeletePlaylist(pl.id)}
                        className="p-1 hover:bg-black/10 rounded text-red-500 hover:text-red-700"
                        title="Delete playlist"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Playlist Detail Tracks
          <div>
            {playlistTracks.length === 0 ? (
              <div className="p-6 text-center">
                <Music className="w-8 h-8 opacity-30 mx-auto mb-2" />
                <p className="font-bold text-xs">Playlist is Empty</p>
                <p className="text-[10px] opacity-70 mt-1">
                  Add tracks to this playlist from the Music Library screen using the &apos;+&apos; button.
                </p>
              </div>
            ) : (
              <div>
                <div className="p-2 bg-black/5 flex items-center justify-between border-b border-black/10">
                  <span className="text-[10px] font-mono-lcd font-bold">
                    {playlistTracks.length} TRACKS
                  </span>
                  <button
                    type="button"
                    onClick={() => onPlayTrack(playlistTracks[0], playlistTracks)}
                    className="px-2 py-0.5 rounded bg-blue-600 text-white font-pixel text-[9px] flex items-center gap-1 active:scale-95"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>PLAY ALL</span>
                  </button>
                </div>

                <div className="divide-y divide-black/5">
                  {playlistTracks.map((track, idx) => (
                    <div
                      key={track.id}
                      className="px-2 py-1.5 flex items-center justify-between hover:bg-black/5 cursor-pointer text-[11px]"
                      onClick={() => onPlayTrack(track, playlistTracks)}
                    >
                      <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                        <span className="font-mono-lcd text-[9px] opacity-60 w-4 text-center">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-medium truncate">{track.title}</p>
                          <p className="text-[9px] opacity-70 truncate">{track.artist}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentPlaylist) {
                            onRemoveTrackFromPlaylist(currentPlaylist.id, track.id);
                          }
                        }}
                        className="p-1 hover:bg-black/10 rounded opacity-40 hover:opacity-100 hover:text-red-600"
                        title="Remove from playlist"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
