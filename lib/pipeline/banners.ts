import { parseSvgContent, getSvgDimensions, escapeXml } from './layouts';
import type { FontPairing } from '../color/personality';

export interface BannerOptions {
  logoSvg: string;
  brandName: string;
  fontPairing: FontPairing;
  primaryColor?: string;
  bgColor?: string;
  textColor?: string;
  tagline?: string;
  forceText?: boolean;
}

export function renderLinkedInBannerSvg({
  logoSvg,
  brandName,
  fontPairing,
  primaryColor = '#ea580c',
  bgColor = '#080b12',
  textColor = '#ffffff',
  tagline,
  forceText = false,
}: BannerOptions): string {
  const { viewBox, content } = parseSvgContent(logoSvg);
  const { aspect } = getSvgDimensions(viewBox);
  const isWide = aspect >= 1.25;
  const name = brandName.trim() || 'Tu Marca';
  const width = 1584;
  const height = 396;

  // Safe area for LinkedIn: Profile picture covers the left area (X: 40 to 360).
  // The optimal center for content is around X = 1040.
  const centerAreaX = 1040;

  let logoMarkup = '';
  if (isWide && !forceText) {
    // Wide logo: display the complete mark without duplicating the brand name text
    const maxH = 155;
    const maxW = 540;
    const logoW = Math.min(maxW, Math.round(maxH * aspect));
    const logoH = Math.round(logoW / aspect);
    const hasTagline = Boolean(tagline && tagline.trim().length > 0);
    const x = Math.round(centerAreaX - logoW / 2);
    const y = Math.round((height - logoH) / 2 - (hasTagline ? 16 : 0));

    const taglineMarkup = hasTagline
      ? `<g text-anchor="middle">
  <line x1="${centerAreaX - 35}" y1="${y + logoH + 22}" x2="${centerAreaX + 35}" y2="${y + logoH + 22}" stroke="${primaryColor}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
  <text x="${centerAreaX}" y="${y + logoH + 42}" font-family="${fontPairing.body}, sans-serif" font-size="13" font-weight="600" fill="#94a3b8" letter-spacing="4">${escapeXml(tagline!.trim().toUpperCase())}</text>
</g>`
      : '';

    logoMarkup = `<svg x="${x}" y="${y}" width="${logoW}" height="${logoH}" viewBox="${viewBox}">
      ${content}
    </svg>
    ${taglineMarkup}`;
  } else {
    // Square/compact icon: compose [Icon] on left + [Brand Name] on right
    const iconSize = 130;
    const approxTextWidth = name.length * 36;
    const groupWidth = iconSize + 28 + approxTextWidth;
    const groupX = Math.round(centerAreaX - groupWidth / 2);
    const iconY = Math.round((height - iconSize) / 2);
    const textX = groupX + iconSize + 28;
    const textY = Math.round(height / 2 + 18);

    logoMarkup = `<g>
      <svg x="${groupX}" y="${iconY}" width="${iconSize}" height="${iconSize}" viewBox="${viewBox}">
        ${content}
      </svg>
      <text x="${textX}" y="${textY}" font-family="${fontPairing.heading}, ${fontPairing.fallback}" font-size="52" font-weight="700" fill="${textColor}">${escapeXml(name)}</text>
    </g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="liGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColor}" />
      <stop offset="70%" stop-color="${bgColor}" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <radialGradient id="liGlow" cx="72%" cy="50%" r="55%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.32" />
      <stop offset="50%" stop-color="${primaryColor}" stop-opacity="0.08" />
      <stop offset="100%" stop-color="${bgColor}" stop-opacity="0" />
    </radialGradient>
    <pattern id="liGrid" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="16" cy="16" r="1" fill="rgba(255,255,255,0.06)" />
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#liGrad)" />
  <rect width="${width}" height="${height}" fill="url(#liGrid)" opacity="0.8" />
  <rect width="${width}" height="${height}" fill="url(#liGlow)" />
  ${logoMarkup}
</svg>`;
}

export function renderTwitterBannerSvg({
  logoSvg,
  brandName,
  fontPairing,
  primaryColor = '#ea580c',
  bgColor = '#070a10',
  textColor = '#ffffff',
  tagline,
  forceText = false,
}: BannerOptions): string {
  const { viewBox, content } = parseSvgContent(logoSvg);
  const { aspect } = getSvgDimensions(viewBox);
  const isWide = aspect >= 1.25;
  const name = brandName.trim() || 'Tu Marca';
  const width = 1500;
  const height = 500;
  const centerAreaX = 860;

  let logoMarkup = '';
  if (isWide && !forceText) {
    const maxH = 175;
    const maxW = 580;
    const logoW = Math.min(maxW, Math.round(maxH * aspect));
    const logoH = Math.round(logoW / aspect);
    const hasTagline = Boolean(tagline && tagline.trim().length > 0);
    const x = Math.round(centerAreaX - logoW / 2);
    const y = Math.round((height - logoH) / 2 - (hasTagline ? 18 : 0));

    const taglineMarkup = hasTagline
      ? `<g text-anchor="middle">
  <line x1="${centerAreaX - 35}" y1="${y + logoH + 24}" x2="${centerAreaX + 35}" y2="${y + logoH + 24}" stroke="${primaryColor}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
  <text x="${centerAreaX}" y="${y + logoH + 46}" font-family="${fontPairing.body}, sans-serif" font-size="14" font-weight="600" fill="#94a3b8" letter-spacing="4">${escapeXml(tagline!.trim().toUpperCase())}</text>
</g>`
      : '';

    logoMarkup = `<svg x="${x}" y="${y}" width="${logoW}" height="${logoH}" viewBox="${viewBox}">
      ${content}
    </svg>
    ${taglineMarkup}`;
  } else {
    const iconSize = 150;
    const approxTextWidth = name.length * 40;
    const groupWidth = iconSize + 30 + approxTextWidth;
    const groupX = Math.round(centerAreaX - groupWidth / 2);
    const iconY = Math.round((height - iconSize) / 2);
    const textX = groupX + iconSize + 30;
    const textY = Math.round(height / 2 + 20);

    logoMarkup = `<g>
      <svg x="${groupX}" y="${iconY}" width="${iconSize}" height="${iconSize}" viewBox="${viewBox}">
        ${content}
      </svg>
      <text x="${textX}" y="${textY}" font-family="${fontPairing.heading}, ${fontPairing.fallback}" font-size="58" font-weight="700" fill="${textColor}">${escapeXml(name)}</text>
    </g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="twGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColor}" />
      <stop offset="65%" stop-color="${bgColor}" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <radialGradient id="twGlow" cx="62%" cy="50%" r="55%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.3" />
      <stop offset="60%" stop-color="${primaryColor}" stop-opacity="0.06" />
      <stop offset="100%" stop-color="${bgColor}" stop-opacity="0" />
    </radialGradient>
    <pattern id="twGrid" width="36" height="36" patternUnits="userSpaceOnUse">
      <circle cx="18" cy="18" r="1" fill="rgba(255,255,255,0.05)" />
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#twGrad)" />
  <rect width="${width}" height="${height}" fill="url(#twGrid)" opacity="0.8" />
  <rect width="${width}" height="${height}" fill="url(#twGlow)" />
  <circle cx="1200" cy="250" r="280" fill="none" stroke="${primaryColor}" stroke-width="1.5" stroke-dasharray="6,10" opacity="0.16" />
  <circle cx="1200" cy="250" r="220" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
  ${logoMarkup}
</svg>`;
}
