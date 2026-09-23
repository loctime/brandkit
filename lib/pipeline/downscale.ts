const MAX_DIMENSION = 1024;

/**
 * A phone photo can easily be 4000px+ on a side. Feeding that straight into
 * background removal and three sequential re-traces (the simplify-candidate
 * path) is the "don't freeze the browser" case the spec warns about.
 * Downscaling once, up front, bounds every later step's cost regardless of
 * the original upload's resolution. Small images pass through untouched.
 */
export async function downscaleImage(input: Blob, maxDimension: number = MAX_DIMENSION): Promise<Blob> {
  const bitmap = await createImageBitmap(input);
  try {
    if (bitmap.width <= maxDimension && bitmap.height <= maxDimension) {
      return input;
    }

    const scale = maxDimension / Math.max(bitmap.width, bitmap.height);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('downscaleImage: no 2d context available');
    ctx.drawImage(bitmap, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('downscaleImage: toBlob failed'))),
        input.type || 'image/png'
      );
    });
  } finally {
    bitmap.close();
  }
}
