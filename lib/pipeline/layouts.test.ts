import { describe, it, expect } from 'vitest';
import { 
  renderHorizontalLayoutSvg, 
  renderVerticalLayoutSvg, 
  renderBadgeLayoutSvg, 
  parseSvgContent 
} from './layouts';
import type { FontPairing } from '../color/personality';

const mockPairing: FontPairing = {
  category: 'geometric-modern',
  heading: 'Poppins',
  body: 'Inter',
  fallback: 'sans-serif',
};

const mockLogo = `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red"/></svg>`;

describe('layouts module', () => {
  it('parses viewBox and content properly', () => {
    const { viewBox, content } = parseSvgContent(mockLogo);
    expect(viewBox).toBe('0 0 100 100');
    expect(content).toContain('circle');
  });

  it('preserves a filter applied on the root <svg> by re-wrapping the content in a <g>', () => {
    // buildColorVariant's recolor (black/white/monochrome) applies its
    // feFlood/feComposite filter via a `filter="url(#...)"` attribute on the
    // root <svg> tag itself, not on any inner element. A naive extraction
    // that keeps only what's between the tags drops that attribute — the
    // filter definition survives in <defs> but nothing ever references it,
    // so the recolor silently has no effect wherever this content gets
    // re-embedded (e.g. the pattern generator).
    const filteredLogo = `<svg viewBox="0 0 100 100" filter="url(#brandkit-recolor)"><defs><filter id="brandkit-recolor"><feFlood flood-color="#ffffff" result="flood"/><feComposite in="flood" in2="SourceGraphic" operator="in"/></filter></defs><path fill="rgb(220,30,40)" d="M0 0 L10 10 Z"/></svg>`;
    const { content } = parseSvgContent(filteredLogo);

    expect(content).toContain('filter="url(#brandkit-recolor)"');
    // The filter must wrap the actual drawable content, not just appear
    // somewhere in the string disconnected from it.
    expect(content).toMatch(/<g filter="url\(#brandkit-recolor\)">[\s\S]*<path/);
  });

  it('renders horizontal layout with text and nested svg', () => {
    const svg = renderHorizontalLayoutSvg({
      logoSvg: mockLogo,
      brandName: 'Acme Corp',
      fontPairing: mockPairing,
    });
    expect(svg).toContain('<svg');
    expect(svg).toContain('Acme Corp');
    expect(svg).toContain('Poppins');
    expect(svg).toContain('circle');
  });

  it('renders vertical layout centered', () => {
    const svg = renderVerticalLayoutSvg({
      logoSvg: mockLogo,
      brandName: 'Acme Corp',
      fontPairing: mockPairing,
    });
    expect(svg).toContain('text-anchor="middle"');
    expect(svg).toContain('Acme Corp');
  });

  it('renders badge layout with rounded rectangle', () => {
    const svg = renderBadgeLayoutSvg({
      logoSvg: mockLogo,
      brandName: 'Acme',
      fontPairing: mockPairing,
      badgeColor: '#123456',
    });
    expect(svg).toContain('fill="#123456"');
    expect(svg).toContain('rx="100"');
    expect(svg).toContain('Acme');
  });
});
