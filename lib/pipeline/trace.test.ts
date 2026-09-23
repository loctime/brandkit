import { describe, it, expect } from 'vitest';
import { extractTracePalette, traceToSvg } from './trace';
import type { PixelBuffer } from './posterize';

describe('traceToSvg and extractTracePalette', () => {
  it('extracts transparent color and distinct foreground colors', () => {
    // 2x2 image: 2 transparent pixels, 1 red pixel, 1 white pixel
    const data = new Uint8ClampedArray([
      0, 0, 0, 0,           // transparent
      0, 0, 0, 0,           // transparent
      255, 0, 0, 255,       // red
      255, 255, 255, 255,   // white
    ]);
    const pixels: PixelBuffer = { data, width: 2, height: 2 };
    const palette = extractTracePalette(pixels, 16);

    expect(palette[0]).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    const colors = palette.slice(1);
    expect(colors.some((c) => c.r > 200 && c.g < 50 && c.b < 50)).toBe(true);
    expect(colors.some((c) => c.r > 200 && c.g > 200 && c.b > 200)).toBe(true);
  });

  it('generates valid SVG with paths preserving cutout contrast', () => {
    // 20x20 image with transparent background, orange border, white center
    const width = 20;
    const height = 20;
    const data = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (x >= 6 && x <= 13 && y >= 6 && y <= 13) {
          // White cutout center
          data[idx] = 255;
          data[idx + 1] = 255;
          data[idx + 2] = 255;
          data[idx + 3] = 255;
        } else if (x >= 2 && x <= 17 && y >= 2 && y <= 17) {
          // Orange pin / shape
          data[idx] = 255;
          data[idx + 1] = 100;
          data[idx + 2] = 0;
          data[idx + 3] = 255;
        } else {
          // Transparent background
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 0;
        }
      }
    }

    const pixels: PixelBuffer = { data, width, height };
    const svg = traceToSvg(pixels);

    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox');
    expect(svg).toContain('</svg>');

    // Must have paths for orange and white
    const fills = svg.match(/fill="[^"]+"/g) ?? [];
    expect(fills.length).toBeGreaterThan(1);
    expect(fills.some((f) => f.includes('255') && f.includes('100'))).toBe(true);
    expect(fills.some((f) => f.includes('255,255,255'))).toBe(true);
  });
});
