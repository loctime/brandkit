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
