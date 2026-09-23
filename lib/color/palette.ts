import type { PixelBuffer } from '../pipeline/posterize';

export interface PaletteColor {
  hex: string;
  population: number;
}

const QUANTIZE_STEP = 32;
const NEAR_WHITE_THRESHOLD = 235;
const NEAR_BLACK_THRESHOLD = 20;

export function extractPalette(pixels: PixelBuffer, maxColors: number = 6): PaletteColor[] {
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();

  for (let i = 0; i < pixels.data.length; i += 4) {
    const alpha = pixels.data[i + 3];
    if (alpha < 16) continue;

    const r = pixels.data[i];
    const g = pixels.data[i + 1];
    const b = pixels.data[i + 2];
    const key = `${Math.floor(r / QUANTIZE_STEP)}-${Math.floor(g / QUANTIZE_STEP)}-${Math.floor(b / QUANTIZE_STEP)}`;

    const bucket = buckets.get(key);
    if (bucket) {
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.count += 1;
    } else {
      buckets.set(key, { r, g, b, count: 1 });
    }
  }

  const sorted = Array.from(buckets.values()).sort((a, b) => b.count - a.count);

  return sorted.slice(0, maxColors).map((bucket) => {
    const r = Math.round(bucket.r / bucket.count);
    const g = Math.round(bucket.g / bucket.count);
    const b = Math.round(bucket.b / bucket.count);
    return { hex: rgbToHex(r, g, b), population: bucket.count };
  });
}

/**
 * The most-populated cluster is often a near-white or near-black background
 * rather than the actual brand color. Picks the first cluster that isn't
 * near-white/near-black, falling back to palette[0] if every cluster is.
 */
export function pickPrimaryBrandColor(palette: PaletteColor[]): PaletteColor {
  const saturatedFirst = palette.find((color) => !isNearAchromaticExtreme(color.hex));
  return saturatedFirst ?? palette[0];
}

function isNearAchromaticExtreme(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const isNearWhite = r > NEAR_WHITE_THRESHOLD && g > NEAR_WHITE_THRESHOLD && b > NEAR_WHITE_THRESHOLD;
  const isNearBlack = r < NEAR_BLACK_THRESHOLD && g < NEAR_BLACK_THRESHOLD && b < NEAR_BLACK_THRESHOLD;
  return isNearWhite || isNearBlack;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase();
}
