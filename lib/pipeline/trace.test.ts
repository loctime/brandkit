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

  it('treats semi-transparent near-white fringe pixels as background, not a foreground color', () => {
    // Reproduces the real artifact: @imgly/background-removal leaves a soft,
    // feathered edge around the cutout instead of a hard alpha=0 cutoff —
    // near-white pixels with alpha in the 30-150 range, not fully opaque and
    // not fully transparent. Those must not become their own visible white
    // shape in the trace.
    const data = new Uint8ClampedArray([
      0, 0, 0, 0, // fully transparent background
      255, 255, 233, 40, // fringe residue: near-white, low alpha
      255, 248, 234, 90, // fringe residue: near-white, mid alpha
      255, 0, 0, 255, // real opaque foreground (red)
    ]);
    const pixels: PixelBuffer = { data, width: 4, height: 1 };
    const palette = extractTracePalette(pixels, 16);

    const nearWhiteForeground = palette.some(
      (c) => c.a > 0 && c.r > 200 && c.g > 200 && c.b > 200
    );
    expect(nearWhiteForeground).toBe(false);
  });

  it('does not trace sub-threshold fringe pixels as a solid shape when a legitimate white color is also present', () => {
    // The palette can correctly exclude a color from its own averages while
    // the *source* pixels handed to imagetracerjs still carry their original
    // (non-zero) alpha — imagetracerjs does its own nearest-palette-color
    // assignment on that raw data, and once a real near-white color exists in
    // the palette (e.g. a white part of the logo, exactly like the real
    // photo that exposed this), it matches the low-alpha residue to that
    // opaque white entry by RGB proximity alone, ignoring how transparent the
    // source pixel actually was. Reproduced directly against imagetracerjs:
    // without the fix, this scenario traces the residue band as a solid
    // `fill="rgb(255,255,255)" opacity="1"` rectangle.
    const width = 100;
    const height = 100;
    const data = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (x >= 40 && x <= 90 && y >= 10 && y <= 50) {
          // Real opaque red part of the logo
          data[idx] = 255;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 255;
        } else if (x >= 40 && x <= 90 && y >= 51 && y <= 90) {
          // Real opaque WHITE part of the logo — this is what gives the
          // residue band below something near-white to get misattributed to.
          data[idx] = 255;
          data[idx + 1] = 255;
          data[idx + 2] = 255;
          data[idx + 3] = 255;
        } else if (x >= 5 && x <= 15) {
          // Fringe residue: a substantial band fully outside the real shape,
          // near-white, meaningfully but not fully opaque (mirrors the real
          // background-removal edge bleed observed in production).
          data[idx] = 250;
          data[idx + 1] = 248;
          data[idx + 2] = 245;
          data[idx + 3] = 90;
        } else {
          // Fully transparent background
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 0;
        }
      }
    }

    const pixels: PixelBuffer = { data, width, height };
    const svg = traceToSvg(pixels);

    // A leftover residue shape would appear as its own separate opaque white
    // path whose coordinates sit in the x:5-16 band, well outside the real
    // logo's x:40-90 shape.
    const pathTags = svg.match(/<path[^>]*\/>/g) ?? [];
    const residueLeaked = pathTags.some((tag) => {
      const isOpaqueWhite = /fill="rgb\(255,\s*255,\s*255\)"/.test(tag) && /opacity="1"/.test(tag);
      const startsInResidueBand = /d="M 5(\.\d+)? /.test(tag);
      return isOpaqueWhite && startsInResidueBand;
    });
    expect(residueLeaked).toBe(false);
  });
});
