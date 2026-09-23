'use client';

import { useState } from 'react';
import { extractPalette, pickPrimaryBrandColor, type PaletteColor } from '../../lib/color/palette';
import { normalizePalette, mergePalettes } from '../../lib/color/merge-palette';
import { inferPersonality, fontPairingFor, type FontPairing } from '../../lib/color/personality';
import type { PixelBuffer } from '../../lib/pipeline/posterize';
import type { ComplexityResult } from '../../lib/svg/complexity';

export interface BrandInfoResult {
  brandName: string;
  palette: PaletteColor[];
  primaryColor: PaletteColor;
  fontPairing: FontPairing;
}

interface BrandInputsProps {
  logoPixels: PixelBuffer;
  complexity: ComplexityResult;
  onReady: (result: BrandInfoResult) => void;
}

// Reference images broaden the displayed palette and nudge personality
// inference, but never decide the monochrome/primary brand color: that
// color is always picked from the logo's own palette alone (see
// `primaryColor` below), so a reference photo's dominant color — even one
// that outranks the logo's in the merged, weighted palette — can't become
// the color used for the single-color logo variant.
const LOGO_PALETTE_WEIGHT = 3;

export function BrandInputs({ logoPixels, complexity, onReady }: BrandInputsProps) {
  const [brandName, setBrandName] = useState('');
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    setBusy(true);
    try {
      const logoPalette = extractPalette(logoPixels);
      const primaryColor = pickPrimaryBrandColor(logoPalette);
      const weightedLogoPalette = normalizePalette(logoPalette, LOGO_PALETTE_WEIGHT);

      const referencePalettes: PaletteColor[] = [];
      for (const file of referenceFiles) {
        try {
          const pixels = await fileToPixels(file);
          referencePalettes.push(...normalizePalette(extractPalette(pixels, 3), 1));
        } catch (err) {
          // A reference image is optional and secondary to the logo itself:
          // one that fails to decode shouldn't block finishing the flow.
          console.warn('BrandInputs: skipping unreadable reference image', err);
        }
      }

      const palette = mergePalettes([...weightedLogoPalette, ...referencePalettes]);
      const fontPairing = fontPairingFor(inferPersonality(palette, complexity));

      onReady({ brandName, palette, primaryColor, fontPairing });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label>
        Nombre de marca
        <input value={brandName} onChange={(e) => setBrandName(e.target.value)} />
      </label>
      <label>
        Imágenes de referencia (opcional)
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setReferenceFiles(Array.from(e.target.files ?? []))}
        />
      </label>
      <button type="button" onClick={() => void handleSubmit()} disabled={busy}>
        {busy ? 'Analizando…' : 'Continuar'}
      </button>
    </div>
  );
}

const SVG_RASTERIZE_SIZE = 512;

async function fileToPixels(file: File): Promise<PixelBuffer> {
  // createImageBitmap fails to decode an SVG with no explicit width/height
  // (only a viewBox), so SVG reference images go through <img>+canvas at a
  // fixed size instead, same as the logo upload path.
  if (file.type === 'image/svg+xml') {
    return rasterizeViaImageElement(await file.text());
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('fileToPixels: no 2d context available');
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  return { data: imageData.data, width: imageData.width, height: imageData.height };
}

async function rasterizeViaImageElement(svgText: string): Promise<PixelBuffer> {
  const blob = new Blob([svgText], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = SVG_RASTERIZE_SIZE;
    canvas.height = SVG_RASTERIZE_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('rasterizeViaImageElement: no 2d context available');
    ctx.drawImage(image, 0, 0, SVG_RASTERIZE_SIZE, SVG_RASTERIZE_SIZE);

    const imageData = ctx.getImageData(0, 0, SVG_RASTERIZE_SIZE, SVG_RASTERIZE_SIZE);
    return { data: imageData.data, width: imageData.width, height: imageData.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}
