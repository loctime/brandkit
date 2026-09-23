export interface PixelBuffer {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export function posterize(pixels: PixelBuffer, levels: number): PixelBuffer {
  if (levels < 2) throw new Error('posterize: levels must be >= 2');

  const step = 255 / (levels - 1);
  const output = new Uint8ClampedArray(pixels.data.length);

  for (let i = 0; i < pixels.data.length; i += 4) {
    output[i] = quantizeChannel(pixels.data[i], step);
    output[i + 1] = quantizeChannel(pixels.data[i + 1], step);
    output[i + 2] = quantizeChannel(pixels.data[i + 2], step);
    output[i + 3] = pixels.data[i + 3];
  }

  return { data: output, width: pixels.width, height: pixels.height };
}

function quantizeChannel(value: number, step: number): number {
  return Math.round(Math.round(value / step) * step);
}
