import { describe, it, expect } from 'vitest';
import { extractPalette, pickPrimaryBrandColor } from './palette';
import type { PixelBuffer } from '../pipeline/posterize';

function bufferFromPixels(pixels: number[][]): PixelBuffer {
  const data = new Uint8ClampedArray(pixels.length * 4);
  pixels.forEach(([r, g, b, a], i) => {
    data.set([r, g, b, a], i * 4);
  });
  return { data, width: pixels.length, height: 1 };
}

describe('extractPalette', () => {
  it('returns the dominant color first', () => {
    const buffer = bufferFromPixels([
      [255, 0, 0, 255],
      [255, 0, 0, 255],
      [255, 0, 0, 255],
      [0, 0, 255, 255],
    ]);
    const palette = extractPalette(buffer);
    expect(palette[0].hex).toBe('#ff0000');
    expect(palette[0].population).toBe(3);
  });

  it('ignores near-transparent pixels', () => {
    const buffer = bufferFromPixels([
      [255, 0, 0, 255],
      [10, 200, 30, 0],
    ]);
    const palette = extractPalette(buffer);
    expect(palette).toHaveLength(1);
    expect(palette[0].hex).toBe('#ff0000');
  });

  it('prefers a saturated cluster over a larger near-white background cluster', () => {
    const pixels: number[][] = [];
    for (let i = 0; i < 20; i++) pixels.push([250, 250, 248, 255]); // near-white canvas
    for (let i = 0; i < 5; i++) pixels.push([220, 30, 40, 255]); // brand red logo
    const buffer = bufferFromPixels(pixels);
    const palette = extractPalette(buffer);
    const primary = pickPrimaryBrandColor(palette);
    expect(primary.hex).toBe('#dc1e28');
  });

  it('prefers a saturated cluster over a low-saturation gray that is not literally near-white', () => {
    // A compressed/anti-aliased "white" paper background often lands at
    // something like #d4d2ce, not pure white — low saturation, but each
    // channel stays under the near-white brightness threshold.
    const pixels: number[][] = [];
    for (let i = 0; i < 30; i++) pixels.push([212, 210, 206, 255]); // low-saturation gray background
    for (let i = 0; i < 5; i++) pixels.push([50, 185, 92, 255]); // brand green logo
    const buffer = bufferFromPixels(pixels);
    const palette = extractPalette(buffer);
    const primary = pickPrimaryBrandColor(palette);
    expect(primary.hex).toBe('#32b95c');
  });
});
