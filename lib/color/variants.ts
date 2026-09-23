export type VariantName = 'full-color' | 'black' | 'white' | 'grayscale' | 'monochrome';

export function buildColorVariant(
  svgMarkup: string,
  variant: VariantName,
  monochromeHex?: string
): string {
  if (variant === 'full-color') return svgMarkup;
  if (variant === 'grayscale') {
    return wrapWithFilter(svgMarkup, 'brandkit-grayscale', '<feColorMatrix type="saturate" values="0"/>');
  }

  const targetColor = resolveTargetColor(variant, monochromeHex);
  // A flood-and-composite filter recolors every visible pixel to a flat
  // color using the shape's own alpha as a mask. Unlike rewriting fill
  // attributes, this works no matter how the source encodes color
  // (fill="#hex", fill="rgb(...)" — what imagetracerjs emits — style
  // attributes, CSS classes, gradients, or a default black fill).
  return wrapWithFilter(
    svgMarkup,
    'brandkit-recolor',
    `<feFlood flood-color="${targetColor}" result="flood"/><feComposite in="flood" in2="SourceGraphic" operator="in"/>`
  );
}

function resolveTargetColor(variant: VariantName, monochromeHex?: string): string {
  switch (variant) {
    case 'black': return '#000000';
    case 'white': return '#ffffff';
    case 'monochrome': return monochromeHex ?? '#000000';
    default: throw new Error(`resolveTargetColor: unsupported variant ${variant}`);
  }
}

function wrapWithFilter(svgMarkup: string, filterId: string, filterInner: string): string {
  const filterDef = `<filter id="${filterId}">${filterInner}</filter>`;

  const withDefs = svgMarkup.includes('<defs>')
    ? svgMarkup.replace('<defs>', `<defs>${filterDef}`)
    : svgMarkup.replace(/<svg([^>]*)>/, `<svg$1><defs>${filterDef}</defs>`);

  return withDefs.replace(/<svg([^>]*)>/, (match, attrs) => {
    if (attrs.includes('filter=')) return match;
    return `<svg${attrs} filter="url(#${filterId})">`;
  });
}
