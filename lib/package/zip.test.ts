import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { buildZipBytes, type ZipEntry } from './zip';

describe('buildZipBytes', () => {
  it('round-trips entries through a real zip', async () => {
    const entries: ZipEntry[] = [
      { path: 'svg/logo-full-color.svg', data: '<svg></svg>' },
      { path: 'favicon/favicon.ico', data: new Uint8Array([1, 2, 3]) },
    ];

    const bytes = await buildZipBytes(entries);
    const loaded = await JSZip.loadAsync(bytes);

    const svgContent = await loaded.file('svg/logo-full-color.svg')!.async('string');
    expect(svgContent).toBe('<svg></svg>');

    const icoContent = await loaded.file('favicon/favicon.ico')!.async('uint8array');
    expect(Array.from(icoContent)).toEqual([1, 2, 3]);
  });
});
