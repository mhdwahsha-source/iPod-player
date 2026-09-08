export interface PresetWallpaper {
  id: string;
  name: string;
  description: string;
  category: string;
  dataUrl: string;
  thumbnailColor: string;
}

// Procedural SVG-based high-resolution Y2K retro wallpapers
export const PRESET_WALLPAPERS: PresetWallpaper[] = [
  {
    id: 'cyber-matrix',
    name: 'Cyber Matrix Grid',
    description: 'Neon cyan & emerald cybernetic grid pattern',
    category: 'Cyber',
    thumbnailColor: '#052e16',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><radialGradient id="bg" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="%23064e3b"/><stop offset="60%" stop-color="%23022c22"/><stop offset="100%" stop-color="%2301130e"/></radialGradient><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="%2310b981" stroke-width="1" stroke-opacity="0.25"/></pattern></defs><rect width="100%" height="100%" fill="url(%23bg)"/><rect width="100%" height="100%" fill="url(%23grid)"/><circle cx="600" cy="400" r="280" fill="%2306b6d4" opacity="0.08"/><circle cx="600" cy="400" r="180" fill="none" stroke="%2334d399" stroke-width="2" opacity="0.3"/><circle cx="600" cy="400" r="320" fill="none" stroke="%2306b6d4" stroke-width="1" stroke-dasharray="8 8" opacity="0.4"/></svg>`,
  },
  {
    id: 'y2k-bliss-sky',
    name: 'Millennium Blue Sky',
    description: 'Classic early-2000s desktop azure sky & fluffy clouds',
    category: 'Retro OS',
    thumbnailColor: '#0284c7',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%230284c7"/><stop offset="45%" stop-color="%2338bdf8"/><stop offset="75%" stop-color="%237dd3fc"/><stop offset="100%" stop-color="%23bae6fd"/></linearGradient><radialGradient id="cloud" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23ffffff" stop-opacity="0.85"/><stop offset="100%" stop-color="%23ffffff" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(%23sky)"/><ellipse cx="350" cy="320" rx="220" ry="80" fill="url(%23cloud)"/><ellipse cx="450" cy="280" rx="180" ry="90" fill="url(%23cloud)"/><ellipse cx="850" cy="220" rx="260" ry="85" fill="url(%23cloud)"/><ellipse cx="980" cy="260" rx="190" ry="70" fill="url(%23cloud)"/></svg>`,
  },
  {
    id: 'synthwave-sunset',
    name: 'Synthwave 2004',
    description: 'Neon magenta horizon with retro wireframe perspective',
    category: 'Synthwave',
    thumbnailColor: '#581c87',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="sky2" x1="0%" y1="0%" x2="0%" y2="60%"><stop offset="0%" stop-color="%230f0c29"/><stop offset="50%" stop-color="%23302b63"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient><linearGradient id="sun" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23fde047"/><stop offset="100%" stop-color="%23f43f5e"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23sky2)"/><circle cx="600" cy="460" r="160" fill="url(%23sun)"/><path d="M0 480 L1200 480 L1200 800 L0 800 Z" fill="%23110e2e"/><line x1="600" y1="480" x2="0" y2="800" stroke="%23ec4899" stroke-width="2" opacity="0.6"/><line x1="600" y1="480" x2="300" y2="800" stroke="%23ec4899" stroke-width="2" opacity="0.6"/><line x1="600" y1="480" x2="600" y2="800" stroke="%23ec4899" stroke-width="2" opacity="0.6"/><line x1="600" y1="480" x2="900" y2="800" stroke="%23ec4899" stroke-width="2" opacity="0.6"/><line x1="600" y1="480" x2="1200" y2="800" stroke="%23ec4899" stroke-width="2" opacity="0.6"/><line x1="0" y1="520" x2="1200" y2="520" stroke="%2306b6d4" stroke-width="1.5" opacity="0.5"/><line x1="0" y1="580" x2="1200" y2="580" stroke="%2306b6d4" stroke-width="1.5" opacity="0.5"/><line x1="0" y1="660" x2="1200" y2="660" stroke="%2306b6d4" stroke-width="2" opacity="0.5"/><line x1="0" y1="760" x2="1200" y2="760" stroke="%2306b6d4" stroke-width="2.5" opacity="0.6"/></svg>`,
  },
  {
    id: 'liquid-chrome',
    name: 'Liquid Chrome Y2K',
    description: 'Futuristic brushed metallic ripples and silver sheen',
    category: 'Chrome',
    thumbnailColor: '#334155',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="ch1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e293b"/><stop offset="25%" stop-color="%2364748b"/><stop offset="50%" stop-color="%23cbd5e1"/><stop offset="75%" stop-color="%23475569"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><linearGradient id="ch2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%2394a3b8" stop-opacity="0.6"/><stop offset="50%" stop-color="%23ffffff" stop-opacity="0.3"/><stop offset="100%" stop-color="%230f172a" stop-opacity="0.8"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23ch1)"/><path d="M 0,200 Q 300,50 600,250 T 1200,180 L 1200,800 L 0,800 Z" fill="url(%23ch2)"/><path d="M 0,400 Q 400,250 800,450 T 1200,380 L 1200,800 L 0,800 Z" fill="%230f172a" opacity="0.45"/><circle cx="850" cy="200" r="120" fill="%23ffffff" opacity="0.15" filter="blur(20px)"/></svg>`,
  },
  {
    id: 'deep-space-purple',
    name: 'Cosmic Nebula',
    description: 'Deep ultraviolet nebula with stardust constellations',
    category: 'Cosmic',
    thumbnailColor: '#2e1065',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><radialGradient id="neb1" cx="30%" cy="30%" r="50%"><stop offset="0%" stop-color="%239333ea" stop-opacity="0.5"/><stop offset="100%" stop-color="%23000000" stop-opacity="0"/></radialGradient><radialGradient id="neb2" cx="70%" cy="60%" r="60%"><stop offset="0%" stop-color="%233b82f6" stop-opacity="0.45"/><stop offset="100%" stop-color="%23000000" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="%23070414"/><rect width="100%" height="100%" fill="url(%23neb1)"/><rect width="100%" height="100%" fill="url(%23neb2)"/><circle cx="150" cy="120" r="1.5" fill="%23ffffff" opacity="0.9"/><circle cx="340" cy="90" r="2" fill="%23ffffff" opacity="0.8"/><circle cx="620" cy="210" r="1.5" fill="%23ffffff" opacity="0.7"/><circle cx="850" cy="140" r="2" fill="%23ffffff" opacity="0.9"/><circle cx="980" cy="300" r="1.5" fill="%23ffffff" opacity="0.6"/><circle cx="220" cy="450" r="2" fill="%23ffffff" opacity="0.8"/><circle cx="480" cy="580" r="1.5" fill="%23ffffff" opacity="0.7"/><circle cx="780" cy="620" r="2" fill="%23ffffff" opacity="0.85"/><circle cx="1050" cy="520" r="1.5" fill="%23ffffff" opacity="0.9"/></svg>`,
  },
  {
    id: 'stealth-carbon',
    name: 'Stealth Carbon Fiber',
    description: 'Modern tactile dark weave pattern for high contrast',
    category: 'Minimal',
    thumbnailColor: '#18181b',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><defs><pattern id="carbon" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="%23111315"/><rect width="6" height="6" fill="%231a1d20"/><rect x="6" y="6" width="6" height="6" fill="%231a1d20"/><path d="M0 0h6v6H0z" fill="%2322262b" opacity="0.4"/></pattern></defs><rect width="100%" height="100%" fill="url(%23carbon)"/></svg>`,
  },
];

/**
 * Convert a user-uploaded File into a base64 Data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Basic format validation
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    // Limit size if needed (e.g. 15MB)
    if (file.size > 15 * 1024 * 1024) {
      reject(new Error('Image file is too large (max 15MB)'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image data'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
