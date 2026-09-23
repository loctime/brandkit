'use client';

import { useMemo, useState } from 'react';
import { Sparkles, Shield, RefreshCw } from 'lucide-react';
import { UploadStep, type TracedResult } from './components/UploadStep';
import { SimplifyChooser } from './components/SimplifyChooser';
import { BrandInputs, type BrandInfoResult } from './components/BrandInputs';
import { ResultsStep } from './components/ResultsStep';
import { isWasmSupported } from '../lib/upload/browser-support';
import { analyzeSvgComplexity } from '../lib/svg/complexity';

type BrandInfo = BrandInfoResult;

export default function Home() {
  const [traced, setTraced] = useState<TracedResult | null>(null);
  const [approvedSvg, setApprovedSvg] = useState<string | null>(null);
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);

  function handleTraced(result: TracedResult) {
    setTraced(result);
    if (result.complexity.isClean) {
      setApprovedSvg(result.baseSvg);
    }
  }

  function handleReset() {
    setTraced(null);
    setApprovedSvg(null);
    setBrandInfo(null);
  }

  const approvedComplexity = useMemo(
    () => (approvedSvg ? analyzeSvgComplexity(approvedSvg) : null),
    [approvedSvg]
  );

  const currentStep = useMemo(() => {
    if (brandInfo && approvedSvg) return 3;
    if (approvedSvg && traced) return 2;
    return 1;
  }, [brandInfo, approvedSvg, traced]);

  if (typeof window !== 'undefined' && !isWasmSupported()) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white">Navegador no compatible</h1>
          <p className="text-sm text-zinc-400" role="alert">
            Tu navegador no soporta WebAssembly necesario para procesar vectores y quitar fondos de forma local. Probá con Chrome, Edge o Firefox actualizado.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            onClick={handleReset}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">BrandKit</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                100% Client-side
              </span>
            </div>
          </div>

          {/* Stepper indicator */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-indigo-400' : 'text-zinc-600'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 1 ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300' : 'bg-zinc-800 text-zinc-500'}`}>
                1
              </span>
              <span>Subir logo</span>
            </div>

            <span className="w-4 h-px bg-zinc-800" />

            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-indigo-400' : 'text-zinc-600'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300' : 'bg-zinc-800 text-zinc-500'}`}>
                2
              </span>
              <span>Calibrar marca</span>
            </div>

            <span className="w-4 h-px bg-zinc-800" />

            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-indigo-400' : 'text-zinc-600'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 3 ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300' : 'bg-zinc-800 text-zinc-500'}`}>
                3
              </span>
              <span>Brand Studio</span>
            </div>
          </div>

          {/* Right Action */}
          <div>
            {traced && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Nuevo kit</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 md:py-12 flex flex-col justify-center">
        {/* Hero title when in Upload step */}
        {!traced && (
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Generá tu Brand Kit completo en segundos
            </h1>
            <p className="text-base text-zinc-400">
              Subí cualquier logo y obtené favicons, vectores SVG en 5 variantes, 60 PNGs en todos los fondos, wordmarks tipográficos y ficha de marca. Sin servidores ni registro.
            </p>
          </div>
        )}

        {/* Step 1: Upload */}
        {!traced && <UploadStep onTraced={handleTraced} />}

        {/* Step 1.5: Simplify Chooser (if logo is complex) */}
        {traced && !approvedSvg && (
          <SimplifyChooser
            traced={traced}
            onChoose={(svg) => setApprovedSvg(svg)}
            onRejectAll={handleReset}
          />
        )}

        {/* Step 2: Brand Inputs */}
        {approvedSvg && traced && approvedComplexity && !brandInfo && (
          <BrandInputs
            logoPixels={traced.pixels}
            complexity={approvedComplexity}
            onReady={setBrandInfo}
          />
        )}

        {/* Step 3: Brand Studio Results */}
        {brandInfo && approvedSvg && (
          <ResultsStep 
            input={{ baseSvg: approvedSvg, ...brandInfo }} 
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}
