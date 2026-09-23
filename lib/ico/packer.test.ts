import { describe, it, expect } from 'vitest';
import { buildIco } from './packer';

describe('buildIco', () => {
  it('writes a valid ICONDIR header', () => {
    const images = [
      { size: 16, pngData: new Uint8Array([1, 2, 3]) },
      { size: 32, pngData: new Uint8Array([4, 5, 6, 7]) },
    ];
    const ico = buildIco(images);
    const view = new DataView(ico.buffer);

    expect(view.getUint16(0, true)).toBe(0); // reserved
    expect(view.getUint16(2, true)).toBe(1); // type: icon
    expect(view.getUint16(4, true)).toBe(2); // count
  });

  it('lays out entries with correct offsets and sizes', () => {
    const images = [
      { size: 16, pngData: new Uint8Array([1, 2, 3]) },
      { size: 32, pngData: new Uint8Array([4, 5, 6, 7]) },
    ];
    const ico = buildIco(images);
    const view = new DataView(ico.buffer);

    const headerSize = 6 + 16 * 2;
    const firstOffset = view.getUint32(6 + 12, true);
    const firstSize = view.getUint32(6 + 8, true);
    expect(firstOffset).toBe(headerSize);
    expect(firstSize).toBe(3);

    const secondOffset = view.getUint32(6 + 16 + 12, true);
    expect(secondOffset).toBe(headerSize + 3);

    expect(ico.length).toBe(headerSize + 3 + 4);
  });

  it('encodes size 256 as 0 per the ICO spec', () => {
    const images = [{ size: 256, pngData: new Uint8Array([9]) }];
    const ico = buildIco(images);
    expect(ico[6]).toBe(0); // width byte for the single entry
  });
});
