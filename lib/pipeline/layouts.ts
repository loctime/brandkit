import type { FontPairing } from '../color/personality';

export interface LayoutOptions {
  logoSvg: string;
  brandName: string;
  fontPairing: FontPairing;
  primaryColor?: string;
  badgeColor?: string;
  textColor?: string;
  tagline?: string;
  forceText?: boolean;
}

export function parseSvgContent(svgString: string): { viewBox: string; content: string } {
  const viewBoxMatch = svgString.match(/viewBox=["']([^"']+)["']/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 512 512';

  // Extract everything between <svg...> and </svg>
  const innerMatch = svgString.replace(/^[\s\S]*?<svg[^>]*>/i, '').replace(/<\/svg>[\s\S]*$/i, '');

  // Re-wrap in filter if present
  const rootTagMatch = svgString.match(/<svg[^>]*>/i);
  const filterMatch = rootTagMatch ? rootTagMatch[0].match(/\sfilter=["']([^"']+)["']/i) : null;
  const content = filterMatch ? `<g filter="${filterMatch[1]}">${innerMatch}</g>` : innerMatch;

  return { viewBox, content };
}

export function getSvgDimensions(viewBox: string): { width: number; height: number; aspect: number } {
  const parts = viewBox.trim().split(/[\s,]+/).map(Number);
  if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
    return { width: parts[2], height: parts[3], aspect: parts[2] / parts[3] };
  }
  return { width: 512, height: 512, aspect: 1 };
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function renderHorizontalLayoutSvg({
  logoSvg,
  brandName,
  fontPairing,
  primaryColor = '#ea580c',
  textColor = '#0f172a',
  tagline,
  forceText = false,
}: LayoutOptions): string {
  const { viewBox, content } = parseSvgContent(logoSvg);
  const { aspect } = getSvgDimensions(viewBox);
  const isWide = aspect >= 1.25;
  const name = brandName.trim() || 'Tu Marca';

  // Wide logo: display the full mark without duplicating the brand name
  if (isWide && !forceText) {
    const width = 800;
    const height = 220;
    const hasTagline = Boolean(tagline && tagline.trim().length > 0);
    const maxLogoHeight = hasTagline ? 130 : 155;
    const logoW = Math.min(560, Math.round(maxLogoHeight * aspect));
    const logoH = Math.round(logoW / aspect);
    const x = (width - logoW) / 2;
    const y = hasTagline ? 28 : (height - logoH) / 2;

    const taglineMarkup = hasTagline
      ? `<g text-anchor="middle">
  <circle cx="${width / 2 - 80}" cy="${y + logoH + 30}" r="2" fill="${primaryColor}" opacity="0.6"/>
  <text x="${width / 2}" y="${y + logoH + 34}" font-family="${fontPairing.body}, sans-serif" font-size="13" font-weight="600" fill="#64748b" letter-spacing="4">${escapeXml(tagline!.trim().toUpperCase())}</text>
  <circle cx="${width / 2 + 80}" cy="${y + logoH + 30}" r="2" fill="${primaryColor}" opacity="0.6"/>
</g>`
      : '';

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <svg x="${x}" y="${y}" width="${logoW}" height="${logoH}" viewBox="${viewBox}">
    ${content}
  </svg>
  ${taglineMarkup}
</svg>`;
  }

  // Square or compact icon: compose [Icon] on left + [Brand Name] on right
  const iconSize = 120;
  const approxTextWidth = name.length * 34;
  const totalWidth = Math.max(640, 60 + iconSize + 28 + approxTextWidth + 60);
  const height = 180;
  const iconX = 60;
  const iconY = (height - iconSize) / 2;
  const textX = iconX + iconSize + 28;

  const hasTagline = Boolean(tagline && tagline.trim().length > 0);
  const textY = hasTagline ? height / 2 + 6 : height / 2 + 18;

  const taglineMarkup = hasTagline
    ? `<text x="${textX}" y="${textY + 28}" font-family="${fontPairing.body}, sans-serif" font-size="13" font-weight="600" fill="#64748b" letter-spacing="3">${escapeXml(tagline!.trim().toUpperCase())}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}">
  <svg x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}" viewBox="${viewBox}">
    ${content}
  </svg>
  <text x="${textX}" y="${textY}" font-family="${fontPairing.heading}, ${fontPairing.fallback}" font-size="50" font-weight="700" fill="${textColor}">${escapeXml(name)}</text>
  ${taglineMarkup}
</svg>`;
}

export function renderVerticalLayoutSvg({
  logoSvg,
  brandName,
  fontPairing,
  primaryColor = '#ea580c',
  textColor = '#0f172a',
  tagline,
  forceText = false,
}: LayoutOptions): string {
  const { viewBox, content } = parseSvgContent(logoSvg);
  const { aspect } = getSvgDimensions(viewBox);
  const isWide = aspect >= 1.25;
  const name = brandName.trim() || 'Tu Marca';
  const width = 600;
  const height = 600;

  if (isWide && !forceText) {
    const logoW = Math.min(460, Math.round(width * 0.72));
    const logoH = Math.round(logoW / aspect);
    const x = (width - logoW) / 2;
    const y = (height - logoH) / 2 - 25;
    const subText = tagline?.trim() ? tagline.trim().toUpperCase() : 'IDENTIDAD DE MARCA';

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <svg x="${x}" y="${y}" width="${logoW}" height="${logoH}" viewBox="${viewBox}">
    ${content}
  </svg>
  <line x1="${width / 2 - 40}" y1="${y + logoH + 35}" x2="${width / 2 + 40}" y2="${y + logoH + 35}" stroke="${primaryColor}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
  <text x="${width / 2}" y="${y + logoH + 65}" text-anchor="middle" font-family="${fontPairing.body}, sans-serif" font-size="12" font-weight="600" fill="#64748b" letter-spacing="4">${escapeXml(subText)}</text>
</svg>`;
  }

  // Square icon: [Icon] centered on top + [Brand Name] centered below
  const iconSize = 220;
  const iconX = (width - iconSize) / 2;
  const iconY = 110;
  const textY = iconY + iconSize + 60;
  const hasTagline = Boolean(tagline && tagline.trim().length > 0);

  const taglineMarkup = hasTagline
    ? `<text x="${width / 2}" y="${textY + 34}" text-anchor="middle" font-family="${fontPairing.body}, sans-serif" font-size="14" font-weight="600" fill="#64748b" letter-spacing="3">${escapeXml(tagline!.trim().toUpperCase())}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <svg x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}" viewBox="${viewBox}">
    ${content}
  </svg>
  <text x="${width / 2}" y="${textY}" text-anchor="middle" font-family="${fontPairing.heading}, ${fontPairing.fallback}" font-size="44" font-weight="700" fill="${textColor}">${escapeXml(name)}</text>
  ${taglineMarkup}
</svg>`;
}

