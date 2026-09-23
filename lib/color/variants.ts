export type VariantName = 'full-color' | 'black' | 'white' | 'grayscale' | 'monochrome';

const FILL_ATTR_PATTERN = /(fill=")(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)(")/g;

export function buildColorVariant(
  svgMarkup: string,
  variant: VariantName,
  monochromeHex?: string
): string {
  if (variant === 'full-color') return svgMarkup;
  if (variant === 'grayscale') return applyGrayscaleFilter(svgMarkup);

  const targetColor = resolveTargetColor(variant, monochromeHex);
  return svgMarkup.replace(FILL_ATTR_PATTERN, (_match, pre, value, post) => {
    if (value.toLowerCase() === 'none') return `${pre}${value}${post}`;
    return `${pre}${targetColor}${post}`;
  });
}

function resolveTargetColor(variant: VariantName, monochromeHex?: string): string {
  switch (variant) {
    case 'black': return '#000000';
    case 'white': return '#ffffff';
    case 'monochrome': return monochromeHex ?? '#000000';
    default: throw new Error(`resolveTargetColor: unsupported variant ${variant}`);
  }
}

function applyGrayscaleFilter(svgMarkup: string): string {
  const filterId = 'brandkit-grayscale';
  const filterDef = `<filter id="${filterId}"><feColorMatrix type="saturate" values="0"/></filter>`;

  const withDefs = svgMarkup.includes('<defs>')
    ? svgMarkup.replace('<defs>', `<defs>${filterDef}`)
    : svgMarkup.replace(/<svg([^>]*)>/, `<svg$1><defs>${filterDef}</defs>`);

  return withDefs.replace(/<svg([^>]*)>/, (match, attrs) => {
    if (attrs.includes('filter=')) return match;
    return `<svg${attrs} filter="url(#${filterId})">`;
  });
}
