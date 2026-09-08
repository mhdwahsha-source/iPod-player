export interface ParsedAudioMetadata {
  title: string;
  artist: string;
  album: string;
  genre?: string;
  trackNumber?: number;
  year?: number;
  duration: number;
  albumArtUrl?: string;
  lyrics?: string;
}

// Generate retro procedural album artwork for songs without embedded art
export function generateRetroAlbumArt(title: string, artist: string, album: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Seeded color based on string hash
  let hash = 0;
  const str = `${title}-${artist}-${album}`;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 50) % 360;
  const hue3 = (hue1 + 180) % 360;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 400, 400);
  grad.addColorStop(0, `hsl(${hue1}, 75%, 25%)`);
  grad.addColorStop(0.5, `hsl(${hue2}, 85%, 15%)`);
  grad.addColorStop(1, `hsl(${hue3}, 70%, 10%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 400);

  // Y2K retro geometric grid / CD rings
  ctx.strokeStyle = `hsla(${hue1}, 90%, 65%, 0.25)`;
  ctx.lineWidth = 1;
  for (let i = 20; i < 400; i += 30) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 400);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(400, i);
    ctx.stroke();
  }

  // Holographic CD Disc Graphic in center
  const centerX = 200;
  const centerY = 200;
  const radius = 130;

  const discGrad = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, radius);
  discGrad.addColorStop(0, '#222');
  discGrad.addColorStop(0.25, `hsla(${hue1}, 90%, 60%, 0.6)`);
  discGrad.addColorStop(0.5, `hsla(${(hue1 + 90) % 360}, 95%, 70%, 0.7)`);
  discGrad.addColorStop(0.75, `hsla(${hue2}, 90%, 65%, 0.6)`);
  discGrad.addColorStop(1, '#111');

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = discGrad;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = `hsla(${hue1}, 100%, 80%, 0.8)`;
  ctx.stroke();

  // CD Inner Hole
  ctx.beginPath();
  ctx.arc(centerX, centerY, 38, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0c';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.stroke();

  // CD Spindle plastic ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Retro Glossy Glass Highlight diagonal
  const glossGrad = ctx.createLinearGradient(0, 0, 400, 300);
  glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  glossGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)');
  glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glossGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(400, 0);
  ctx.lineTo(400, 180);
  ctx.lineTo(0, 300);
  ctx.closePath();
  ctx.fill();

  // Y2K Retro typography on CD
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((title || 'AUDIO TRACK').toUpperCase().slice(0, 24), centerX, 365);

  ctx.fillStyle = `hsl(${hue1}, 90%, 75%)`;
  ctx.font = '12px monospace';
  ctx.fillText((artist || 'UNKNOWN ARTIST').toUpperCase().slice(0, 30), centerX, 385);

  // Retro Badge "COMPACT DISC DIGITAL AUDIO" vibe
  ctx.font = '9px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('DIGITAL AUDIO / STEREO', centerX, 35);

  return canvas.toDataURL('image/jpeg', 0.85);
}

// Clean filename to extract artist / title if tags are missing
export function parseFilenameFallback(filename: string): { title: string; artist: string; trackNumber?: number } {
  const cleanName = filename.replace(/\.[^/.]+$/, '').trim();
  let trackNumber: number | undefined;

  // Patterns like: "01 - Artist - Title" or "01. Title" or "Artist - Title"
  const trackMatch = cleanName.match(/^(\d{1,3})[\s._-]+(.+)$/);
  let remainder = cleanName;
  if (trackMatch) {
    trackNumber = parseInt(trackMatch[1], 10);
    remainder = trackMatch[2].trim();
  }

  if (remainder.includes(' - ')) {
    const parts = remainder.split(' - ');
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim(),
      trackNumber,
    };
  }

  if (remainder.includes('_')) {
    const parts = remainder.split('_').filter(Boolean);
    if (parts.length >= 2) {
      return {
        artist: parts[0].trim(),
        title: parts.slice(1).join(' ').trim(),
        trackNumber,
      };
    }
  }

  return {
    title: remainder || 'Unknown Track',
    artist: 'Unknown Artist',
    trackNumber,
  };
}

// Decode ID3 string with encoding byte
function decodeText(bytes: Uint8Array, encodingByte: number): string {
  if (bytes.length === 0) return '';
  try {
    if (encodingByte === 0) {
      // ISO-8859-1
      let str = '';
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0) break;
        str += String.fromCharCode(bytes[i]);
      }
      return str.trim();
    } else if (encodingByte === 1 || encodingByte === 2) {
      // UTF-16 with BOM or without
      const decoder = new TextDecoder('utf-16');
      return decoder.decode(bytes).replace(/\0/g, '').trim();
    } else if (encodingByte === 3) {
      // UTF-8
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(bytes).replace(/\0/g, '').trim();
    } else {
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(bytes).replace(/\0/g, '').trim();
    }
  } catch {
    return '';
  }
}

// Parse syncsafe integer
function parseSyncsafe(b: Uint8Array, offset: number): number {
  return (
    ((b[offset] & 0x7f) << 21) |
    ((b[offset + 1] & 0x7f) << 14) |
    ((b[offset + 2] & 0x7f) << 7) |
    (b[offset + 3] & 0x7f)
  );
}

// Parse standard 32-bit big endian int
function parseUint32(b: Uint8Array, offset: number): number {
  return (
    (b[offset] << 24) |
    (b[offset + 1] << 16) |
    (b[offset + 2] << 8) |
    b[offset + 3]
  ) >>> 0;
}

// Parse ID3v2 header and frames
function parseID3v2(buffer: ArrayBuffer): Partial<ParsedAudioMetadata> {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 10) return {};

  // Check for 'ID3' magic
  if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) {
    return {};
  }

  const version = bytes[3]; // 3 for ID3v2.3, 4 for ID3v2.4
  const tagSize = parseSyncsafe(bytes, 6);
  const totalLength = Math.min(bytes.length, 10 + tagSize);

  let offset = 10;
  const result: Partial<ParsedAudioMetadata> = {};

  while (offset + 10 <= totalLength) {
    // Frame ID
    const frameId = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3]
    );

    if (frameId.charCodeAt(0) === 0 || !/^[A-Z0-9]{4}$/.test(frameId)) {
      break;
    }

    const frameSize = version === 4
      ? parseSyncsafe(bytes, offset + 4)
      : parseUint32(bytes, offset + 4);

    if (frameSize <= 0 || offset + 10 + frameSize > totalLength) {
      break;
    }

    const frameData = bytes.subarray(offset + 10, offset + 10 + frameSize);

    if (frameData.length > 1) {
      const encoding = frameData[0];
      const contentBytes = frameData.subarray(1);

      if (frameId === 'TIT2') {
        result.title = decodeText(contentBytes, encoding);
      } else if (frameId === 'TPE1') {
        result.artist = decodeText(contentBytes, encoding);
      } else if (frameId === 'TALB') {
        result.album = decodeText(contentBytes, encoding);
      } else if (frameId === 'TCON') {
        result.genre = decodeText(contentBytes, encoding).replace(/^\(\d+\)/, '').trim();
      } else if (frameId === 'TRCK') {
        const trkStr = decodeText(contentBytes, encoding);
        const trkNum = parseInt(trkStr.split('/')[0], 10);
        if (!isNaN(trkNum)) result.trackNumber = trkNum;
      } else if (frameId === 'TYER' || frameId === 'TDRC') {
        const yearStr = decodeText(contentBytes, encoding);
        const y = parseInt(yearStr.slice(0, 4), 10);
        if (!isNaN(y)) result.year = y;
      } else if (frameId === 'USLT') {
        // Unsynchronized lyrics
        // Format: encoding (1 byte) + language (3 bytes) + content descriptor + null + lyric text
        if (contentBytes.length > 4) {
          result.lyrics = decodeText(contentBytes.subarray(4), encoding);
        }
      } else if (frameId === 'APIC' && !result.albumArtUrl) {
        // Attached Picture
        try {
          let pOffset = 0;
          const picEncoding = contentBytes[pOffset++];
          // Read MIME type
          let mime = '';
          while (pOffset < contentBytes.length && contentBytes[pOffset] !== 0) {
            mime += String.fromCharCode(contentBytes[pOffset++]);
          }
          pOffset++; // Skip null byte
          const picType = contentBytes[pOffset++]; // 3 = front cover

          // Description (null-terminated)
          if (picEncoding === 1 || picEncoding === 2) {
            while (pOffset + 1 < contentBytes.length && !(contentBytes[pOffset] === 0 && contentBytes[pOffset + 1] === 0)) {
              pOffset += 2;
            }
            pOffset += 2;
          } else {
            while (pOffset < contentBytes.length && contentBytes[pOffset] !== 0) {
              pOffset++;
            }
            pOffset++;
          }

          if (pOffset < contentBytes.length) {
            const imgData = contentBytes.subarray(pOffset);
            const blob = new Blob([imgData], { type: mime || 'image/jpeg' });
            result.albumArtUrl = URL.createObjectURL(blob);
          }
        } catch {
          // Ignore parsing error on corrupt picture frame
        }
      }
    }

    offset += 10 + frameSize;
  }

  return result;
}

// Parse MP4 / M4A metadata atoms
function parseMP4(buffer: ArrayBuffer): Partial<ParsedAudioMetadata> {
  const bytes = new Uint8Array(buffer);
  const result: Partial<ParsedAudioMetadata> = {};

  try {
    const view = new DataView(buffer);
    let offset = 0;

    // Helper to find atom by 4-letter tag
    function findSubAtom(start: number, end: number, target: string): number {
      let cur = start;
      while (cur + 8 <= end) {
        const size = view.getUint32(cur);
        const type = String.fromCharCode(
          bytes[cur + 4],
          bytes[cur + 5],
          bytes[cur + 6],
          bytes[cur + 7]
        );
        if (type === target) return cur;
        if (size <= 0) break;
        cur += size;
      }
      return -1;
    }

    // Look for moov -> udta -> meta -> ilst
    const moovPos = findSubAtom(0, bytes.length, 'moov');
    if (moovPos === -1) return {};
    const moovSize = view.getUint32(moovPos);

    const udtaPos = findSubAtom(moovPos + 8, moovPos + moovSize, 'udta');
    if (udtaPos === -1) return {};
    const udtaSize = view.getUint32(udtaPos);

    const metaPos = findSubAtom(udtaPos + 8, udtaPos + udtaSize, 'meta');
    if (metaPos === -1) return {};
    const metaSize = view.getUint32(metaPos);

    // In meta atom, there's often 4 bytes version/flags before children
    const ilstPos = findSubAtom(metaPos + 12, metaPos + metaSize, 'ilst');
    if (ilstPos === -1) return {};
    const ilstSize = view.getUint32(ilstPos);

    let cur = ilstPos + 8;
    const ilstEnd = ilstPos + ilstSize;

    while (cur + 8 < ilstEnd) {
      const atomSize = view.getUint32(cur);
      if (atomSize <= 8) break;

      const tag = String.fromCharCode(
        bytes[cur + 4],
        bytes[cur + 5],
        bytes[cur + 6],
        bytes[cur + 7]
      );

      // Child data atom inside tag
      const dataPos = cur + 8;
      if (dataPos + 8 < cur + atomSize) {
        const dataTag = String.fromCharCode(
          bytes[dataPos + 4],
          bytes[dataPos + 5],
          bytes[dataPos + 6],
          bytes[dataPos + 7]
        );
        if (dataTag === 'data') {
          const type = view.getUint32(dataPos + 8); // 1 = UTF-8, 13 = JPEG, 14 = PNG
          const contentStart = dataPos + 16;
          const contentLength = view.getUint32(dataPos) - 16;

          if (contentLength > 0 && contentStart + contentLength <= bytes.length) {
            const content = bytes.subarray(contentStart, contentStart + contentLength);

            if (tag === '\xa9nam') {
              result.title = new TextDecoder('utf-8').decode(content).trim();
            } else if (tag === '\xa9ART') {
              result.artist = new TextDecoder('utf-8').decode(content).trim();
            } else if (tag === '\xa9alb') {
              result.album = new TextDecoder('utf-8').decode(content).trim();
            } else if (tag === '\xa9gen') {
              result.genre = new TextDecoder('utf-8').decode(content).trim();
            } else if (tag === 'trkn' && content.length >= 4) {
              result.trackNumber = view.getUint16(contentStart + 2);
            } else if (tag === 'covr' && !result.albumArtUrl) {
              const mime = type === 14 ? 'image/png' : 'image/jpeg';
              const blob = new Blob([content], { type: mime });
              result.albumArtUrl = URL.createObjectURL(blob);
            }
          }
        }
      }

      cur += atomSize;
    }
  } catch {
    // Return partial results if MP4 structure is atypical
  }

  return result;
}

// Get accurate duration using temporary Audio element
export function getAudioDuration(fileBlob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(fileBlob);
    audio.preload = 'metadata';

    const cleanUp = () => {
      URL.revokeObjectURL(url);
      audio.src = '';
    };

    audio.onloadedmetadata = () => {
      const dur = isFinite(audio.duration) ? audio.duration : 0;
      cleanUp();
      resolve(dur);
    };

    audio.onerror = () => {
      cleanUp();
      resolve(0);
    };

    // Timeout fallback if metadata never loads
    setTimeout(() => {
      cleanUp();
      resolve(0);
    }, 4000);

    audio.src = url;
  });
}

// Main parser function for any supported audio file
export async function parseAudioFile(file: File): Promise<ParsedAudioMetadata> {
  const fallback = parseFilenameFallback(file.name);
  let metadata: Partial<ParsedAudioMetadata> = {};

  try {
    // Read first 512KB for metadata header (fast & efficient)
    const headerSlice = await file.slice(0, Math.min(file.size, 512 * 1024)).arrayBuffer();

    const isMp3 = file.name.toLowerCase().endsWith('.mp3') || file.type.includes('mpeg') || file.type.includes('mp3');
    const isMp4 = file.name.toLowerCase().endsWith('.m4a') || file.name.toLowerCase().endsWith('.aac') || file.type.includes('mp4');

    if (isMp4) {
      metadata = parseMP4(headerSlice);
    } else {
      metadata = parseID3v2(headerSlice);
    }
  } catch (err) {
    console.warn('Metadata parsing warning:', err);
  }

  // Get duration
  const duration = await getAudioDuration(file);

  const title = (metadata.title && metadata.title.trim()) || fallback.title;
  const artist = (metadata.artist && metadata.artist.trim()) || fallback.artist;
  const album = (metadata.album && metadata.album.trim()) || 'Single';
  const trackNumber = metadata.trackNumber || fallback.trackNumber || 1;

  // If no album art was extracted, generate an authentic retro CD art
  const albumArtUrl = metadata.albumArtUrl || generateRetroAlbumArt(title, artist, album);

  return {
    title,
    artist,
    album,
    genre: metadata.genre || 'Y2K Hits',
    trackNumber,
    year: metadata.year || 2004,
    duration,
    albumArtUrl,
    lyrics: metadata.lyrics,
  };
}
