import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Track,
  Playlist,
  PlayerSettings,
  ScreenType,
  ThemeSkin,
} from './types';
import {
  getAllTracks,
  saveTrack,
  saveTracksBulk,
  deleteTrack as deleteTrackFromDb,
  getAllPlaylists,
  savePlaylist,
  deletePlaylist as deletePlaylistFromDb,
  getStoredSettings,
  saveStoredSettings,
  recordTrackPlayed,
  toggleTrackFavorite,
  clearPlayHistory as clearPlayHistoryDb,
  resetDatabase,
} from './services/db';
import { parseAudioFile } from './services/metadataParser';
import { audioEngine } from './services/audioEngine';
import { getInitialSampleTracks } from './services/sampleMusic';
import { DeviceCase } from './components/DeviceCase';
import { LcdScreen } from './components/LcdScreen';
import { ClickWheel } from './components/ClickWheel';
import { MiniPlayer } from './components/MiniPlayer';

// Screens
import { MainMenu, MENU_ITEMS } from './components/screens/MainMenu';
import { NowPlayingScreen } from './components/screens/NowPlayingScreen';
import { MusicLibraryScreen } from './components/screens/MusicLibraryScreen';
import { PlaylistManager } from './components/screens/PlaylistManager';
import { SpecialListsScreen } from './components/screens/SpecialListsScreen';
import { EqualizerScreen } from './components/screens/EqualizerScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { QueueScreen } from './components/screens/QueueScreen';
import { LyricsScreen } from './components/screens/LyricsScreen';
import { fileToDataUrl } from './services/wallpapers';

