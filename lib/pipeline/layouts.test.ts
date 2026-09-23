import { describe, it, expect } from 'vitest';
import { 
  renderHorizontalLayoutSvg, 
  renderVerticalLayoutSvg, 
  renderBadgeLayoutSvg, 
  renderAppIconLayoutSvg,
  parseSvgContent 
} from './layouts';
import type { FontPairing } from '../color/personality';

const mockPairing: FontPairing = {
  category: 'geometric-modern',
  heading: 'Poppins',
  body: 'Inter',
  fallback: 'sans-serif',
};

const mockSquareLogo = `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red"/></svg>`;
const mockWideLogo = `<svg viewBox="0 0 400 150"><circle cx="50" cy="75" r="40" fill="orange"/><text x="120" y="80">BrandName</text></svg>`;

describe('layouts module', () => {
  it('parses viewBox and content properly', () => {
    const { viewBox, content } = parseSvgContent(mockSquareLogo);
    expect(viewBox).toBe('0 0 100 100');
    expect(content).toContain('circle');
  });

  it('preserves a filter applied on the root <svg> by re-wrapping the content in a <g>', () => {
    const filteredLogo = `<svg viewBox="0 0 100 100" filter="url(#brandkit-recolor)"><defs><filter id="brandkit-recolor"><feFlood flood-color="#ffffff" result="flood"/><feComposite in="flood" in2="SourceGraphic" operator="in"/></filter></defs><path fill="rgb(220,30,40)" d="M0 0 L10 10 Z"/></svg>`;
    const { content } = parseSvgContent(filteredLogo);

    expect(content).toContain('filter="url(#brandkit-recolor)"');
    expect(content).toMatch(/<g filter="url\(#brandkit-recolor\)">[\s\S]*<path/);
  });

  it('renders horizontal layout with text when logo is a square icon', () => {
    const svg = renderHorizontalLayoutSvg({
      logoSvg: mockSquareLogo,
      brandName: 'Acme Corp',
      fontPairing: mockPairing,
    });
    expect(svg).toContain('<svg');
    expect(svg).toContain('Acme Corp');
    expect(svg).toContain('Poppins');
    expect(svg).toContain('circle');
  });

  it('does NOT duplicate brand name when logo is already wide', () => {
    const svg = renderHorizontalLayoutSvg({
      logoSvg: mockWideLogo,
      brandName: 'BrandName',
      fontPairing: mockPairing,
    });
    // Should contain the inner svg content but not an added <text> with brandName
    expect(svg).toContain('<svg');
    // Only the inner content has BrandName, not an additional text tag
    const occurrences = (svg.match(/BrandName/g) ?? []).length;
    expect(occurrences).toBe(1);
  });

  it('renders vertical layout centered without duplicate text for wide logos', () => {
    const svg = renderVerticalLayoutSvg({
      logoSvg: mockWideLogo,
      brandName: 'BrandName',
      fontPairing: mockPairing,
    });
    expect(svg).toContain('IDENTIDAD DE MARCA');
    const occurrences = (svg.match(/BrandName/g) ?? []).length;
    expect(occurrences).toBe(1);
  });

  it('renders official seal badge with stars and quality hallmark', () => {
    const svg = renderBadgeLayoutSvg({
      logoSvg: mockWideLogo,
      brandName: 'BrandName',
      fontPairing: mockPairing,
      primaryColor: '#ea580c',
    });
    expect(svg).toContain('SELLO OFICIAL');
    expect(svg).toContain('CALIDAD GARANTIZADA');
    expect(svg).toContain('★');
  });

  it('renders squircle app icon layout', () => {
    const svg = renderAppIconLayoutSvg({
      logoSvg: mockWideLogo,
      brandName: 'BrandName',
      fontPairing: mockPairing,
    });
    expect(svg).toContain('rx="105"');
    expect(svg).toContain('viewBox="0 0 512 512"');
  });
});
