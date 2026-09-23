import { describe, it, expect } from 'vitest';
import { expectedManifestPaths } from './manifest';

describe('expectedManifestPaths', () => {
  it('matches the spec structure', () => {
    const paths = expectedManifestPaths();

    expect(paths).toContain('favicon/favicon.ico');
    expect(paths).toContain('favicon/apple-touch-icon.png');
    expect(paths).toContain('svg/logo-full-color.svg');
    expect(paths).toContain('svg/logo-monochrome.svg');
    expect(paths).toContain('wordmark/wordmark.svg');
    expect(paths).toContain('wordmark/wordmark-transparent.png');
    expect(paths).toContain('png/black/white-512.png');
    expect(paths).toContain('guia-de-marca.png');
    expect(paths.length).toBe(76);
  });

  it('has no duplicate paths', () => {
    const paths = expectedManifestPaths();
    expect(new Set(paths).size).toBe(paths.length);
  });
});
