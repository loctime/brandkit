export interface ComplexityResult {
  nodeCount: number;
  pathCount: number;
  isClean: boolean;
}

const DEFAULT_NODE_THRESHOLD = 400;

export function analyzeSvgComplexity(
  svgMarkup: string,
  nodeThreshold: number = DEFAULT_NODE_THRESHOLD
): ComplexityResult {
  const pathMatches = svgMarkup.match(/<path\b[^>]*\/?>/g) ?? [];
  const pathCount = pathMatches.length;

  let nodeCount = 0;
  for (const pathTag of pathMatches) {
    const dMatch = pathTag.match(/\sd="([^"]*)"/);
    if (!dMatch) continue;
    const commandMatches = dMatch[1].match(/[MLHVCSQTAZmlhvcsqtaz]/g) ?? [];
    nodeCount += commandMatches.length;
  }

  return {
    nodeCount,
    pathCount,
    isClean: nodeCount <= nodeThreshold,
  };
}
