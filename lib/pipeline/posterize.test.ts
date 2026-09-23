import { describe, it, expect } from 'vitest';
import { posterize, type PixelBuffer } from './posterize';

function makeBuffer(rgba: number[]): PixelBuffer {
  return { data: new Uint8ClampedArray(rgba), width: 1, height: 1 };
}

describe('posterize', () => {
  it('snaps a mid-gray pixel to black or white at 2 levels', () => {
    const input = makeBuffer([100, 100, 100, 255]);
    const output = posterize(input, 2);
    expect([0, 255]).toContain(output.data[0]);
    expect([0, 255]).toContain(output.data[1]);
    expect([0, 255]).toContain(output.data[2]);
  });

  it('preserves alpha untouched', () => {
    const input = makeBuffer([10, 20, 30, 128]);
    const output = posterize(input, 4);
    expect(output.data[3]).toBe(128);
  });

  it('rejects levels below 2', () => {
    const input = makeBuffer([10, 20, 30, 255]);
    expect(() => posterize(input, 1)).toThrow();
  });
});
