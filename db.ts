import { Track, Playlist, PlayerSettings } from '../types';

const DB_NAME = 'y2k_music_player_db';
const DB_VERSION = 1;

export const DEFAULT_SETTINGS: PlayerSettings = {
  theme: 'classic-silver',
  soundEffectsEnabled: true,
  soundVolume: 0.6,
  crossfadeDuration: 2,
  gapless: true,
  visualizerMode: 'bars',
  clickWheelSensitivity: 1.0,
  showScanlines: true,
  playbackSpeed: 1.0,
  shuffle: false,
  repeatMode: 'off',
  volume: 0.85,
  customBackgroundUrl: undefined,
  backgroundTarget: 'workspace',
  backgroundDim: 30,
  backgroundBlur: 0,
  screenWallpaperOpacity: 0.25,
};

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Tracks store
        if (!db.objectStoreNames.contains('tracks')) {
          const trackStore = db.createObjectStore('tracks', { keyPath: 'id' });
          trackStore.createIndex('artist', 'artist', { unique: false });
          trackStore.createIndex('album', 'album', { unique: false });
          trackStore.createIndex('genre', 'genre', { unique: false });
          trackStore.createIndex('dateAdded', 'dateAdded', { unique: false });
          trackStore.createIndex('playCount', 'playCount', { unique: false });
          trackStore.createIndex('isFavorite', 'isFavorite', { unique: false });
        }

        // Playlists store
        if (!db.objectStoreNames.contains('playlists')) {
          db.createObjectStore('playlists', { keyPath: 'id' });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Play history store
        if (!db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', {
            keyPath: 'id',
            autoIncrement: true,
          });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
          historyStore.createIndex('trackId', 'trackId', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  return dbPromise;
}

// Track operations
export async function saveTrack(track: Track): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tracks', 'readwrite');
    const store = tx.objectStore('tracks');
    const request = store.put(track);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function saveTracksBulk(tracks: Track[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tracks', 'readwrite');
    const store = tx.objectStore('tracks');
    tracks.forEach((track) => store.put(track));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllTracks(): Promise<Track[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tracks', 'readonly');
    const store = tx.objectStore('tracks');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getTrackById(id: string): Promise<Track | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tracks', 'readonly');
    const store = tx.objectStore('tracks');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteTrack(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['tracks', 'playlists'], 'readwrite');
    const trackStore = tx.objectStore('tracks');
    trackStore.delete(id);

    // Also remove from all playlists
    const playlistStore = tx.objectStore('playlists');
    const plReq = playlistStore.getAll();
    plReq.onsuccess = () => {
      const playlists: Playlist[] = plReq.result || [];
      playlists.forEach((pl) => {
        if (pl.trackIds.includes(id)) {
          pl.trackIds = pl.trackIds.filter((tid) => tid !== id);
          pl.updatedAt = Date.now();
          playlistStore.put(pl);
        }
      });
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateTrackMetadata(id: string, updates: Partial<Track>): Promise<void> {
  const track = await getTrackById(id);
  if (!track) return;
  const updatedTrack = { ...track, ...updates };
  await saveTrack(updatedTrack);
}

export async function recordTrackPlayed(id: string): Promise<void> {
  const track = await getTrackById(id);
  if (!track) return;

  const now = Date.now();
  track.playCount = (track.playCount || 0) + 1;
  track.lastPlayed = now;
  await saveTrack(track);

  // Log in history
  const db = await getDB();
  const tx = db.transaction('history', 'readwrite');
  const store = tx.objectStore('history');
  store.add({
    trackId: id,
    timestamp: now,
    title: track.title,
    artist: track.artist,
  });
}

export async function toggleTrackFavorite(id: string): Promise<boolean> {
  const track = await getTrackById(id);
  if (!track) return false;
  track.isFavorite = !track.isFavorite;
  await saveTrack(track);
  return track.isFavorite;
}

// Playlist operations
export async function getAllPlaylists(): Promise<Playlist[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('playlists', 'readonly');
    const store = tx.objectStore('playlists');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function savePlaylist(playlist: Playlist): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('playlists', 'readwrite');
    const store = tx.objectStore('playlists');
    const request = store.put(playlist);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deletePlaylist(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('playlists', 'readwrite');
    const store = tx.objectStore('playlists');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Settings operations
export async function getStoredSettings(): Promise<PlayerSettings> {
  const db = await getDB();
  return new Promise((resolve) => {
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const request = store.get('player_settings');
    request.onsuccess = () => {
      if (request.result && request.result.value) {
        resolve({ ...DEFAULT_SETTINGS, ...request.result.value });
      } else {
        resolve(DEFAULT_SETTINGS);
      }
    };
    request.onerror = () => resolve(DEFAULT_SETTINGS);
  });
}

export async function saveStoredSettings(settings: PlayerSettings): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    const request = store.put({ key: 'player_settings', value: settings });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearPlayHistory(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['history', 'tracks'], 'readwrite');
  const histStore = tx.objectStore('history');
  histStore.clear();

  const trackStore = tx.objectStore('tracks');
  const req = trackStore.getAll();
  req.onsuccess = () => {
    const tracks: Track[] = req.result || [];
    tracks.forEach((t) => {
      t.playCount = 0;
      t.lastPlayed = undefined;
      trackStore.put(t);
    });
  };

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function resetDatabase(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['tracks', 'playlists', 'settings', 'history'], 'readwrite');
    tx.objectStore('tracks').clear();
    tx.objectStore('playlists').clear();
    tx.objectStore('settings').clear();
    tx.objectStore('history').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
