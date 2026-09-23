import { parseSvgContent } from './layouts';

export function renderGoldFoilSvg(logoSvg: string): string {
  const { viewBox, content } = parseSvgContent(logoSvg);

  // Replace fill with gold gradient url
  const goldContent = content
    .replace(/fill=["'][^"']*["']/gi, 'fill="url(#goldFoil)"')
    .replace(/style=["'][^"']*fill:[^;"]*;?[^"']*["']/gi, 'fill="url(#goldFoil)"');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <defs>
    <linearGradient id="goldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#bf953f" />
      <stop offset="25%" stop-color="#fcf6ba" />
      <stop offset="50%" stop-color="#b38728" />
      <stop offset="75%" stop-color="#fbf5b7" />
      <stop offset="100%" stop-color="#aa771c" />
    </linearGradient>
  </defs>
  <g fill="url(#goldFoil)">
    ${goldContent}
  </g>
</svg>`;
}

export function renderNeonGlowSvg(logoSvg: string, glowColor: string = '#06b6d4'): string {
  const { viewBox, content } = parseSvgContent(logoSvg);

  const neonContent = content
    .replace(/fill=["'][^"']*["']/gi, `fill="${glowColor}"`)
    .replace(/style=["'][^"']*fill:[^;"]*;?[^"']*["']/gi, `fill="${glowColor}"`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <defs>
    <filter id="neonBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur1" />
      <feGaussianBlur stdDeviation="16" result="blur2" />
      <feMerge>
        <feMergeNode in="blur2" />
        <feMergeNode in="blur1" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <g filter="url(#neonBlur)">
    ${neonContent}
  </g>
</svg>`;
}

export function renderStampGrungeSvg(logoSvg: string, stampColor: string = '#1f2937'): string {
  const { viewBox, content } = parseSvgContent(logoSvg);

  const stampContent = content
    .replace(/fill=["'][^"']*["']/gi, `fill="${stampColor}"`)
    .replace(/style=["'][^"']*fill:[^;"]*;?[^"']*["']/gi, `fill="${stampColor}"`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <defs>
    <filter id="stampDistort">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <g filter="url(#stampDistort)">
    ${stampContent}
  </g>
</svg>`;
}
