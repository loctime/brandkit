import { parseSvgContent, escapeXml } from './layouts';
import type { FontPairing } from '../color/personality';

export interface BannerOptions {
  logoSvg: string;
  brandName: string;
  fontPairing: FontPairing;
  primaryColor?: string;
  bgColor?: string;
  textColor?: string;
}

export function renderLinkedInBannerSvg({
  logoSvg,
  brandName,
  fontPairing,
  primaryColor = '#4f46e5',
  bgColor = '#090a0f',
  textColor = '#ffffff',
}: BannerOptions): string {
  const { viewBox, content } = parseSvgContent(logoSvg);
  const name = brandName.trim() || 'Tu Marca';
  const width = 1584;
  const height = 396;
  const iconSize = 130;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="liGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColor}" />
      <stop offset="65%" stop-color="${bgColor}" />
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.3" />
    </linearGradient>
    <radialGradient id="liGlow" cx="80%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.25" />
      <stop offset="100%" stop-color="${bgColor}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#liGrad)" />
  <rect width="${width}" height="${height}" fill="url(#liGlow)" />
  <g transform="translate(920, 133)">
    <svg x="0" y="0" width="${iconSize}" height="${iconSize}" viewBox="${viewBox}">
      ${content}
    </svg>
    <text x="${iconSize + 24}" y="${iconSize / 2 + 16}" font-family="${fontPairing.heading}, ${fontPairing.fallback}" font-size="50" font-weight="700" fill="${textColor}">${escapeXml(name)}</text>
  </g>
</svg>`;
}

export function renderTwitterBannerSvg({
  logoSvg,
  brandName,
  fontPairing,
  primaryColor = '#4f46e5',
  bgColor = '#090a0f',
  textColor = '#ffffff',
}: BannerOptions): string {
  const { viewBox, content } = parseSvgContent(logoSvg);
  const name = brandName.trim() || 'Tu Marca';
  const width = 1500;
  const height = 500;
  const iconSize = 150;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="twGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColor}" />
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.3" />
    </linearGradient>
    <circle cx="1200" cy="250" r="260" fill="${primaryColor}" opacity="0.12" />
  </defs>
  <rect width="${width}" height="${height}" fill="url(#twGrad)" />
  <g transform="translate(750, 175)">
    <g transform="translate(-${iconSize + 120}, 0)">
      <svg x="0" y="0" width="${iconSize}" height="${iconSize}" viewBox="${viewBox}">
        ${content}
      </svg>
    </g>
    <text x="-90" y="${iconSize / 2 + 18}" font-family="${fontPairing.heading}, ${fontPairing.fallback}" font-size="56" font-weight="700" fill="${textColor}">${escapeXml(name)}</text>
  </g>
</svg>`;
}
