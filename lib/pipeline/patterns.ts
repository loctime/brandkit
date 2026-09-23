import { parseSvgContent } from './layouts';

export interface PatternOptions {
  logoSvg: string;
  bgColor?: string;
  opacity?: number;
  width?: number;
  height?: number;
  tileScale?: number;
}

export function renderPatternSvg({
  logoSvg,
  bgColor = '#090a0f',
  opacity = 0.08,
  width = 1920,
  height = 1080,
  tileScale = 120,
}: PatternOptions): string {
  const { viewBox, content } = parseSvgContent(logoSvg);
  const step = Math.round(tileScale * 1.6);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <pattern id="brand-monogram" width="${step}" height="${step}" patternUnits="userSpaceOnUse" patternTransform="rotate(-15)">
      <svg x="${(step - tileScale) / 2}" y="${(step - tileScale) / 2}" width="${tileScale}" height="${tileScale}" viewBox="${viewBox}" opacity="${opacity}">
        ${content}
      </svg>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="${bgColor}" />
  <rect width="${width}" height="${height}" fill="url(#brand-monogram)" />
</svg>`;
}

export function renderGradientWallpaperSvg({
  primaryColor = '#4f46e5',
  secondaryColor = '#9333ea',
  bgColor = '#090a0f',
  width = 1920,
  height = 1080,
}: {
  primaryColor?: string;
  secondaryColor?: string;
  bgColor?: string;
  width?: number;
  height?: number;
}): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="mesh1" cx="20%" cy="30%" r="60%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${bgColor}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="mesh2" cx="80%" cy="70%" r="50%">
      <stop offset="0%" stop-color="${secondaryColor}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="${bgColor}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${bgColor}" />
  <rect width="${width}" height="${height}" fill="url(#mesh1)" />
  <rect width="${width}" height="${height}" fill="url(#mesh2)" />
</svg>`;
}
