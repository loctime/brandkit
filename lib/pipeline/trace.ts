import ImageTracer, { type ImageTracerColor } from 'imagetracerjs';
import type { PixelBuffer } from './posterize';
import type { TraceFn } from './simplify';

// @imgly/background-removal doesn't produce a hard alpha=0/255 cutoff at the
// cutout edge — it leaves a soft, feathered band of semi-transparent pixels
// (often near-white background bleeding through at low alpha). Treating
// anything short of "solidly opaque" as background keeps that residue out of
// the traced palette; a lower cutoff lets it through as if it were a real
// foreground color, which imagetracerjs then draws as a visible white smear.
const FOREGROUND_ALPHA_THRESHOLD = 200;

export function extractTracePalette(pixels: PixelBuffer, maxColors: number = 16): ImageTracerColor[] {
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  const QUANTIZE_STEP = 32;
  let hasTransparent = false;

  for (let i = 0; i < pixels.data.length; i += 4) {
    const alpha = pixels.data[i + 3];
    if (alpha < FOREGROUND_ALPHA_THRESHOLD) {
      hasTransparent = true;
      continue;
    }

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
  const pal: ImageTracerColor[] = [];

  if (hasTransparent) {
    pal.push({ r: 0, g: 0, b: 0, a: 0 });
  }

  if (sorted.length === 0) {
    pal.push({ r: 0, g: 0, b: 0, a: 255 });
    return pal;
  }

  for (const bucket of sorted.slice(0, maxColors)) {
    pal.push({
      r: Math.round(bucket.r / bucket.count),
      g: Math.round(bucket.g / bucket.count),
      b: Math.round(bucket.b / bucket.count),
      a: 255,
    });
  }

  return pal;
}

/**
 * Excluding a pixel from extractTracePalette's own averages isn't enough on
 * its own: imagetracerjs does its own nearest-palette-color match against
 * the RAW source pixels, by RGB, and doesn't meaningfully weigh how
 * transparent the source pixel actually was. Once any legitimate opaque
 * near-white color exists in the palette (e.g. a white part of the real
 * logo), a below-threshold near-white residue pixel gets matched to THAT
 * entry and rendered fully opaque — the palette can look correct while the
 * traced SVG still isn't. Zeroing sub-threshold pixels in the actual source
 * buffer (not just skipping them when building the palette) removes the
 * ambiguity at its root: there is no non-transparent color left for them to
 * be mistaken for.
 */
function stripLowAlphaPixels(pixels: PixelBuffer, threshold: number): PixelBuffer {
  const cleaned = new Uint8ClampedArray(pixels.data.length);
  cleaned.set(pixels.data);

  for (let i = 0; i < cleaned.length; i += 4) {
    if (cleaned[i + 3] < threshold) {
      cleaned[i] = 0;
      cleaned[i + 1] = 0;
      cleaned[i + 2] = 0;
      cleaned[i + 3] = 0;
    }
  }

  return { data: cleaned, width: pixels.width, height: pixels.height };
}

export const traceToSvg: TraceFn = (pixels: PixelBuffer): string => {
  const cleaned = stripLowAlphaPixels(pixels, FOREGROUND_ALPHA_THRESHOLD);
  const imageData = { width: cleaned.width, height: cleaned.height, data: cleaned.data };
  const pal = extractTracePalette(cleaned, 16);

  return ImageTracer.imagedataToSVG(imageData, {
    ltres: 1,
    qtres: 1,
    pathomit: 8,
    pal,
    colorquantcycles: 1,
    viewbox: true,
  });
};
