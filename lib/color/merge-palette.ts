import type { PaletteColor } from './palette';

/**
 * Rescales a palette's populations to fractions of that palette's own total,
 * times `weight`. Without this, merging a small logo's raw pixel counts with
 * a full-resolution reference photo's raw pixel counts lets the photo's
 * background color dominate purely because photos have vastly more pixels
 * than a small logo file — not because it's actually more relevant.
 * Normalizing first makes "the logo's dominant color" and "a reference
 * photo's dominant color" comparable regardless of source resolution.
 */
export function normalizePalette(palette: PaletteColor[], weight: number): PaletteColor[] {
  const total = palette.reduce((sum, color) => sum + color.population, 0);
  if (total === 0) return palette;
  return palette.map((color) => ({ hex: color.hex, population: (color.population / total) * weight }));
}

export function mergePalettes(colors: PaletteColor[]): PaletteColor[] {
  const byHex = new Map<string, number>();
  for (const color of colors) {
    byHex.set(color.hex, (byHex.get(color.hex) ?? 0) + color.population);
  }
  return Array.from(byHex.entries())
    .map(([hex, population]) => ({ hex, population }))
    .sort((a, b) => b.population - a.population);
}
