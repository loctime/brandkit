'use client';

import { useMemo, useState } from 'react';
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

  // The complexity that drives personality inference must reflect the SVG
  // that was actually approved — a chosen simplified candidate is far less
  // detailed than the original raw trace, and reusing the original's stale
  // complexity would skew the wordmark's font pairing toward the wrong flavor.
  const approvedComplexity = useMemo(
    () => (approvedSvg ? analyzeSvgComplexity(approvedSvg) : null),
    [approvedSvg]
  );

  if (typeof window !== 'undefined' && !isWasmSupported()) {
    return (
      <main>
        <h1>BrandKit</h1>
        <p role="alert">
          Tu navegador no soporta el procesamiento necesario. Probá con Chrome, Edge o Firefox
          actualizado.
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1>BrandKit</h1>
      {!traced && <UploadStep onTraced={handleTraced} />}
      {traced && !approvedSvg && (
        <SimplifyChooser
          traced={traced}
          onChoose={(svg) => setApprovedSvg(svg)}
          onRejectAll={handleReset}
        />
      )}
      {approvedSvg && traced && approvedComplexity && !brandInfo && (
        <BrandInputs
          logoPixels={traced.pixels}
          complexity={approvedComplexity}
          onReady={setBrandInfo}
        />
      )}
      {brandInfo && approvedSvg && (
        <ResultsStep input={{ baseSvg: approvedSvg, ...brandInfo }} />
      )}
    </main>
  );
}
