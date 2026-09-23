import { describe, it, expect } from 'vitest';
import { validateUploadedFile } from './validate';

describe('validateUploadedFile', () => {
  it('accepts a PNG under the size limit', () => {
    const result = validateUploadedFile({ type: 'image/png', size: 1024 * 1024 });
    expect(result).toEqual({ ok: true });
  });

  it('rejects an unsupported type', () => {
    const result = validateUploadedFile({ type: 'application/pdf', size: 1024 });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/formato/i);
  });

  it('rejects a file over 15MB', () => {
    const result = validateUploadedFile({ type: 'image/png', size: 16 * 1024 * 1024 });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/pesado/i);
  });
});
