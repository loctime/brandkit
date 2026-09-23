import { describe, it, expect } from 'vitest';
import { getSvgAspectRatio } from './aspect-ratio';

describe('getSvgAspectRatio', () => {
  it('reads width/height from a viewBox attribute', () => {
    expect(getSvgAspectRatio('<svg viewBox="0 0 8 2"><path/></svg>')).toEqual({ width: 8, height: 2 });
  });

  it('falls back to explicit width/height attributes when there is no viewBox', () => {
    expect(getSvgAspectRatio('<svg width="400" height="100"><path/></svg>')).toEqual({
      width: 400,
      height: 100,
    });
  });

  it('prefers viewBox over width/height when both are present', () => {
    expect(getSvgAspectRatio('<svg width="400" height="100" viewBox="0 0 4 1"><path/></svg>')).toEqual({
      width: 4,
      height: 1,
    });
  });

  it('defaults to a 1:1 square when neither is present', () => {
    expect(getSvgAspectRatio('<svg><path/></svg>')).toEqual({ width: 1, height: 1 });
  });
});
