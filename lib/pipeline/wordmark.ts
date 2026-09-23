import type { FontPairing } from '../color/personality';

const FONT_SIZE = 72;
const PADDING_X = 20;
const HEIGHT = 160;
const MAX_WIDTH = 4000;
const APPROX_CHAR_WIDTH = FONT_SIZE * 0.6;

export function renderWordmarkSvg(
  text: string,
  fontPairing: FontPairing,
  textColor: string = '#111111'
): string {
  const displayText = text.trim().length > 0 ? text.trim() : 'Tu Marca';
  const escaped = escapeXml(displayText);

  const rawWidth = PADDING_X * 2 + displayText.length * APPROX_CHAR_WIDTH;
  const width = Math.min(Math.round(rawWidth), MAX_WIDTH);

  // The character-width estimate is only approximate. When the width cap
  // actually kicks in, force the text to exactly the available space with
  // textLength/lengthAdjust instead of letting it overflow past the capped
  // viewBox — for uncapped (normal-length) text, leave natural rendering,
  // since forcing textLength there would visibly stretch/compress it based
  // on nothing more than this rough estimate.
  const wasCapped = rawWidth > MAX_WIDTH;
  const textLengthAttr = wasCapped
    ? ` textLength="${width - PADDING_X * 2}" lengthAdjust="spacingAndGlyphs"`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${HEIGHT}" viewBox="0 0 ${width} ${HEIGHT}">
  <text x="${PADDING_X}" y="${HEIGHT * 0.65}" font-family="${fontPairing.heading}, ${fontPairing.fallback}" font-size="${FONT_SIZE}" fill="${textColor}"${textLengthAttr}>${escaped}</text>
</svg>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
