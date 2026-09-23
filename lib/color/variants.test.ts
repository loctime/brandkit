import { describe, it, expect } from 'vitest';
import ImageTracer from 'imagetracerjs';
import { buildColorVariant } from './variants';

const svg = '<svg><path fill="#123abc" d="M0 0"/><path fill="none" d="M1 1"/></svg>';

function traceRealLogo(): string {
  const width = 4;
  const height = 4;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 220;
    data[i + 1] = 30;
    data[i + 2] = 40;
    data[i + 3] = 255;
  }
  return ImageTracer.imagedataToSVG(
    { width, height, data },
    { ltres: 1, qtres: 1, pathomit: 1, numberofcolors: 4 }
  );
}

describe('buildColorVariant', () => {
  it('returns the markup unchanged for full-color', () => {
    expect(buildColorVariant(svg, 'full-color')).toBe(svg);
  });

  it('recolors to a flat black silhouette regardless of the original fill syntax', () => {
    const result = buildColorVariant(svg, 'black');
    expect(result).toContain('feFlood flood-color="#000000"');
    expect(result).toMatch(/<svg[^>]*filter="url\(#brandkit-recolor\)"/);
  });

  it('recolors to white', () => {
    const result = buildColorVariant(svg, 'white');
    expect(result).toContain('feFlood flood-color="#ffffff"');
  });

  it('recolors to the given monochrome hex', () => {
    const result = buildColorVariant(svg, 'monochrome', '#ff7a00');
    expect(result).toContain('feFlood flood-color="#ff7a00"');
  });

  it('adds a grayscale filter to the svg root', () => {
    const result = buildColorVariant(svg, 'grayscale');
    expect(result).toContain('feColorMatrix');
    expect(result).toMatch(/<svg[^>]*filter="url\(#brandkit-grayscale\)"/);
  });

  it('recolors real imagetracerjs output, which uses fill="rgb(...)" and stroke, not #hex', () => {
    const realSvg = traceRealLogo();
    expect(realSvg).toContain('fill="rgb('); // sanity check on the fixture itself

    const black = buildColorVariant(realSvg, 'black');
    const white = buildColorVariant(realSvg, 'white');
    const mono = buildColorVariant(realSvg, 'monochrome', '#00ff00');

    // A markup-parsing approach would leave these identical to realSvg; a
    // filter-based approach changes the filter attribute/defs instead.
    expect(black).not.toBe(realSvg);
    expect(white).not.toBe(realSvg);
    expect(mono).not.toBe(realSvg);
    expect(black).not.toBe(white);
    expect(black).not.toBe(mono);
  });
});
