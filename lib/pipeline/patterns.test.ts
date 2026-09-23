import { describe, it, expect } from 'vitest';
import { renderPatternSvg, renderGradientWallpaperSvg } from './patterns';

const mockLogo = `<svg viewBox="0 0 100 100"><polygon points="50,15 90,85 10,85" fill="blue"/></svg>`;

describe('patterns module', () => {
  it('renders monogram pattern with pattern definition', () => {
    const svg = renderPatternSvg({
      logoSvg: mockLogo,
      bgColor: '#111111',
      opacity: 0.1,
      width: 800,
      height: 600,
    });
    expect(svg).toContain('<pattern id="brand-monogram"');
    expect(svg).toContain('polygon points="50,15 90,85 10,85"');
    expect(svg).toContain('url(#brand-monogram)');
    expect(svg).toContain('width="800"');
  });

  it('renders gradient wallpaper with radial gradients', () => {
    const svg = renderGradientWallpaperSvg({
      primaryColor: '#ff0000',
      secondaryColor: '#00ff00',
      bgColor: '#000000',
    });
    expect(svg).toContain('radialGradient id="mesh1"');
    expect(svg).toContain('stop-color="#ff0000"');
    expect(svg).toContain('stop-color="#00ff00"');
  });
});
