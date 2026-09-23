'use client';

import { useState } from 'react';
import { validateUploadedFile } from '../../lib/upload/validate';
import { removeBackground } from '../../lib/pipeline/remove-background';
import { traceToSvg } from '../../lib/pipeline/trace';
import { analyzeSvgComplexity, type ComplexityResult } from '../../lib/svg/complexity';
import type { PixelBuffer } from '../../lib/pipeline/posterize';

export interface TracedResult {
  baseSvg: string;
  complexity: ComplexityResult;
  pixels: PixelBuffer;
}

interface UploadStepProps {
  onTraced: (result: TracedResult) => void;
}

export function UploadStep({ onTraced }: UploadStepProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progressLabel, setProgressLabel] = useState('');

  async function handleFile(file: File) {
    const validation = validateUploadedFile(file);
    if (!validation.ok) {
      setStatus('error');
      setError(validation.error ?? 'Archivo inválido.');
      return;
    }

    setStatus('processing');
    setError(null);

    try {
      // An uploaded SVG is already vector: skip background-removal/tracing
      // and use it directly instead of degrading it through the raster path.
      if (file.type === 'image/svg+xml') {
        const svgText = await file.text();
        const pixels = await rasterizeSvgToPixels(svgText);
        const complexity = analyzeSvgComplexity(svgText);
        onTraced({ baseSvg: svgText, complexity, pixels });
        setStatus('idle');
        return;
      }

      setProgressLabel('Quitando el fondo…');
      const cutout = await removeBackground(file);

      setProgressLabel('Vectorizando…');
      const pixels = await blobToPixels(cutout);
      const baseSvg = traceToSvg(pixels);
      const complexity = analyzeSvgComplexity(baseSvg);

      onTraced({ baseSvg, complexity, pixels });
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setError('No pudimos procesar la imagen. Probá con otro archivo.');
      console.error(err);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      {status === 'processing' && <p>{progressLabel || 'Procesando…'}</p>}
      {status === 'error' && error && <p role="alert">{error}</p>}
    </div>
  );
}

async function blobToPixels(blob: Blob): Promise<PixelBuffer> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('blobToPixels: no 2d context available');
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  return { data: imageData.data, width: imageData.width, height: imageData.height };
}

const SVG_RASTERIZE_SIZE = 512;

// createImageBitmap fails to decode an SVG that has no explicit width/height
// (only a viewBox — very common for hand-authored or exported icons), so SVGs
// are rasterized via <img> + canvas at a fixed size instead, which tolerates
// a dimension-less source.
async function rasterizeSvgToPixels(svgText: string): Promise<PixelBuffer> {
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
    if (!ctx) throw new Error('rasterizeSvgToPixels: no 2d context available');
    ctx.drawImage(image, 0, 0, SVG_RASTERIZE_SIZE, SVG_RASTERIZE_SIZE);

    const imageData = ctx.getImageData(0, 0, SVG_RASTERIZE_SIZE, SVG_RASTERIZE_SIZE);
    return { data: imageData.data, width: imageData.width, height: imageData.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}
