import { describe, it, expect } from 'vitest';
import { inferPersonality, fontPairingFor } from './personality';
import type { ComplexityResult } from '../svg/complexity';

const clean: ComplexityResult = { nodeCount: 40, pathCount: 3, isClean: true };
const detailed: ComplexityResult = { nodeCount: 500, pathCount: 40, isClean: false };

describe('inferPersonality', () => {
  it('picks friendly-rounded for a clean, warm, saturated logo', () => {
    const category = inferPersonality([{ hex: '#ff7a00', population: 10 }], clean);
    expect(category).toBe('friendly-rounded');
  });

  it('picks technical-industrial for a clean, cool, saturated logo', () => {
    const category = inferPersonality([{ hex: '#0044ff', population: 10 }], clean);
    expect(category).toBe('technical-industrial');
  });

  it('picks bold-display for a detailed, saturated logo', () => {
    const category = inferPersonality([{ hex: '#e6007a', population: 10 }], detailed);
    expect(category).toBe('bold-display');
  });

  it('falls back to geometric-modern when the palette is empty', () => {
    const category = inferPersonality([], clean);
    expect(category).toBe('geometric-modern');
  });
});

describe('fontPairingFor', () => {
  it('returns a heading and body font for every category', () => {
    const pairing = fontPairingFor('classic-serif');
    expect(pairing.heading).toBe('Playfair Display');
    expect(pairing.body).toBe('Lora');
  });

  it('gives a serif generic fallback for the serif category, since the named webfont is not embedded', () => {
    // Playfair Display never loads (no @font-face, no bundled font file), so
    // the SVG/canvas render with the CSS generic fallback. A "sans-serif"
    // fallback here would visually contradict the intended classic-serif
    // personality entirely.
    expect(fontPairingFor('classic-serif').fallback).toBe('serif');
  });

  it('gives a sans-serif generic fallback for every non-serif category', () => {
    expect(fontPairingFor('geometric-modern').fallback).toBe('sans-serif');
    expect(fontPairingFor('friendly-rounded').fallback).toBe('sans-serif');
    expect(fontPairingFor('technical-industrial').fallback).toBe('sans-serif');
    expect(fontPairingFor('bold-display').fallback).toBe('sans-serif');
  });
});