export function renderBadgeLayoutSvg({
  logoSvg,
  fontPairing,
  primaryColor = '#ea580c',
  badgeColor,
  textColor = '#f8fafc',
}: LayoutOptions & { badgeColor?: string }): string {
  const { viewBox, content } = parseSvgContent(logoSvg);
  const { aspect } = getSvgDimensions(viewBox);
  const size = 600;
  const cx = size / 2;
  const cy = size / 2;
  const primary = primaryColor || '#ea580c';

  const maxW = 340;
  const maxH = 220;
  let logoW: number;
  let logoH: number;

  if (aspect > maxW / maxH) {
    logoW = maxW;
    logoH = Math.round(maxW / aspect);
  } else {
    logoH = Math.min(maxH, Math.round(maxW / aspect));
    logoW = Math.round(logoH * aspect);
  }

  const x = cx - logoW / 2;
  const y = cy - logoH / 2;

  const bgFill = badgeColor && badgeColor !== primary ? badgeColor : 'url(#badge-bg)';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="badge-bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="85%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <filter id="badge-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>

  <circle cx="${cx}" cy="${cy}" r="265" fill="${bgFill}" filter="url(#badge-glow)" />
  <circle cx="${cx}" cy="${cy}" r="252" fill="none" stroke="${primary}" stroke-width="2" stroke-dasharray="4,6" opacity="0.75" />
  <circle cx="${cx}" cy="${cy}" r="240" fill="none" stroke="${primary}" stroke-width="3" />
  <circle cx="${cx}" cy="${cy}" r="232" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />

  <g fill="${primary}" text-anchor="middle" font-size="16">
    <text x="${cx}" y="108">★</text>
    <text x="${cx - 24}" y="112" font-size="12" opacity="0.8">★</text>
    <text x="${cx + 24}" y="112" font-size="12" opacity="0.8">★</text>
  </g>

  <text x="${cx}" y="142" text-anchor="middle" font-family="${fontPairing.heading}, ${fontPairing.fallback}" font-size="13" font-weight="700" fill="${textColor}" letter-spacing="4">SELLO OFICIAL</text>
  <circle cx="${cx}" cy="${cy}" r="172" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="1" />

  <svg x="${x}" y="${y}" width="${logoW}" height="${logoH}" viewBox="${viewBox}">
    ${content}
  </svg>

  <line x1="${cx - 80}" y1="465" x2="${cx - 25}" y2="465" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <circle cx="${cx}" cy="465" r="3" fill="${primary}"/>
  <line x1="${cx + 25}" y1="465" x2="${cx + 80}" y2="465" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <text x="${cx}" y="495" text-anchor="middle" font-family="${fontPairing.body}, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" letter-spacing="5">CALIDAD GARANTIZADA</text>
</svg>`;
}

export function renderAppIconLayoutSvg({
  logoSvg,
  primaryColor = '#ea580c',
}: LayoutOptions): string {
  const { viewBox, content } = parseSvgContent(logoSvg);
  const { aspect } = getSvgDimensions(viewBox);
  const size = 512;

  const maxW = 380;
  const maxH = 340;
  let logoW: number;
  let logoH: number;

  if (aspect > maxW / maxH) {
    logoW = maxW;
    logoH = Math.round(maxW / aspect);
  } else {
    logoH = Math.min(maxH, Math.round(maxW / aspect));
    logoW = Math.round(logoH * aspect);
  }

  const x = (size - logoW) / 2;
  const y = (size - logoH) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="app-icon-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#182234"/>
      <stop offset="100%" stop-color="#0b111e"/>
    </linearGradient>
    <filter id="app-icon-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect x="24" y="24" width="464" height="464" rx="105" fill="url(#app-icon-grad)" filter="url(#app-icon-shadow)"/>
  <rect x="24" y="24" width="464" height="464" rx="105" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
  <rect x="24" y="24" width="464" height="464" rx="105" fill="none" stroke="${primaryColor}" stroke-width="1.5" opacity="0.3"/>
  <svg x="${x}" y="${y}" width="${logoW}" height="${logoH}" viewBox="${viewBox}">
    ${content}
  </svg>
</svg>`;
}
