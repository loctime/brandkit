import { posterize, type PixelBuffer } from './posterize';

export interface SimplifiedCandidate {
  levels: number;
  svgMarkup: string;
}

export type TraceFn = (pixels: PixelBuffer) => string;

const SIMPLIFICATION_LEVELS = [2, 4, 8];

export function generateSimplifiedCandidates(
  pixels: PixelBuffer,
  trace: TraceFn
): SimplifiedCandidate[] {
  return SIMPLIFICATION_LEVELS.map((levels) => ({
    levels,
    svgMarkup: trace(posterize(pixels, levels)),
  }));
}
