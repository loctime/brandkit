import type { PixelBuffer } from '../pipeline/posterize';

export interface PaletteColor {
  hex: string;
  population: number;
}

const QUANTIZE_STEP = 32;
const NEAR_WHITE_THRESHOLD = 235;
const NEAR_BLACK_THRESHOLD = 20;
const LOW_SATURATION_THRESHOLD = 0.12;

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
 * The most-populated cluster is often a background rather than the actual
 * brand color — either literally near-white/near-black, or a low-saturation
 * gray (e.g. a JPEG-compressed "white" paper background landing around
 * #d4d2ce) that isn't extreme enough to trip a brightness-only check. Picks
 * the first cluster that is neither, falling back to palette[0] if every
 * cluster is background-like.
 */
export function pickPrimaryBrandColor(palette: PaletteColor[]): PaletteColor {
  const saturatedFirst = palette.find((color) => !isBackgroundLike(color.hex));
  return saturatedFirst ?? palette[0];
}

function isBackgroundLike(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const isNearWhite = r > NEAR_WHITE_THRESHOLD && g > NEAR_WHITE_THRESHOLD && b > NEAR_WHITE_THRESHOLD;
  const isNearBlack = r < NEAR_BLACK_THRESHOLD && g < NEAR_BLACK_THRESHOLD && b < NEAR_BLACK_THRESHOLD;
  return isNearWhite || isNearBlack || saturationOf(r, g, b) < LOW_SATURATION_THRESHOLD;
}

function saturationOf(r: number, g: number, b: number): number {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  if (max === min) return 0;

  const lightness = (max + min) / 2;
  const delta = max - min;
  return lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase();
}
