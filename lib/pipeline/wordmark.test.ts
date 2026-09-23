import { describe, it, expect } from 'vitest';
import { renderWordmarkSvg } from './wordmark';
import { fontPairingFor } from '../color/personality';

describe('renderWordmarkSvg', () => {
  it('embeds the brand name and heading font', () => {
    const svg = renderWordmarkSvg('Acme Studio', fontPairingFor('geometric-modern'));
    expect(svg).toContain('Acme Studio');
    expect(svg).toContain('Poppins');
  });

  it('escapes XML-sensitive characters', () => {
    const svg = renderWordmarkSvg('R&D <Labs>', fontPairingFor('geometric-modern'));
    expect(svg).toContain('R&amp;D &lt;Labs&gt;');
    expect(svg).not.toContain('<Labs>');
  });

  it('falls back to a placeholder for empty text instead of an empty label', () => {
    const svg = renderWordmarkSvg('', fontPairingFor('geometric-modern'));
    expect(svg).toContain('Tu Marca');
  });

  it('caps rendered width for very long text so the viewBox stays bounded', () => {
    const longName = 'A'.repeat(200);
    const svg = renderWordmarkSvg(longName, fontPairingFor('geometric-modern'));
    const viewBoxMatch = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    expect(viewBoxMatch).not.toBeNull();
    const width = Number(viewBoxMatch![1]);
    expect(width).toBeLessThanOrEqual(4000);
  });

  it('forces very long text to fit the capped width via textLength, instead of overflowing it', () => {
    const longName = 'A'.repeat(200);
    const svg = renderWordmarkSvg(longName, fontPairingFor('geometric-modern'));
    const textLengthMatch = svg.match(/textLength="([\d.]+)"/);
    expect(textLengthMatch).not.toBeNull();
    expect(svg).toContain('lengthAdjust="spacingAndGlyphs"');
    // The text must fit within the viewBox width, minus the horizontal padding.
    expect(Number(textLengthMatch![1])).toBeLessThanOrEqual(4000 - 2 * 20);
  });

  it('uses the category-appropriate generic fallback, not a hardcoded sans-serif', () => {
    const svg = renderWordmarkSvg('Acme', fontPairingFor('classic-serif'));
    expect(svg).toContain('Playfair Display, serif');
    expect(svg).not.toContain('Playfair Display, sans-serif');
  });

  it('uses light text when rendered for display on a black background', () => {
    const svg = renderWordmarkSvg('Acme', fontPairingFor('geometric-modern'), '#f5f5f5');
    expect(svg).toContain('fill="#f5f5f5"');
  });
});
