import { describe, it, expect } from 'vitest';
import { normalizePalette, mergePalettes } from './merge-palette';
import type { PaletteColor } from './palette';

describe('normalizePalette', () => {
  it('scales populations to fractions of the palette total, times the given weight', () => {
    const palette: PaletteColor[] = [
      { hex: '#111111', population: 30 },
      { hex: '#222222', population: 10 },
    ];
    const normalized = normalizePalette(palette, 2);
    expect(normalized[0].population).toBeCloseTo(1.5); // 30/40 * 2
    expect(normalized[1].population).toBeCloseTo(0.5); // 10/40 * 2
  });

  it('returns the palette unchanged when the total population is zero', () => {
    const palette: PaletteColor[] = [{ hex: '#111111', population: 0 }];
    expect(normalizePalette(palette, 3)).toEqual(palette);
  });
});

describe('mergePalettes', () => {
  it('keeps a small logo palette ranked above a large, differently-colored reference photo', () => {
    // Logo: tiny image, weighted 3x after normalization.
    const logoPalette = normalizePalette(
      [
        { hex: '#32b95c', population: 8000 }, // brand green
        { hex: '#09263c', population: 4000 }, // brand navy
      ],
      3
    );
    // Reference: full-resolution photo, ~250x the logo's pixel count, unweighted.
    const referencePalette = normalizePalette(
      [
        { hex: '#d4d2ce', population: 2_000_000 }, // photo background
        { hex: '#d1b091', population: 300_000 }, // photo accent tone
      ],
      1
    );

    const merged = mergePalettes([...logoPalette, ...referencePalette]);

    expect(merged[0].hex).toBe('#32b95c');
  });

  it('sums population for colors that appear in both palettes', () => {
    const merged = mergePalettes([
      { hex: '#ff0000', population: 1 },
      { hex: '#ff0000', population: 2 },
      { hex: '#00ff00', population: 5 },
    ]);
    expect(merged).toEqual([
      { hex: '#00ff00', population: 5 },
      { hex: '#ff0000', population: 3 },
    ]);
  });
});
