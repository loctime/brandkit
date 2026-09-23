'use client';

import { useMemo, useState } from 'react';
import { 
  Type, 
  Palette, 
  Sparkles, 
  Upload, 
  X, 
  Check, 
  FileImage, 
  SlidersHorizontal,
  Loader2
} from 'lucide-react';
import { extractPalette, pickPrimaryBrandColor, type PaletteColor } from '../../lib/color/palette';
import { normalizePalette, mergePalettes } from '../../lib/color/merge-palette';
import { inferPersonality, fontPairingFor, type FontPairing, type PersonalityCategory } from '../../lib/color/personality';
import { renderWordmarkSvg } from '../../lib/pipeline/wordmark';
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

const LOGO_PALETTE_WEIGHT = 3;

const PERSONALITY_DESCRIPTIONS: Record<PersonalityCategory, { label: string; desc: string }> = {
  'geometric-modern': {
    label: 'Geométrica Moderna',
    desc: 'Líneas limpias, minimalistas y alta legibilidad digital.',
  },
  'classic-serif': {
    label: 'Clásica con Serif',
    desc: 'Elegancia tradicional, confianza y tono editorial.',
  },
  'friendly-rounded': {
    label: 'Amigable Redondeada',
    desc: 'Trazos suaves, calidez, accesibilidad y tono cercano.',
  },
  'technical-industrial': {
    label: 'Técnica e Industrial',
    desc: 'Estructurada, monolítica y precisión de ingeniería.',
  },
  'bold-display': {
    label: 'Display Audaz',
    desc: 'Alto impacto visual, peso fuerte y presencia dominante.',
  },
};

export function BrandInputs({ logoPixels, complexity, onReady }: BrandInputsProps) {
  const [brandName, setBrandName] = useState('');
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Initial fast extraction for instant visual feedback
  const initialLogoPalette = useMemo(() => extractPalette(logoPixels), [logoPixels]);
  const initialPrimary = useMemo(() => pickPrimaryBrandColor(initialLogoPalette), [initialLogoPalette]);
  const initialPersonality = useMemo(() => inferPersonality(initialLogoPalette, complexity), [initialLogoPalette, complexity]);
  const initialPairing = useMemo(() => fontPairingFor(initialPersonality), [initialPersonality]);

  // Live wordmark preview SVG
  const wordmarkPreviewSvg = useMemo(() => {
    return renderWordmarkSvg(brandName, initialPairing, '#f3f4f6');
  }, [brandName, initialPairing]);

  function copyColor(hex: string) {
    void navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  }

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files ?? []);
    if (newFiles.length > 0) {
      setReferenceFiles((prev) => [...prev, ...newFiles]);
    }
  }

  function removeReferenceFile(index: number) {
    setReferenceFiles((prev) => prev.filter((_, i) => i !== index));
  }

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

  const personalityInfo = PERSONALITY_DESCRIPTIONS[initialPersonality] ?? {
    label: initialPersonality,
    desc: 'Tipografía calibrada para tu marca',
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Color & Personality Insights */}
        <div className="md:col-span-5 space-y-6">
          {/* Palette Card */}
          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-zinc-200">
                <Palette className="w-4 h-4 text-indigo-400" />
                <span>Paleta detectada</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">Hacé clic para copiar HEX</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {initialLogoPalette.map((color) => {
                const isPrimary = color.hex === initialPrimary.hex;
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => copyColor(color.hex)}
                    title={`Copiar ${color.hex}`}
                    className="group relative flex flex-col items-center gap-1.5 focus:outline-none"
                  >
                    <div
                      className="w-full aspect-square rounded-2xl border border-white/10 group-hover:scale-105 group-hover:shadow-lg transition-transform flex items-center justify-center relative overflow-hidden"
                      style={{ backgroundColor: color.hex }}
                    >
                      {copiedHex === color.hex && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center text-white">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 group-hover:text-zinc-200 uppercase">
                      {color.hex}
                    </span>
                    {isPrimary && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-medium leading-none">
                        Principal
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Personality Card */}
          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-3 shadow-xl">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-zinc-200">
              <SlidersHorizontal className="w-4 h-4 text-purple-400" />
              <span>Personalidad de marca</span>
            </div>

            <div className="space-y-1">
              <p className="text-base font-medium text-white">{personalityInfo.label}</p>
              <p className="text-xs text-zinc-400 leading-relaxed">{personalityInfo.desc}</p>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Fuentes sugeridas:</span>
              <span className="font-medium text-zinc-300">
                {initialPairing.heading} + {initialPairing.body}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Brand Name & References */}
        <div className="md:col-span-7 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-6 shadow-xl">
            {/* Brand Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-200">
                Nombre de tu marca o proyecto
              </label>
              <input
                type="text"
                placeholder="Ej. Acantilado, Lumina, Studio..."
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-zinc-500 text-sm outline-none transition-all"
              />
              <p className="text-xs text-zinc-500">
                Se usará para generar los wordmarks vectoriales y la ficha de marca.
              </p>
            </div>

            {/* Wordmark Live Preview */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-indigo-400" />
                Previsualización del Wordmark
              </span>
              <div className="w-full h-24 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-center p-4 overflow-hidden">
                <div
                  className="preview-svg max-w-full max-h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: wordmarkPreviewSvg }}
                />
              </div>
            </div>

            {/* Reference Images (Optional) */}
            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-zinc-200">
                  Imágenes de referencia o moodboard <span className="text-xs text-zinc-500 font-normal">(opcional)</span>
                </label>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {referenceFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-zinc-300"
                  >
                    <FileImage className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeReferenceFile(idx)}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-zinc-700 hover:border-indigo-500 bg-zinc-950/60 hover:bg-zinc-900 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Sumar referencias</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileAdd}
                  />
                </label>
              </div>
              <p className="text-[11px] text-zinc-500">
                Si subís capturas o fotos, las agregamos al análisis de colores para calibrar la guía.
              </p>
            </div>

            {/* Action Submit */}
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSubmit()}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/25 transition-all"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analizando y calibrando kit...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generar Brand Kit completo (76 archivos)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const SVG_RASTERIZE_SIZE = 512;

async function fileToPixels(file: File): Promise<PixelBuffer> {
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
