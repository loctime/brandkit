import { describe, it, expect } from 'vitest';
import { buildColorVariant } from './variants';

const svg = '<svg><path fill="#123abc" d="M0 0"/><path fill="none" d="M1 1"/></svg>';

describe('buildColorVariant', () => {
  it('returns the markup unchanged for full-color', () => {
    expect(buildColorVariant(svg, 'full-color')).toBe(svg);
  });

  it('recolors fills to black, leaving fill="none" untouched', () => {
    const result = buildColorVariant(svg, 'black');
    expect(result).toContain('fill="#000000"');
    expect(result).toContain('fill="none"');
  });

  it('recolors fills to white', () => {
    const result = buildColorVariant(svg, 'white');
    expect(result).toContain('fill="#ffffff"');
  });

  it('recolors fills to the given monochrome hex', () => {
    const result = buildColorVariant(svg, 'monochrome', '#ff7a00');
    expect(result).toContain('fill="#ff7a00"');
  });

  it('adds a grayscale filter to the svg root', () => {
    const result = buildColorVariant(svg, 'grayscale');
    expect(result).toContain('feColorMatrix');
    expect(result).toMatch(/<svg[^>]*filter="url\(#brandkit-grayscale\)"/);
  });
});
