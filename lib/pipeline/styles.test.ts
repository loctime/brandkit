import { describe, it, expect } from 'vitest';
import { renderGoldFoilSvg, renderNeonGlowSvg, renderStampGrungeSvg } from './styles';

const mockLogo = `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#000000"/></svg>`;

describe('styles module', () => {
  it('renders gold foil with gold linear gradient', () => {
    const svg = renderGoldFoilSvg(mockLogo);
    expect(svg).toContain('linearGradient id="goldFoil"');
    expect(svg).toContain('url(#goldFoil)');
  });

  it('renders neon glow with blur filter', () => {
    const svg = renderNeonGlowSvg(mockLogo, '#ec4899');
    expect(svg).toContain('filter id="neonBlur"');
    expect(svg).toContain('fill="#ec4899"');
  });

  it('renders stamp grunge with turbulence filter', () => {
    const svg = renderStampGrungeSvg(mockLogo, '#374151');
    expect(svg).toContain('filter id="stampDistort"');
    expect(svg).toContain('feTurbulence');
  });
});
