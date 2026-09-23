import { describe, it, expect } from 'vitest';
import { renderLinkedInBannerSvg, renderTwitterBannerSvg } from './banners';
import type { FontPairing } from '../color/personality';

const mockPairing: FontPairing = {
  category: 'geometric-modern',
  heading: 'Poppins',
  body: 'Inter',
  fallback: 'sans-serif',
};

const mockLogo = `<svg viewBox="0 0 100 100"><rect width="80" height="80" fill="purple"/></svg>`;

describe('banners module', () => {
  it('renders LinkedIn banner with exact dimensions and brand text', () => {
    const svg = renderLinkedInBannerSvg({
      logoSvg: mockLogo,
      brandName: 'BrandCorp',
      fontPairing: mockPairing,
    });
    expect(svg).toContain('width="1584"');
    expect(svg).toContain('height="396"');
    expect(svg).toContain('BrandCorp');
  });

  it('renders Twitter banner with exact dimensions', () => {
    const svg = renderTwitterBannerSvg({
      logoSvg: mockLogo,
      brandName: 'BrandCorp',
      fontPairing: mockPairing,
    });
    expect(svg).toContain('width="1500"');
    expect(svg).toContain('height="500"');
    expect(svg).toContain('BrandCorp');
  });
});
