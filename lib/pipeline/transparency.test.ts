import { describe, it, expect } from 'vitest';
import { hasSignificantTransparency } from './transparency';
import type { PixelBuffer } from './posterize';

function bufferFromAlphas(alphas: number[]): PixelBuffer {
  const data = new Uint8ClampedArray(alphas.length * 4);
  alphas.forEach((a, i) => {
    data.set([10, 20, 30, a], i * 4);
  });
  return { data, width: alphas.length, height: 1 };
}

describe('hasSignificantTransparency', () => {
  it('returns false for a fully opaque image', () => {
    const pixels = bufferFromAlphas([255, 255, 255, 255]);
    expect(hasSignificantTransparency(pixels)).toBe(false);
  });

  it('returns true when a large share of pixels are transparent', () => {
    const pixels = bufferFromAlphas([0, 0, 0, 0, 255, 255, 255, 255, 255, 255]); // 40% transparent
    expect(hasSignificantTransparency(pixels)).toBe(true);
  });

  it('returns false when only a negligible share of pixels are transparent (anti-aliased edge noise)', () => {
    const alphas = new Array(100).fill(255);
    alphas[0] = 0;
    const pixels = bufferFromAlphas(alphas); // 1% transparent
    expect(hasSignificantTransparency(pixels)).toBe(false);
  });
});
