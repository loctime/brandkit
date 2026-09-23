export interface IcoImage {
  size: number;
  pngData: Uint8Array;
}

const ICONDIR_SIZE = 6;
const ICONDIRENTRY_SIZE = 16;

export function buildIco(images: IcoImage[]): Uint8Array {
  const count = images.length;
  const headerSize = ICONDIR_SIZE + ICONDIRENTRY_SIZE * count;
  const totalSize = headerSize + images.reduce((sum, img) => sum + img.pngData.length, 0);

  const buffer = new Uint8Array(totalSize);
  const view = new DataView(buffer.buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, count, true);

  let dataOffset = headerSize;
  images.forEach((img, index) => {
    const entryOffset = ICONDIR_SIZE + index * ICONDIRENTRY_SIZE;
    const dim = img.size >= 256 ? 0 : img.size;

    buffer[entryOffset] = dim;
    buffer[entryOffset + 1] = dim;
    buffer[entryOffset + 2] = 0;
    buffer[entryOffset + 3] = 0;
    view.setUint16(entryOffset + 4, 1, true);
    view.setUint16(entryOffset + 6, 32, true);
    view.setUint32(entryOffset + 8, img.pngData.length, true);
    view.setUint32(entryOffset + 12, dataOffset, true);

    buffer.set(img.pngData, dataOffset);
    dataOffset += img.pngData.length;
  });

  return buffer;
}
