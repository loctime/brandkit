import { describe, it, expect } from 'vitest';
import { renderLinkedInBannerSvg, renderTwitterBannerSvg } from './banners';
import type { FontPairing } from '../color/personality';

const mockPairing: FontPairing = {
  category: 'geometric-modern',
  heading: 'Poppins',
  body: 'Inter',
  fallback: 'sans-serif',
};

const mockSquareLogo = `<svg viewBox="0 0 100 100"><rect width="80" height="80" fill="purple"/></svg>`;
const mockWideLogo = `<svg viewBox="0 0 400 150"><circle cx="50" cy="75" r="40" fill="purple"/><text x="110" y="80">BrandCorp</text></svg>`;

describe('banners module', () => {
  it('renders LinkedIn banner with exact dimensions and brand text for square icons', () => {
    const svg = renderLinkedInBannerSvg({
      logoSvg: mockSquareLogo,
      brandName: 'BrandCorp',
      fontPairing: mockPairing,
    });
    expect(svg).toContain('width="1584"');
    expect(svg).toContain('height="396"');
    expect(svg).toContain('BrandCorp');
  });

  it('does NOT duplicate brand text in LinkedIn banner when logo is already wide', () => {
    const svg = renderLinkedInBannerSvg({
      logoSvg: mockWideLogo,
      brandName: 'BrandCorp',
      fontPairing: mockPairing,
    });
    // Should only have the one BrandCorp inside the logo content
    const occurrences = (svg.match(/BrandCorp/g) ?? []).length;
    expect(occurrences).toBe(1);
  });

  it('renders Twitter banner with exact dimensions for square icons', () => {
    const svg = renderTwitterBannerSvg({
      logoSvg: mockSquareLogo,
      brandName: 'BrandCorp',
      fontPairing: mockPairing,
    });
    expect(svg).toContain('width="1500"');
    expect(svg).toContain('height="500"');
    expect(svg).toContain('BrandCorp');
  });

  it('does NOT duplicate brand text in Twitter banner when logo is already wide', () => {
    const svg = renderTwitterBannerSvg({
      logoSvg: mockWideLogo,
      brandName: 'BrandCorp',
      fontPairing: mockPairing,
    });
    const occurrences = (svg.match(/BrandCorp/g) ?? []).length;
    expect(occurrences).toBe(1);
  });
});
