import { describe, it, expect } from 'vitest';
import { analyzeSvgComplexity } from './complexity';

describe('analyzeSvgComplexity', () => {
  it('counts path commands as nodes and reports clean below threshold', () => {
    const svg = '<svg><path d="M0 0 L10 10 L20 0 Z"/></svg>';
    const result = analyzeSvgComplexity(svg);
    expect(result.pathCount).toBe(1);
    expect(result.nodeCount).toBe(4); // M, L, L, Z
    expect(result.isClean).toBe(true);
  });

  it('sums nodes across multiple paths', () => {
    const svg = '<svg><path d="M0 0 L1 1"/><path d="M2 2 L3 3 L4 4"/></svg>';
    const result = analyzeSvgComplexity(svg);
    expect(result.pathCount).toBe(2);
    expect(result.nodeCount).toBe(5);
  });

  it('marks a result as not clean when it exceeds the threshold', () => {
    const manyCommands = 'M0 0 ' + 'L1 1 '.repeat(50);
    const svg = `<svg><path d="${manyCommands}"/></svg>`;
    const result = analyzeSvgComplexity(svg, 20);
    expect(result.isClean).toBe(false);
  });
});
