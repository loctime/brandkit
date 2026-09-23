import type { PaletteColor } from '../color/palette';
import type { FontPairing } from '../color/personality';
import { renderPng, type Background } from './render-raster';

const SHEET_WIDTH = 1200;
const SHEET_HEIGHT = 1600;
const LOGO_PREVIEW_SIZE = 300;
const LOGO_BACKGROUNDS: Background[] = ['transparent', 'white', 'black'];

export interface BrandSheetInput {
  logoSvg: string;
  palette: PaletteColor[];
  fontPairing: FontPairing;
}

export async function renderBrandSheet(input: BrandSheetInput): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = SHEET_WIDTH;
  canvas.height = SHEET_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('renderBrandSheet: no 2d context available');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SHEET_WIDTH, SHEET_HEIGHT);

  await drawLogoPreviews(ctx, input.logoSvg);
  drawPaletteSwatches(ctx, input.palette);
  drawFontLabels(ctx, input.fontPairing);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('renderBrandSheet: toBlob failed'))),
      'image/png'
    );
  });
}

async function drawLogoPreviews(ctx: CanvasRenderingContext2D, logoSvg: string): Promise<void> {
  for (let i = 0; i < LOGO_BACKGROUNDS.length; i++) {
    const previewBlob = await renderPng(logoSvg, LOGO_PREVIEW_SIZE, LOGO_BACKGROUNDS[i]);
    const bitmap = await createImageBitmap(previewBlob);
    ctx.drawImage(bitmap, 60 + i * (LOGO_PREVIEW_SIZE + 40), 60, LOGO_PREVIEW_SIZE, LOGO_PREVIEW_SIZE);
  }
}

function drawPaletteSwatches(ctx: CanvasRenderingContext2D, palette: PaletteColor[]): void {
  const swatchSize = 120;
  const top = 460;
  palette.slice(0, 6).forEach((color, i) => {
    ctx.fillStyle = color.hex;
    ctx.fillRect(60 + i * (swatchSize + 20), top, swatchSize, swatchSize);
    ctx.fillStyle = '#111111';
    ctx.font = '20px sans-serif';
    ctx.fillText(color.hex, 60 + i * (swatchSize + 20), top + swatchSize + 24);
  });
}

function drawFontLabels(ctx: CanvasRenderingContext2D, fontPairing: FontPairing): void {
  ctx.fillStyle = '#111111';
  ctx.font = `48px "${fontPairing.heading}", sans-serif`;
  ctx.fillText(fontPairing.heading, 60, 700);
  ctx.font = `28px "${fontPairing.body}", sans-serif`;
  ctx.fillText(fontPairing.body, 60, 760);
}
