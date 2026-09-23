import type { FontPairing } from '../color/personality';

export interface LayoutOptions {
  logoSvg: string;
  brandName: string;
  fontPairing: FontPairing;
  textColor?: string;
}

export function parseSvgContent(svgString: string): { viewBox: string; content: string } {
  const viewBoxMatch = svgString.match(/viewBox=["']([^"']+)["']/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 512 512';

  // Extract everything between <svg...> and </svg>
  const innerMatch = svgString.replace(/^[\s\S]*?<svg[^>]*>/i, '').replace(/<\/svg>[\s\S]*$/i, '');
  return { viewBox, content: innerMatch };
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
  textColor = '#111111',
}: LayoutOptions): string {
  const { viewBox, content } = parseSvgContent(logoSvg);
  const name = brandName.trim() || 'Tu Marca';
  const approxTextWidth = name.length * 36;
  const totalWidth = Math.max(640, 180 + approxTextWidth + 80);
  const height = 180;
  const iconSize = 120;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}">
  <svg x="40" y="30" width="${iconSize}" height="${iconSize}" viewBox="${viewBox}">
    ${content}
  </svg>
  <text x="${40 + iconSize + 24}" y="${height / 2 + 18}" font-family="${fontPairing.heading}, ${fontPairing.fallback}" font-size="52" font-weight="700" fill="${textColor}">${escapeXml(name)}</text>
</svg>`;
}

export function renderVerticalLayoutSvg({
  logoSvg,
  brandName,
  fontPairing,
  textColor = '#111111',
}: LayoutOptions): string {
  const { viewBox, content } = parseSvgContent(logoSvg);
  const name = brandName.trim() || 'Tu Marca';
  const width = 500;
  const height = 500;
  const iconSize = 220;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <svg x="${(width - iconSize) / 2}" y="70" width="${iconSize}" height="${iconSize}" viewBox="${viewBox}">
    ${content}
  </svg>
  <text x="${width / 2}" y="${70 + iconSize + 70}" text-anchor="middle" font-family="${fontPairing.heading}, ${fontPairing.fallback}" font-size="44" font-weight="700" fill="${textColor}">${escapeXml(name)}</text>
</svg>`;
}

export function renderBadgeLayoutSvg({
  logoSvg,
  brandName,
  fontPairing,
  textColor = '#ffffff',
  badgeColor = '#18181b',
}: LayoutOptions & { badgeColor?: string }): string {
  const { viewBox, content } = parseSvgContent(logoSvg);
  const name = brandName.trim() || 'Tu Marca';
  const size = 500;
  const iconSize = 190;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="100" fill="${badgeColor}" />
  <svg x="${(size - iconSize) / 2}" y="90" width="${iconSize}" height="${iconSize}" viewBox="${viewBox}">
    ${content}
  </svg>
  <text x="${size / 2}" y="${90 + iconSize + 65}" text-anchor="middle" font-family="${fontPairing.heading}, ${fontPairing.fallback}" font-size="38" font-weight="700" fill="${textColor}">${escapeXml(name)}</text>
</svg>`;
}
