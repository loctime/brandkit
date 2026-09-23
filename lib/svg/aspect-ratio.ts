export interface AspectRatio {
  width: number;
  height: number;
}

export function getSvgAspectRatio(svgMarkup: string): AspectRatio {
  const viewBoxMatch = svgMarkup.match(/viewBox="[\s\d.+-]*?([\d.]+)\s+([\d.]+)\s*"/);
  if (viewBoxMatch) {
    return { width: Number(viewBoxMatch[1]), height: Number(viewBoxMatch[2]) };
  }

  const widthMatch = svgMarkup.match(/\swidth="([\d.]+)"/);
  const heightMatch = svgMarkup.match(/\sheight="([\d.]+)"/);
  if (widthMatch && heightMatch) {
    return { width: Number(widthMatch[1]), height: Number(heightMatch[1]) };
  }

  return { width: 1, height: 1 };
}
