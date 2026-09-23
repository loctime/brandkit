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
});
