import type { PixelBuffer } from './posterize';

const TRANSPARENCY_FRACTION_THRESHOLD = 0.05;
const TRANSPARENT_ALPHA_THRESHOLD = 250;

/**
 * @imgly/background-removal replaces the input's alpha channel with its own
 * mask, and its model only looks at RGB — so a logo that's already
 * transparent (where RGB is often meaningless, e.g. (0,0,0) under alpha 0)
 * would get re-segmented from garbage color data. Detecting real, existing
 * transparency up front lets the caller skip background removal entirely
 * for those images instead of degrading them.
 */
export function hasSignificantTransparency(pixels: PixelBuffer): boolean {
  let transparentCount = 0;
  const totalPixels = pixels.data.length / 4;

  for (let i = 3; i < pixels.data.length; i += 4) {
    if (pixels.data[i] < TRANSPARENT_ALPHA_THRESHOLD) transparentCount += 1;
  }

  return transparentCount / totalPixels > TRANSPARENCY_FRACTION_THRESHOLD;
}
