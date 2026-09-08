import { EqualizerBand, EqualizerPreset, Track } from '../types';

export const EQ_FREQUENCIES = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

export const EQ_PRESETS: EqualizerPreset[] = [
  { name: 'Flat', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Rock', gains: [5, 3, 2, 0, -1, 1, 3, 5, 5, 4] },
  { name: 'Pop', gains: [-1, 2, 4, 5, 4, 1, -1, -1, 2, 3] },
  { name: 'Hip-Hop', gains: [7, 6, 3, 1, -1, 0, 2, 3, 4, 4] },
  { name: 'Electronic', gains: [6, 5, 2, 0, -2, 2, 4, 5, 5, 6] },
  { name: 'Classical', gains: [4, 3, 2, 1, -1, -1, 0, 2, 4, 5] },
  { name: 'Bass Boost', gains: [9, 8, 6, 3, 1, 0, 0, 0, 0, 0] },
  { name: 'Treble Boost', gains: [-2, -2, -1, 0, 1, 3, 5, 7, 8, 9] },
  { name: 'Vocal', gains: [-3, -2, 0, 3, 6, 5, 3, 1, -1, -2] },
  { name: 'Custom', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
];

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private audioElement: HTMLAudioElement;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private currentTrack: Track | null = null;
  private currentObjectUrl: string | null = null;

  // Sound effects audio context
  private sfxCtx: AudioContext | null = null;

  // State callbacks
  public onTimeUpdate: ((currentTime: number, duration: number) => void) | null = null;
  public onEnded: (() => void) | null = null;
  public onPlayStateChange: ((isPlaying: boolean) => void) | null = null;
  public onError: ((error: string) => void) | null = null;

  // Media session action callbacks
  public onMediaPrev: (() => void) | null = null;
  public onMediaNext: (() => void) | null = null;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';
    this.audioElement.crossOrigin = 'anonymous';

    this.setupAudioListeners();
  }

  private initAudioGraph() {
    if (this.audioCtx) return;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioCtx = new AudioContextClass();

    try {
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
    } catch {
      // already created
    }

    // Build 10-band equalizer
    this.eqFilters = EQ_FREQUENCIES.map((freq, i) => {
      const filter = this.audioCtx!.createBiquadFilter();
      if (i === 0) {
        filter.type = 'lowshelf';
      } else if (i === EQ_FREQUENCIES.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.value = 1.4;
      }
      filter.frequency.value = freq;
      filter.gain.value = 0;
      return filter;
    });

    // Volume gain node
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 0.85;

    // Analyser node for visualizer
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 128;
    this.analyserNode.smoothingTimeConstant = 0.82;

    // Chain nodes: Source -> Filter 0 -> Filter 1 -> ... -> Filter N -> Gain -> Analyser -> Destination
    if (this.sourceNode) {
      let previousNode: AudioNode = this.sourceNode;
      for (const filter of this.eqFilters) {
        previousNode.connect(filter);
        previousNode = filter;
      }
      previousNode.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);
    }
  }

  private setupAudioListeners() {
    this.audioElement.addEventListener('timeupdate', () => {
      if (this.onTimeUpdate) {
        this.onTimeUpdate(
          this.audioElement.currentTime,
          this.audioElement.duration || this.currentTrack?.duration || 0
        );
      }
      this.updateMediaSessionPosition();
    });

    this.audioElement.addEventListener('ended', () => {
      if (this.onEnded) {
        this.onEnded();
      }
    });

    this.audioElement.addEventListener('play', () => {
      if (this.onPlayStateChange) this.onPlayStateChange(true);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    });

    this.audioElement.addEventListener('pause', () => {
      if (this.onPlayStateChange) this.onPlayStateChange(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    });

    this.audioElement.addEventListener('error', () => {
      if (this.onError) {
        this.onError('Unable to decode or play audio file.');
      }
    });

    // Initialize Media Session API
    this.setupMediaSession();
  }

  private setupMediaSession() {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => {
      this.play();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      this.pause();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (this.onMediaPrev) this.onMediaPrev();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      if (this.onMediaNext) this.onMediaNext();
    });

    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const skipTime = details.seekOffset || 10;
      this.seek(Math.max(this.audioElement.currentTime - skipTime, 0));
    });

    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const skipTime = details.seekOffset || 10;
      this.seek(Math.min(this.audioElement.currentTime + skipTime, this.audioElement.duration || 0));
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        this.seek(details.seekTime);
      }
    });
  }

  private updateMediaSessionMetadata(track: Track) {
    if (!('mediaSession' in navigator)) return;

    const artwork: MediaImage[] = [];
    if (track.albumArtUrl) {
      artwork.push({
        src: track.albumArtUrl,
        sizes: '512x512',
        type: 'image/jpeg',
      });
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork,
    });
  }

  private updateMediaSessionPosition() {
    if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) return;
    try {
      const dur = this.audioElement.duration;
      if (isFinite(dur) && dur > 0) {
        navigator.mediaSession.setPositionState({
          duration: dur,
          playbackRate: this.audioElement.playbackRate,
          position: Math.min(this.audioElement.currentTime, dur),
        });
      }
    } catch {
      // Ignored for fast seek changes
    }
  }

  // Load and play track
  public async loadTrack(track: Track, autoPlay: boolean = true): Promise<void> {
    this.initAudioGraph();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    // Clean up previous URL
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }

    this.currentTrack = track;

    if (track.audioBlob) {
      this.currentObjectUrl = URL.createObjectURL(track.audioBlob);
      this.audioElement.src = this.currentObjectUrl;
    } else {
      throw new Error('Track has no audio data');
    }

    this.audioElement.load();
    this.updateMediaSessionMetadata(track);

    if (autoPlay) {
      await this.play();
    }
  }

  public async play(): Promise<void> {
    this.initAudioGraph();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    try {
      await this.audioElement.play();
    } catch (err) {
      console.warn('Audio play request failed or blocked by autoplay policy:', err);
    }
  }

  public pause(): void {
    this.audioElement.pause();
  }

  public togglePlay(): void {
    if (this.audioElement.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  public seek(seconds: number): void {
    if (isFinite(seconds)) {
      this.audioElement.currentTime = Math.max(0, Math.min(seconds, this.audioElement.duration || 9999));
    }
  }

  public seekRelative(deltaSeconds: number): void {
    this.seek(this.audioElement.currentTime + deltaSeconds);
  }

  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.audioElement.volume = clamped;
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
    }
  }

  public setPlaybackRate(rate: number): void {
    this.audioElement.playbackRate = rate;
  }

  // Equalizer control
  public setEqBand(bandIndex: number, gainDb: number): void {
    if (this.eqFilters[bandIndex] && this.audioCtx) {
      const clamped = Math.max(-12, Math.min(12, gainDb));
      this.eqFilters[bandIndex].gain.setValueAtTime(clamped, this.audioCtx.currentTime);
    }
  }

  public applyEqPreset(preset: EqualizerPreset): void {
    preset.gains.forEach((gain, i) => {
      this.setEqBand(i, gain);
    });
  }

  public getBands(): EqualizerBand[] {
    return EQ_FREQUENCIES.map((freq, i) => {
      const filter = this.eqFilters[i];
      let label = `${freq}Hz`;
      if (freq >= 1000) {
        label = `${freq / 1000}kHz`;
      }
      return {
        frequency: freq,
        label,
        gain: filter ? filter.gain.value : 0,
      };
    });
  }

  // Visualizer data
  public getFrequencyData(array: Uint8Array): void {
    if (this.analyserNode && !this.audioElement.paused) {
      this.analyserNode.getByteFrequencyData(array);
    } else {
      array.fill(0);
    }
  }

  public getWaveformData(array: Uint8Array): void {
    if (this.analyserNode && !this.audioElement.paused) {
      this.analyserNode.getByteTimeDomainData(array);
    } else {
      array.fill(128);
    }
  }

  // Satisfying Y2K mechanical click sound
  public playClickSound(enabled: boolean = true, volume: number = 0.5): void {
    if (!enabled || volume <= 0) return;

    try {
      if (!this.sfxCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.sfxCtx = new AudioContextClass();
      }

      if (this.sfxCtx.state === 'suspended') {
        this.sfxCtx.resume();
      }

      const now = this.sfxCtx.currentTime;

      // Micro transient click (two rapid resonant bursts mimicking a physical mouse/click wheel)
      const osc = this.sfxCtx.createOscillator();
      const gain = this.sfxCtx.createGain();
      const filter = this.sfxCtx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.Q.setValueAtTime(3.5, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.018);

      gain.gain.setValueAtTime(volume * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxCtx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Click audio fallback
    }
  }

  // Get current play state
  public isPlaying(): boolean {
    return !this.audioElement.paused;
  }

  public getCurrentTime(): number {
    return this.audioElement.currentTime;
  }

  public getDuration(): number {
    return this.audioElement.duration || this.currentTrack?.duration || 0;
  }

  public destroy(): void {
    this.audioElement.pause();
    this.audioElement.src = '';
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
    }
    if (this.audioCtx) {
      this.audioCtx.close();
    }
    if (this.sfxCtx) {
      this.sfxCtx.close();
    }
  }
}

// Singleton audio engine instance
export const audioEngine = new AudioEngine();
