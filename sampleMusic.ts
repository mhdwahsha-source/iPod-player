import { Track } from '../types';
import { generateRetroAlbumArt } from './metadataParser';

// Convert AudioBuffer to 16-bit PCM WAV Blob
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  // RIFF identifier
  writeString(out, pos, 'RIFF');
  pos += 4;
  out.setUint32(pos, length - 8, true);
  pos += 4;
  writeString(out, pos, 'WAVE');
  pos += 4;
  // fmt sub-chunk
  writeString(out, pos, 'fmt ');
  pos += 4;
  out.setUint32(pos, 16, true);
  pos += 4; // SubChunk1Size (16 for PCM)
  out.setUint16(pos, 1, true);
  pos += 2; // AudioFormat (1 for PCM)
  out.setUint16(pos, numOfChan, true);
  pos += 2;
  out.setUint32(pos, sampleRate, true);
  pos += 4;
  out.setUint32(pos, sampleRate * 2 * numOfChan, true);
  pos += 4; // ByteRate
  out.setUint16(pos, numOfChan * 2, true);
  pos += 2; // BlockAlign
  out.setUint16(pos, 16, true);
  pos += 2; // BitsPerSample
  // data sub-chunk
  writeString(out, pos, 'data');
  pos += 4;
  out.setUint32(pos, length - pos - 4, true);
  pos += 4;

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Synthesize a real catchy Y2K beat using OfflineAudioContext
export async function createSynthTrack(
  title: string,
  artist: string,
  album: string,
  bpm: number,
  melodyType: 'techno' | 'ambient' | 'groove',
  durationSec: number = 32
): Promise<Track> {
  const sampleRate = 44100;
  const offlineCtx = new OfflineAudioContext(2, sampleRate * durationSec, sampleRate);

  const beatSec = 60 / bpm;
  const sixteenth = beatSec / 4;

  // Master compressor and limiter
  const compressor = offlineCtx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-12, 0);
  compressor.knee.setValueAtTime(4, 0);
  compressor.ratio.setValueAtTime(6, 0);
  compressor.attack.setValueAtTime(0.005, 0);
  compressor.release.setValueAtTime(0.08, 0);
  compressor.connect(offlineCtx.destination);

  // Reverb simulation via delay
  const delay = offlineCtx.createDelay();
  delay.delayTime.setValueAtTime(beatSec * 0.75, 0);
  const delayGain = offlineCtx.createGain();
  delayGain.gain.setValueAtTime(0.25, 0);
  delay.connect(delayGain);
  delayGain.connect(compressor);
  delayGain.connect(delay);

  // Drums & Bass line generator
  const totalBeats = Math.floor(durationSec / beatSec);

  // Frequencies for notes
  const notes = {
    C3: 130.81, D3: 146.83, Eb3: 155.56, F3: 174.61, G3: 196.0, Ab3: 207.65, Bb3: 233.08,
    C4: 261.63, D4: 293.66, Eb4: 311.13, F4: 349.23, G4: 392.0, Bb4: 466.16, C5: 523.25,
    G2: 98.0, C2: 65.41, F2: 87.31, Ab2: 103.83,
  };

  const scale = [notes.C4, notes.Eb4, notes.F4, notes.G4, notes.Bb4, notes.C5, notes.G4, notes.Eb4];
  const bassNotes = [notes.C2, notes.C2, notes.Ab2, notes.F2, notes.G2];

  for (let b = 0; b < totalBeats; b++) {
    const time = b * beatSec;
    if (time >= durationSec - 1) break;

    // 1. Kick drum (every beat or 4 on the floor)
    const kickOsc = offlineCtx.createOscillator();
    const kickGain = offlineCtx.createGain();
    kickOsc.frequency.setValueAtTime(140, time);
    kickOsc.frequency.exponentialRampToValueAtTime(35, time + 0.09);
    kickGain.gain.setValueAtTime(0.9, time);
    kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
    kickOsc.connect(kickGain);
    kickGain.connect(compressor);
    kickOsc.start(time);
    kickOsc.stop(time + 0.25);

    // 2. Snare / Clap on beats 2 and 4
    if (b % 2 === 1) {
      // Noise burst for snare
      const snareDur = 0.15;
      const bufferSize = sampleRate * snareDur;
      const noiseBuffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = offlineCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const snareFilter = offlineCtx.createBiquadFilter();
      snareFilter.type = 'highpass';
      snareFilter.frequency.setValueAtTime(900, time);
      const snareGain = offlineCtx.createGain();
      snareGain.gain.setValueAtTime(0.4, time);
      snareGain.gain.exponentialRampToValueAtTime(0.001, time + snareDur);
      whiteNoise.connect(snareFilter);
      snareFilter.connect(snareGain);
      snareGain.connect(compressor);
      snareGain.connect(delay);
      whiteNoise.start(time);
      whiteNoise.stop(time + snareDur);
    }

    // 3. Hi-hats on off-beats
    for (let s = 0; s < 4; s++) {
      const hatTime = time + s * sixteenth;
      if (hatTime >= durationSec - 0.5) break;

      const hatDur = 0.05;
      const bufSize = sampleRate * hatDur;
      const nBuf = offlineCtx.createBuffer(1, bufSize, sampleRate);
      const out = nBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        out[i] = Math.random() * 2 - 1;
      }
      const hatSource = offlineCtx.createBufferSource();
      hatSource.buffer = nBuf;
      const hatFilter = offlineCtx.createBiquadFilter();
      hatFilter.type = 'highpass';
      hatFilter.frequency.setValueAtTime(6000, hatTime);
      const hatGain = offlineCtx.createGain();
      hatGain.gain.setValueAtTime(s % 2 === 1 ? 0.2 : 0.08, hatTime);
      hatGain.gain.exponentialRampToValueAtTime(0.001, hatTime + hatDur);
      hatSource.connect(hatFilter);
      hatFilter.connect(hatGain);
      hatGain.connect(compressor);
      hatSource.start(hatTime);
      hatSource.stop(hatTime + hatDur);
    }

    // 4. Bass synth
    const bassNote = bassNotes[Math.floor(b / 4) % bassNotes.length];
    const bassOsc = offlineCtx.createOscillator();
    const bassGain = offlineCtx.createGain();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(bassNote, time);
    const bassFilter = offlineCtx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(450, time);
    bassFilter.Q.setValueAtTime(4, time);
    bassGain.gain.setValueAtTime(0.35, time);
    bassGain.gain.exponentialRampToValueAtTime(0.01, time + beatSec * 0.85);
    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(compressor);
    bassOsc.start(time);
    bassOsc.stop(time + beatSec * 0.9);

    // 5. Synth arpeggio / lead melody
    for (let s = 0; s < 2; s++) {
      const leadTime = time + s * (beatSec / 2);
      if (leadTime >= durationSec - 0.5) break;

      const noteIdx = (b * 2 + s) % scale.length;
      const leadFreq = scale[noteIdx];
      const leadOsc = offlineCtx.createOscillator();
      const leadGain = offlineCtx.createGain();

      leadOsc.type = melodyType === 'ambient' ? 'sine' : 'square';
      leadOsc.frequency.setValueAtTime(leadFreq, leadTime);

      const leadFilter = offlineCtx.createBiquadFilter();
      leadFilter.type = 'lowpass';
      leadFilter.frequency.setValueAtTime(melodyType === 'ambient' ? 1200 : 2600, leadTime);

      leadGain.gain.setValueAtTime(0.18, leadTime);
      leadGain.gain.exponentialRampToValueAtTime(0.001, leadTime + beatSec * 0.45);

      leadOsc.connect(leadFilter);
      leadFilter.connect(leadGain);
      leadGain.connect(compressor);
      leadGain.connect(delay);

      leadOsc.start(leadTime);
      leadOsc.stop(leadTime + beatSec * 0.5);
    }
  }

  const renderedBuffer = await offlineCtx.startRendering();
  const wavBlob = audioBufferToWavBlob(renderedBuffer);

  const albumArtUrl = generateRetroAlbumArt(title, artist, album);

  return {
    id: `sample_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    artist,
    album,
    duration: durationSec,
    albumArtUrl,
    genre: 'Y2K Synthwave',
    trackNumber: 1,
    year: 2004,
    dateAdded: Date.now(),
    playCount: 0,
    isFavorite: false,
    mimeType: 'audio/wav',
    fileSize: wavBlob.size,
    fileName: `${title}.wav`,
    folderPath: '/Y2K_Factory_Presets',
    audioBlob: wavBlob,
    lyrics: `[00:00.00] ${title}\n[00:04.00] Artist: ${artist}\n[00:08.00] Ready to play in 128kbps stereo\n[00:16.00] Plug your headphones into the 3.5mm jack\n[00:24.00] Early 2000s digital vibes!`,
  };
}

// Generate the 3 initial sample tracks
export async function getInitialSampleTracks(): Promise<Track[]> {
  const track1 = await createSynthTrack(
    'Cyber Pulse 2004',
    'DJ NeoWave',
    'Cyber Future Vol. 1',
    134,
    'techno',
    34
  );
  const track2 = await createSynthTrack(
    'Millennium Horizon',
    'Starlight Unit',
    'Y2K Chillout Lounge',
    110,
    'ambient',
    32
  );
  const track3 = await createSynthTrack(
    'Pocket Groove Beat',
    'Byte Beat Collective',
    'Mini-Disc Classics',
    124,
    'groove',
    30
  );

  return [track1, track2, track3];
}
