import type { PaletteColor } from './palette';
import { pickPrimaryBrandColor } from './palette';
import type { ComplexityResult } from '../svg/complexity';

export type PersonalityCategory =
  | 'geometric-modern'
  | 'classic-serif'
  | 'friendly-rounded'
  | 'technical-industrial'
  | 'bold-display';

export interface FontPairing {
  category: PersonalityCategory;
  heading: string;
  body: string;
}

const FONT_PAIRINGS: Record<PersonalityCategory, FontPairing> = {
  'geometric-modern': { category: 'geometric-modern', heading: 'Poppins', body: 'Inter' },
  'classic-serif': { category: 'classic-serif', heading: 'Playfair Display', body: 'Lora' },
  'friendly-rounded': { category: 'friendly-rounded', heading: 'Baloo 2', body: 'Quicksand' },
  'technical-industrial': { category: 'technical-industrial', heading: 'Space Grotesk', body: 'JetBrains Mono' },
  'bold-display': { category: 'bold-display', heading: 'Archivo Black', body: 'Barlow' },
};

export function inferPersonality(
  palette: PaletteColor[],
  complexity: ComplexityResult
): PersonalityCategory {
  if (palette.length === 0) return 'geometric-modern';

  const primary = pickPrimaryBrandColor(palette);
  const { h, s } = hexToHsl(primary.hex);
  const isWarm = h < 90 || h > 300;
  const isSaturated = s > 0.45;
  const isDetailed = !complexity.isClean || complexity.nodeCount > 150;

  if (isDetailed && isSaturated) return 'bold-display';
  if (isDetailed && !isSaturated) return 'classic-serif';
  if (!isDetailed && isWarm && isSaturated) return 'friendly-rounded';
  if (!isDetailed && !isWarm && isSaturated) return 'technical-industrial';
  return 'geometric-modern';
}

export function fontPairingFor(category: PersonalityCategory): FontPairing {
  return FONT_PAIRINGS[category];
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
    case g: h = (b - r) / d + 2; break;
    default: h = (r - g) / d + 4;
  }
  h *= 60;

  return { h, s, l };
}
