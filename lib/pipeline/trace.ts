import ImageTracer, { type ImageTracerColor } from 'imagetracerjs';
import type { PixelBuffer } from './posterize';
import type { TraceFn } from './simplify';

export function extractTracePalette(pixels: PixelBuffer, maxColors: number = 16): ImageTracerColor[] {
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  const QUANTIZE_STEP = 32;
  let hasTransparent = false;

  for (let i = 0; i < pixels.data.length; i += 4) {
    const alpha = pixels.data[i + 3];
    if (alpha < 32) {
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

export const traceToSvg: TraceFn = (pixels: PixelBuffer): string => {
  const imageData = { width: pixels.width, height: pixels.height, data: pixels.data };
  const pal = extractTracePalette(pixels, 16);

  return ImageTracer.imagedataToSVG(imageData, {
    ltres: 1,
    qtres: 1,
    pathomit: 8,
    pal,
    colorquantcycles: 1,
    viewbox: true,
  });
};
