'use client';

import { useMemo, useState } from 'react';
import { Layers, ArrowLeft, Check } from 'lucide-react';
import { generateSimplifiedCandidates } from '../../lib/pipeline/simplify';
import { traceToSvg } from '../../lib/pipeline/trace';
import type { TracedResult } from './UploadStep';

interface SimplifyChooserProps {
  traced: TracedResult;
  onChoose: (svg: string) => void;
  onRejectAll: () => void;
}

export function SimplifyChooser({ traced, onChoose, onRejectAll }: SimplifyChooserProps) {
  const [bgMode, setBgMode] = useState<'checker' | 'white' | 'black'>('checker');

  const candidates = useMemo(
    () => generateSimplifiedCandidates(traced.pixels, traceToSvg),
    [traced.pixels]
  );

  const levelLabels: Record<number, { title: string; desc: string }> = {
    2: { title: 'Simplificación alta', desc: 'Silueta limpia y contraste marcado (2 tonos)' },
    4: { title: 'Simplificación balanceada', desc: 'Equilibrio entre detalle y vectores nítidos (4 tonos)' },
    8: { title: 'Detalle extendido', desc: 'Conserva más gradientes y trazos finos (8 tonos)' },
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Alert Header */}
      <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-amber-100">
              Logo complejo detectado
            </h2>
            <p className="text-sm text-amber-300/90">
              La imagen contiene muchos detalles o gradientes. Para asegurar que los favicons y vectores queden impecables, generamos 3 variantes optimizadas.
            </p>
          </div>
        </div>

        {/* Background preview switcher */}
        <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
          <span className="text-xs text-amber-300 font-medium">Previsualizar sobre fondo:</span>
          <div className="flex items-center gap-1.5 bg-zinc-950/60 p-1 rounded-xl border border-amber-500/20">
            <button
              type="button"
              onClick={() => setBgMode('checker')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                bgMode === 'checker' ? 'bg-amber-500/30 text-amber-200' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Ajedrez
            </button>
            <button
              type="button"
              onClick={() => setBgMode('white')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                bgMode === 'white' ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Blanco
            </button>
            <button
              type="button"
              onClick={() => setBgMode('black')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                bgMode === 'black' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Oscuro
            </button>
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {candidates.map((candidate) => {
          const info = levelLabels[candidate.levels] ?? {
            title: `Nivel ${candidate.levels}`,
            desc: `${candidate.levels} tonos posterizados`,
          };

          return (
            <div
              key={candidate.levels}
              className="flex flex-col bg-zinc-900/70 border border-zinc-800 hover:border-indigo-500/60 rounded-3xl p-5 transition-all duration-300 group shadow-lg"
            >
              {/* Preview frame */}
              <div
                className={`relative w-full aspect-square rounded-2xl overflow-hidden flex items-center justify-center p-6 border border-zinc-800/80 transition-all ${
                  bgMode === 'checker'
                    ? 'checker-bg'
                    : bgMode === 'white'
                    ? 'bg-white'
                    : 'bg-zinc-950'
                }`}
              >
                <div
                  className="preview-svg w-full h-full flex items-center justify-center pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: candidate.svgMarkup }}
                />
              </div>

              {/* Info & action */}
              <div className="mt-5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                    {info.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {info.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onChoose(candidate.svgMarkup)}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
                >
                  <Check className="w-4 h-4" />
                  Elegir esta versión
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reject all / re-upload */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onRejectAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-sm text-zinc-400 hover:text-zinc-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Ninguna me sirve, quiero subir otra imagen
        </button>
      </div>
    </div>
  );
}
