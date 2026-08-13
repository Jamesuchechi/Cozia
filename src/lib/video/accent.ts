/**
 * Real-Time Canvas Color Extraction Engine
 * Extracts dominant accent color & hue from video artwork thumbnails using HTML5 Canvas.
 * Dynamically injects CSS variables (--accent-hue, --ambient-glow) to produce YouTube/Apple Music ambient glow visuals.
 */

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export async function extractDominantHue(imageUrl: string): Promise<HslColor | null> {
  if (!imageUrl) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);

        const imageData = ctx.getImageData(0, 0, 50, 50).data;
        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        let count = 0;

        for (let i = 0; i < imageData.length; i += 4) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          if (a < 128) continue; // Ignore transparent pixels

          // Filter out low-vibrancy grayscale / black / white colors
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          if (max - min < 15 || max < 25 || min > 230) continue;

          totalR += r;
          totalG += g;
          totalB += b;
          count++;
        }

        if (count === 0) {
          resolve(null);
          return;
        }

        const avgR = Math.round(totalR / count);
        const avgG = Math.round(totalG / count);
        const avgB = Math.round(totalB / count);

        const hsl = rgbToHsl(avgR, avgG, avgB);
        resolve(hsl);
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
  });
}

export function applyAmbientHue(hsl: HslColor | null): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  if (!hsl) {
    root.style.setProperty('--accent-hue', '220'); // Default blue-indigo hue
    root.style.setProperty('--ambient-glow', 'oklch(60% 0.18 220 / 0.25)');
    return;
  }

  root.style.setProperty('--accent-hue', `${hsl.h}`);
  root.style.setProperty(
    '--ambient-glow',
    `oklch(65% 0.22 ${hsl.h} / 0.35)`
  );
  root.style.setProperty(
    '--ambient-bg',
    `oklch(20% 0.08 ${hsl.h} / 0.15)`
  );
}

function rgbToHsl(r: number, g: number, b: number): HslColor {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
