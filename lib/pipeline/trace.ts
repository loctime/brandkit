import ImageTracer from 'imagetracerjs';
import type { PixelBuffer } from './posterize';
import type { TraceFn } from './simplify';

export const traceToSvg: TraceFn = (pixels: PixelBuffer): string => {
  const imageData = { width: pixels.width, height: pixels.height, data: pixels.data };
  return ImageTracer.imagedataToSVG(imageData, {
    ltres: 1,
    qtres: 1,
    pathomit: 8,
    numberofcolors: 16,
    viewbox: true,
  });
};