export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [settings, setSettings] = useState<PlayerSettings | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('main-menu');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>([]);
  const [menuIndex, setMenuIndex] = useState<number>(0);

  const [isHoldLocked, setIsHoldLocked] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Keep references to state for audio event callbacks
  const queueRef = useRef<Track[]>([]);
  queueRef.current = queue;
  const queueIndexRef = useRef<number>(0);
  queueIndexRef.current = queueIndex;
  const currentTrackRef = useRef<Track | null>(null);
  currentTrackRef.current = currentTrack;
  const settingsRef = useRef<PlayerSettings | null>(null);
  settingsRef.current = settings;

  // Initialize DB, settings, and sample tracks
  useEffect(() => {
    async function initApp() {
      try {
        const storedSettings = await getStoredSettings();
        setSettings(storedSettings);
        audioEngine.setVolume(storedSettings.volume);

        let storedTracks = await getAllTracks();
        const storedPlaylists = await getAllPlaylists();

        // If no tracks exist, generate the 3 nostalgic Y2K synth demo tracks!
        if (storedTracks.length === 0) {
          const demoTracks = await getInitialSampleTracks();
          await saveTracksBulk(demoTracks);
          storedTracks = demoTracks;
        }

        setTracks(storedTracks);
        setPlaylists(storedPlaylists);

        if (storedTracks.length > 0) {
          setCurrentTrack(storedTracks[0]);
          setQueue(storedTracks);
          setQueueIndex(0);
          setDuration(storedTracks[0].duration);
          // Pre-load track into engine without autoplay
          await audioEngine.loadTrack(storedTracks[0], false);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initApp();
  }, []);

  // Wire up audio engine callbacks
  useEffect(() => {
    audioEngine.onTimeUpdate = (cur, dur) => {
      setCurrentTime(cur);
      setDuration(dur);
    };

    audioEngine.onPlayStateChange = (playing) => {
      setIsPlaying(playing);
    };

    audioEngine.onEnded = () => {
      handleNextTrack();
    };

    audioEngine.onMediaPrev = () => {
      handlePrevTrack();
    };

    audioEngine.onMediaNext = () => {
      handleNextTrack();
    };

    return () => {
      audioEngine.destroy();
    };
  }, []);

  // Save settings when updated
  const updateSettings = useCallback(async (updates: Partial<PlayerSettings>) => {
    if (!settings) return;
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveStoredSettings(newSettings);

    if (updates.volume !== undefined) {
      audioEngine.setVolume(updates.volume);
    }
    if (updates.playbackSpeed !== undefined) {
      audioEngine.setPlaybackRate(updates.playbackSpeed);
    }
  }, [settings]);

  // Navigate to screen
  const navigateTo = (screen: ScreenType) => {
    setScreenHistory((prev) => [...prev, currentScreen]);
    setCurrentScreen(screen);
  };

  // Go back one screen (Click Wheel MENU button)
  const handleMenuBack = () => {
    if (isHoldLocked) return;

    if (screenHistory.length > 0) {
      const prev = screenHistory[screenHistory.length - 1];
      setScreenHistory((h) => h.slice(0, -1));
      setCurrentScreen(prev);
    } else if (currentScreen !== 'main-menu') {
      setCurrentScreen('main-menu');
    } else if (currentTrack && isPlaying) {
      // If on main menu and music is playing, MENU goes to Now Playing
      navigateTo('now-playing');
    }
  };

  // Play a specific track
  const handlePlayTrack = async (track: Track, newQueue?: Track[]) => {
    const q = newQueue || tracks;
    setQueue(q);
    const idx = q.findIndex((t) => t.id === track.id);
    setQueueIndex(idx !== -1 ? idx : 0);
    setCurrentTrack(track);

    try {
      await audioEngine.loadTrack(track, true);
      await recordTrackPlayed(track.id);

      // Refresh track stats in state
      setTracks((prev) =>
        prev.map((t) =>
          t.id === track.id
            ? { ...t, playCount: (t.playCount || 0) + 1, lastPlayed: Date.now() }
            : t
        )
      );

      // Switch to Now Playing screen
      navigateTo('now-playing');
    } catch (err) {
      console.error('Error playing track:', err);
    }
  };

  // Play / Pause toggle
  const handlePlayPause = () => {
    if (isHoldLocked) return;
    if (!currentTrack && tracks.length > 0) {
      handlePlayTrack(tracks[0]);
    } else {
      audioEngine.togglePlay();
    }
  };

  // Next track
  const handleNextTrack = () => {
    if (isHoldLocked) return;
    const currentQ = queueRef.current;
    if (currentQ.length === 0) return;

    const currentSt = settingsRef.current;
    let nextIdx = queueIndexRef.current + 1;

    if (currentSt?.repeatMode === 'one') {
      // Repeat same track
      audioEngine.seek(0);
      audioEngine.play();
      return;
    }

    if (currentSt?.shuffle) {
      nextIdx = Math.floor(Math.random() * currentQ.length);
    } else if (nextIdx >= currentQ.length) {
      if (currentSt?.repeatMode === 'all') {
        nextIdx = 0;
      } else {
        // End of queue
        return;
      }
    }

    const nextTrack = currentQ[nextIdx];
    if (nextTrack) {
      setQueueIndex(nextIdx);
      setCurrentTrack(nextTrack);
      audioEngine.loadTrack(nextTrack, true);
      recordTrackPlayed(nextTrack.id);
    }
  };

  // Previous track
  const handlePrevTrack = () => {
    if (isHoldLocked) return;

    // If more than 3 seconds in, seek to beginning
    if (audioEngine.getCurrentTime() > 3) {
      audioEngine.seek(0);
      return;
    }

    const currentQ = queueRef.current;
    if (currentQ.length === 0) return;

    let prevIdx = queueIndexRef.current - 1;
    if (prevIdx < 0) {
      prevIdx = currentQ.length - 1;
    }

    const prevTrack = currentQ[prevIdx];
    if (prevTrack) {
      setQueueIndex(prevIdx);
      setCurrentTrack(prevTrack);
      audioEngine.loadTrack(prevTrack, true);
      recordTrackPlayed(prevTrack.id);
    }
  };

  // Click Wheel Circular Rotation
  const handleWheelScroll = (direction: 1 | -1) => {
    if (isHoldLocked) return;

    if (currentScreen === 'main-menu') {
      setMenuIndex((prev) => {
        let next = prev + direction;
        if (next < 0) next = MENU_ITEMS.length - 1;
        if (next >= MENU_ITEMS.length) next = 0;
        return next;
      });
    } else if (currentScreen === 'now-playing') {
      // Scroll wheel in Now Playing adjusts volume
      if (settings) {
        const newVol = Math.max(0, Math.min(1, settings.volume + direction * 0.05));
        updateSettings({ volume: newVol });
      }
    } else {
      // General list scroll: scroll active container
      const container = document.querySelector('#lcd-display-container .overflow-y-auto');
      if (container) {
        container.scrollBy({ top: direction * 45, behavior: 'smooth' });
      }
    }
  };

  // Click Wheel Center SELECT button
  const handleCenterSelect = () => {
    if (isHoldLocked) return;

    if (currentScreen === 'main-menu') {
      const item = MENU_ITEMS[menuIndex];
      if (item) {
        navigateTo(item.id);
      }
    } else if (currentScreen === 'now-playing') {
      handlePlayPause();
    }
  };

  // Import files from device
  const handleImportFiles = async (files: FileList | File[]) => {
    const newTracks: Track[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const metadata = await parseAudioFile(file);
        const newTrack: Track = {
          id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          title: metadata.title,
          artist: metadata.artist,
          album: metadata.album,
          genre: metadata.genre,
          trackNumber: metadata.trackNumber,
          year: metadata.year,
          duration: metadata.duration,
          albumArtUrl: metadata.albumArtUrl,
          dateAdded: Date.now(),
          playCount: 0,
          isFavorite: false,
          mimeType: file.type || 'audio/mpeg',
          fileSize: file.size,
          fileName: file.name,
          folderPath: file.webkitRelativePath ? '/' + file.webkitRelativePath.split('/')[0] : '/Imports',
          lyrics: metadata.lyrics,
          audioBlob: file,
        };

        newTracks.push(newTrack);
      } catch (err) {
        console.warn('Failed to parse file:', file.name, err);
      }
    }

    if (newTracks.length > 0) {
      await saveTracksBulk(newTracks);
      setTracks((prev) => [...newTracks, ...prev]);

      // If nothing was playing, queue and play the first imported track
      if (!currentTrack) {
        handlePlayTrack(newTracks[0], newTracks);
      }
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (trackId: string) => {
    const isFav = await toggleTrackFavorite(trackId);
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, isFavorite: isFav } : t))
    );
    if (currentTrack?.id === trackId) {
      setCurrentTrack((prev) => (prev ? { ...prev, isFavorite: isFav } : null));
    }
  };

  // Delete track
  const handleDeleteTrack = async (trackId: string) => {
    await deleteTrackFromDb(trackId);
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    setQueue((prev) => prev.filter((t) => t.id !== trackId));
    if (currentTrack?.id === trackId) {
      const remaining = tracks.filter((t) => t.id !== trackId);
      if (remaining.length > 0) {
        handlePlayTrack(remaining[0], remaining);
      } else {
        audioEngine.pause();
        setCurrentTrack(null);
      }
    }
  };

  // Playlist actions
  const handleCreatePlaylist = async (name: string) => {
    const newPl: Playlist = {
      id: `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      trackIds: [],
    };
    await savePlaylist(newPl);
    setPlaylists((prev) => [...prev, newPl]);
  };

  const handleDeletePlaylist = async (id: string) => {
    await deletePlaylistFromDb(id);
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRenamePlaylist = async (id: string, newName: string) => {
    const pl = playlists.find((p) => p.id === id);
    if (!pl) return;
    const updated = { ...pl, name: newName, updatedAt: Date.now() };
    await savePlaylist(updated);
    setPlaylists((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const handleAddToPlaylist = async (playlistId: string, trackId: string) => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl || pl.trackIds.includes(trackId)) return;
    const updated = {
      ...pl,
      trackIds: [...pl.trackIds, trackId],
      updatedAt: Date.now(),
    };
    await savePlaylist(updated);
    setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? updated : p)));
  };

  const handleRemoveTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    const updated = {
      ...pl,
      trackIds: pl.trackIds.filter((id) => id !== trackId),
      updatedAt: Date.now(),
    };
    await savePlaylist(updated);
    setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? updated : p)));
  };

  // Lyrics save
  const handleSaveLyrics = async (trackId: string, lyrics: string) => {
    const t = tracks.find((tr) => tr.id === trackId);
    if (!t) return;
    const updated = { ...t, lyrics };
    await saveTrack(updated);
    setTracks((prev) => prev.map((tr) => (tr.id === trackId ? updated : tr)));
    if (currentTrack?.id === trackId) {
      setCurrentTrack(updated);
    }
  };

  // Reset database & Load sample tracks
  const handleResetApp = async () => {
    audioEngine.pause();
    await resetDatabase();
    setTracks([]);
    setPlaylists([]);
    setCurrentTrack(null);
    setQueue([]);
    setCurrentScreen('main-menu');
  };

  const handleLoadDemoTracks = async () => {
    setIsLoading(true);
    try {
      const demoTracks = await getInitialSampleTracks();
      await saveTracksBulk(demoTracks);
      setTracks((prev) => [...demoTracks, ...prev]);
      if (!currentTrack) {
        handlePlayTrack(demoTracks[0], demoTracks);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    await clearPlayHistoryDb();
    setTracks((prev) =>
      prev.map((t) => ({ ...t, playCount: 0, lastPlayed: undefined }))
    );
  };

  // Speed toggle (1x -> 1.25x -> 1.5x -> 2x -> 0.75x -> 1x)
  const handleChangeSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const cur = settings?.playbackSpeed || 1.0;
    const nextIdx = (speeds.indexOf(cur) + 1) % speeds.length;
    updateSettings({ playbackSpeed: speeds[nextIdx] });
  };

  const totalStorageBytes = tracks.reduce((acc, t) => acc + (t.fileSize || 0), 0);
  const favoritesCount = tracks.filter((t) => t.isFavorite).length;

  const currentTheme = settings?.theme || 'classic-silver';

  // Render active screen inside the LCD
  const renderScreen = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin mb-2" />
          <p className="font-pixel text-[10px] tracking-wider">BOOTING BLACKBOX·POD...</p>
          <p className="text-[9px] font-mono-lcd opacity-70 mt-1">Loading offline database</p>
        </div>
      );
    }

    switch (currentScreen) {
      case 'main-menu':
        return (
          <MainMenu
            selectedIndex={menuIndex}
            onSelectScreen={navigateTo}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            tracksCount={tracks.length}
            playlistsCount={playlists.length}
            favoritesCount={favoritesCount}
            theme={currentTheme}
          />
        );

      case 'now-playing':
        return (
          <NowPlayingScreen
            track={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            shuffle={settings?.shuffle || false}
            repeatMode={settings?.repeatMode || 'off'}
            playbackSpeed={settings?.playbackSpeed || 1.0}
            theme={currentTheme}
            visualizerMode={settings?.visualizerMode || 'bars'}
            onPlayPause={handlePlayPause}
            onNext={handleNextTrack}
            onPrev={handlePrevTrack}
            onSeek={(t) => audioEngine.seek(t)}
            onSeekRelative={(d) => audioEngine.seekRelative(d)}
            onToggleShuffle={() => updateSettings({ shuffle: !settings?.shuffle })}
            onToggleRepeat={() => {
              const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
              const next = modes[(modes.indexOf(settings?.repeatMode || 'off') + 1) % modes.length];
              updateSettings({ repeatMode: next });
            }}
            onToggleFavorite={handleToggleFavorite}
            onChangeSpeed={handleChangeSpeed}
            onOpenQueue={() => navigateTo('queue')}
            onOpenLyrics={() => navigateTo('lyrics')}
            onOpenEqualizer={() => navigateTo('equalizer')}
          />
        );

      case 'music':
      case 'songs':
      case 'artists':
      case 'albums':
      case 'genres':
        return (
          <MusicLibraryScreen
            tracks={tracks}
            currentTrackId={currentTrack?.id}
            isPlaying={isPlaying}
            theme={currentTheme}
            selectedIndex={0}
            playlists={playlists}
            onPlayTrack={handlePlayTrack}
            onToggleFavorite={handleToggleFavorite}
            onDeleteTrack={handleDeleteTrack}
            onImportFiles={handleImportFiles}
            onAddToPlaylist={handleAddToPlaylist}
          />
        );

      case 'playlists':
        return (
          <PlaylistManager
            playlists={playlists}
            tracks={tracks}
            theme={currentTheme}
            onPlayTrack={handlePlayTrack}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onRenamePlaylist={handleRenamePlaylist}
            onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
          />
        );

      case 'favorites':
        return (
          <SpecialListsScreen
            type="favorites"
            tracks={tracks}
            theme={currentTheme}
            onPlayTrack={handlePlayTrack}
            onToggleFavorite={handleToggleFavorite}
          />
        );

      case 'recently-played':
        return (
          <SpecialListsScreen
            type="recently-played"
            tracks={tracks}
            theme={currentTheme}
            onPlayTrack={handlePlayTrack}
            onToggleFavorite={handleToggleFavorite}
            onClearHistory={handleClearHistory}
          />
        );

      case 'most-played':
        return (
          <SpecialListsScreen
            type="most-played"
            tracks={tracks}
            theme={currentTheme}
            onPlayTrack={handlePlayTrack}
            onToggleFavorite={handleToggleFavorite}
          />
        );

      case 'equalizer':
        return (
          <EqualizerScreen
            theme={currentTheme}
            isPlaying={isPlaying}
            onBack={handleMenuBack}
          />
        );

      case 'settings':
        return (
          <SettingsScreen
            settings={settings || ({} as PlayerSettings)}
            tracksCount={tracks.length}
            totalStorageBytes={totalStorageBytes}
            onUpdateSettings={updateSettings}
            onClearHistory={handleClearHistory}
            onResetApp={handleResetApp}
            onLoadDemoTracks={handleLoadDemoTracks}
            onOpenEqualizer={() => navigateTo('equalizer')}
          />
        );

      case 'queue':
        return (
          <QueueScreen
            queue={queue}
            currentTrack={currentTrack}
            theme={currentTheme}
            onPlayTrack={(t) => handlePlayTrack(t, queue)}
            onRemoveFromQueue={(idx) => {
              setQueue((prev) => prev.filter((_, i) => i !== idx));
            }}
            onClearQueue={() => setQueue([])}
            onMoveQueueItem={(from, to) => {
              setQueue((prev) => {
                const copy = [...prev];
                const item = copy.splice(from, 1)[0];
                copy.splice(to, 0, item);
                return copy;
              });
            }}
          />
        );

      case 'lyrics':
        return (
          <LyricsScreen
            track={currentTrack}
            theme={currentTheme}
            onSaveLyrics={handleSaveLyrics}
          />
        );

      default:
        return null;
    }
  };

  // Compute title for the top LCD status bar
  const getScreenTitle = (): string => {
    switch (currentScreen) {
      case 'main-menu':
        return 'BLACKBOX·POD';
      case 'now-playing':
        return currentTrack ? currentTrack.title : 'Now Playing';
      case 'music':
      case 'songs':
        return 'Music Library';
      case 'artists':
        return 'Artists';
      case 'albums':
        return 'Albums';
      case 'genres':
        return 'Genres';
      case 'playlists':
        return 'Playlists';
      case 'favorites':
        return 'Favorites';
      case 'recently-played':
        return 'Recently Played';
      case 'most-played':
        return 'Top Rotation';
      case 'equalizer':
        return 'Equalizer DSP';
      case 'settings':
        return 'Settings';
      case 'queue':
        return 'Play Queue';
      case 'lyrics':
        return 'Lyrics';
      default:
        return 'BLACKBOX·POD';
    }
  };

  const handleUploadBackground = async (file: File) => {
    try {
      const dataUrl = await fileToDataUrl(file);
      await updateSettings({ customBackgroundUrl: dataUrl });
    } catch (err) {
      console.error('Failed to set background:', err);
    }
  };

  const hasCustomBg = !!settings?.customBackgroundUrl;
  const isWorkspaceBg =
    hasCustomBg &&
    (settings?.backgroundTarget === 'workspace' ||
      settings?.backgroundTarget === 'both' ||
      !settings?.backgroundTarget);
  const isScreenBg =
    hasCustomBg &&
    (settings?.backgroundTarget === 'screen' || settings?.backgroundTarget === 'both');

  return (
    <div
      id="app-root-viewport"
      className="relative w-screen h-screen bg-[#090b0e] flex items-center justify-center p-1 sm:p-4 select-none overflow-hidden"
    >
      {/* Dynamic Workspace Background Image */}
      {isWorkspaceBg && settings?.customBackgroundUrl && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105 pointer-events-none"
            style={{
              backgroundImage: `url("${settings.customBackgroundUrl}")`,
              filter: `blur(${settings.backgroundBlur ?? 0}px)`,
            }}
          />
          <div
            className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
            style={{
              backgroundColor: `rgba(0, 0, 0, ${(settings.backgroundDim ?? 30) / 100})`,
            }}
          />
        </>
      )}

      {/* Atmospheric vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)] pointer-events-none z-1" />

      {/* Device Case Layer */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <DeviceCase
          theme={currentTheme}
          isHoldLocked={isHoldLocked}
          onToggleHold={() => setIsHoldLocked(!isHoldLocked)}
          fullscreen={fullscreen}
          onToggleFullscreen={() => setFullscreen(!fullscreen)}
          onUploadBackground={handleUploadBackground}
          hasCustomBackground={hasCustomBg}
          childrenScreen={
            <LcdScreen
              title={getScreenTitle()}
              isPlaying={isPlaying}
              theme={currentTheme}
              showScanlines={settings?.showScanlines ?? true}
              volume={settings?.volume ?? 0.85}
              wallpaperUrl={isScreenBg ? settings?.customBackgroundUrl : undefined}
              wallpaperOpacity={settings?.screenWallpaperOpacity ?? 0.25}
            >
              {renderScreen()}
            </LcdScreen>
          }
          miniPlayerNode={
            currentScreen !== 'now-playing' && currentTrack ? (
              <MiniPlayer
                track={currentTrack}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                theme={currentTheme}
                onPlayPause={handlePlayPause}
                onNext={handleNextTrack}
                onExpand={() => navigateTo('now-playing')}
              />
            ) : null
          }
          childrenWheel={
            <ClickWheel
              theme={currentTheme}
              isPlaying={isPlaying}
              soundEnabled={settings?.soundEffectsEnabled ?? true}
              soundVolume={settings?.soundVolume ?? 0.6}
              sensitivity={settings?.clickWheelSensitivity ?? 1.0}
              onMenu={handleMenuBack}
              onSelect={handleCenterSelect}
              onPlayPause={handlePlayPause}
              onNext={handleNextTrack}
              onPrev={handlePrevTrack}
              onWheelScroll={handleWheelScroll}
            />
          }
        />
      </div>
    </div>
  );
}
