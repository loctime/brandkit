import { describe, it, expect, vi, afterEach } from 'vitest';
import { isWasmSupported } from './browser-support';

describe('isWasmSupported', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns true when the WebAssembly global exists', () => {
    vi.stubGlobal('WebAssembly', {});
    expect(isWasmSupported()).toBe(true);
  });

  it('returns false when the WebAssembly global is missing', () => {
    vi.stubGlobal('WebAssembly', undefined);
    expect(isWasmSupported()).toBe(false);
  });
});
