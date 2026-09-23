'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  ShieldCheck, 
  FileCheck2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { validateUploadedFile } from '../../lib/upload/validate';
import { removeBackground } from '../../lib/pipeline/remove-background';
import { traceToSvg } from '../../lib/pipeline/trace';
import { downscaleImage } from '../../lib/pipeline/downscale';
import { hasSignificantTransparency } from '../../lib/pipeline/transparency';
import { analyzeSvgComplexity, type ComplexityResult } from '../../lib/svg/complexity';
import type { PixelBuffer } from '../../lib/pipeline/posterize';

export interface TracedResult {
  baseSvg: string;
  complexity: ComplexityResult;
  pixels: PixelBuffer;
  originalFileName?: string;
}

interface UploadStepProps {
  onTraced: (result: TracedResult) => void;
}

export function UploadStep({ onTraced }: UploadStepProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progressLabel, setProgressLabel] = useState('');
  const [progressStep, setProgressStep] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const validation = validateUploadedFile(file);
    if (!validation.ok) {
      setStatus('error');
      setError(validation.error ?? 'Archivo inválido.');
      return;
    }

    setStatus('processing');
    setError(null);
    setProgressStep(1);
    setProgressLabel('Leyendo archivo e inicializando motor...');

    try {
      if (file.type === 'image/svg+xml') {
        setProgressLabel('Procesando vector SVG nativo...');
        setProgressStep(2);
        const svgText = await file.text();
        const pixels = await rasterizeSvgToPixels(svgText);
        const complexity = { ...analyzeSvgComplexity(svgText), isClean: true };
        onTraced({ baseSvg: svgText, complexity, pixels, originalFileName: file.name });
        setStatus('idle');
        return;
      }

      setProgressLabel('Optimizando resolución...');
      setProgressStep(1);
      const downscaled = await downscaleImage(file);
      const rawPixels = await blobToPixels(downscaled);

      let pixels: PixelBuffer;
      if (hasSignificantTransparency(rawPixels)) {
        setProgressLabel('Fondo transparente detectado...');
        setProgressStep(2);
        pixels = rawPixels;
      } else {
        setProgressLabel('Quitando el fondo con IA en tu navegador...');
        setProgressStep(2);
        const cutout = await removeBackground(downscaled);
        pixels = await blobToPixels(cutout);
      }

      setProgressLabel('Vectorizando trazos a SVG...');
      setProgressStep(3);
      const baseSvg = traceToSvg(pixels);
      const complexity = analyzeSvgComplexity(baseSvg);

      onTraced({ baseSvg, complexity, pixels, originalFileName: file.name });
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setError('No pudimos procesar la imagen. Probá con otro archivo o formato.');
      console.error(err);
    }
  }, [onTraced]);

  // Allow pasting an image directly from clipboard (Ctrl+V)
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      if (status === 'processing') return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            void handleFile(file);
            break;
          }
        }
      }
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [status, handleFile]);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (status === 'processing') return;

    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (status !== 'processing') fileInputRef.current?.click();
        }}
        className={`relative border-2 border-dashed rounded-3xl p-10 md:p-14 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01] shadow-2xl shadow-indigo-500/20'
            : status === 'processing'
            ? 'border-zinc-700 bg-zinc-900/40 cursor-wait'
            : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/60 hover:bg-zinc-900/80 shadow-xl'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />

        {status === 'processing' ? (
          <div className="py-8 space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <Loader2 className="w-8 h-8 text-indigo-400 absolute animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-medium text-white tracking-tight">
                {progressLabel || 'Procesando tu imagen...'}
              </h3>
              <p className="text-sm text-zinc-400">
                Todo ocurre en tu máquina. Los modelos corren vía WebAssembly sin enviar datos.
              </p>
            </div>

            {/* Stepper bar */}
            <div className="w-64 max-w-full mx-auto bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${(progressStep / 3) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
                Arrastrá tu logo acá, o hacé clic para explorar
              </h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                También podés pegar una captura o imagen directo con <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono">Ctrl + V</kbd>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {['SVG', 'PNG', 'JPG', 'WebP', 'GIF'].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/60"
                >
                  {fmt}
                </span>
              ))}
              <span className="text-xs text-zinc-500 ml-1">Hasta 10 MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Error notification */}
      {status === 'error' && error && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-start gap-3 animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-red-200">{error}</p>
            <p className="text-red-400/90 text-xs">
              Asegurate de que sea un archivo de imagen válido. Si el fondo es muy complejo, intentá con un archivo más simple o con fondo ya transparente.
            </p>
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-left">
            <p className="text-xs font-medium text-zinc-200">100% Privado y Local</p>
            <p className="text-[11px] text-zinc-400">Tus imágenes nunca suben a ningún servidor</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="text-left">
            <p className="text-xs font-medium text-zinc-200">Kit Completo en .ZIP</p>
            <p className="text-[11px] text-zinc-400">Favicons, SVGs, PNGs, wordmark y paleta</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-3">
          <FileCheck2 className="w-5 h-5 text-blue-400 shrink-0" />
          <div className="text-left">
            <p className="text-xs font-medium text-zinc-200">Soporte SVG Nativo</p>
            <p className="text-[11px] text-zinc-400">Si subís SVG, no se degrada ni se rasteriza</p>
          </div>
        </div>
      </div>
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
