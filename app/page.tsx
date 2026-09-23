'use client';

import { useState } from 'react';
import { UploadStep, type TracedResult } from './components/UploadStep';
import { SimplifyChooser } from './components/SimplifyChooser';
import { BrandInputs } from './components/BrandInputs';
import { ResultsStep } from './components/ResultsStep';
import type { PaletteColor } from '../lib/color/palette';
import type { FontPairing } from '../lib/color/personality';

interface BrandInfo {
  brandName: string;
  palette: PaletteColor[];
  fontPairing: FontPairing;
}

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
      {approvedSvg && traced && !brandInfo && (
        <BrandInputs
          logoPixels={traced.pixels}
          complexity={traced.complexity}
          onReady={setBrandInfo}
        />
      )}
      {brandInfo && approvedSvg && (
        <ResultsStep input={{ baseSvg: approvedSvg, ...brandInfo }} />
      )}
    </main>
  );
}
