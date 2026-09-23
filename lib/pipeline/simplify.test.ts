import { describe, it, expect } from 'vitest';
import { generateSimplifiedCandidates, type TraceFn } from './simplify';
import type { PixelBuffer } from './posterize';

describe('generateSimplifiedCandidates', () => {
  it('produces 3 candidates at levels 2, 4, 8, tracing already-posterized pixels', () => {
    const input: PixelBuffer = {
      data: new Uint8ClampedArray([100, 100, 100, 255]),
      width: 1,
      height: 1,
    };

    const seenFirstChannel: number[] = [];
    const fakeTrace: TraceFn = (pixels) => {
      seenFirstChannel.push(pixels.data[0]);
      return `<svg data-levels-input="${pixels.data[0]}"/>`;
    };

    const candidates = generateSimplifiedCandidates(input, fakeTrace);

    expect(candidates.map((c) => c.levels)).toEqual([2, 4, 8]);
    expect(candidates).toHaveLength(3);
    // posterizing 100 at 2 levels must differ from posterizing at 8 levels
    expect(new Set(seenFirstChannel).size).toBeGreaterThan(1);
    expect(candidates[0].svgMarkup).toContain('data-levels-input');
  });
});
