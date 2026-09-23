export type Background = 'transparent' | 'white' | 'black';

export async function renderPng(
  svgMarkup: string,
  size: number,
  background: Background
): Promise<Blob> {
  const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('renderPng: no 2d context available');

    if (background !== 'transparent') {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, size, size);
    }
    ctx.drawImage(image, 0, 0, size, size);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('renderPng: toBlob failed'))),
        'image/png'
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}
