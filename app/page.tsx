'use client';

import { useState } from 'react';
import { UploadStep, type TracedResult } from './components/UploadStep';
import { SimplifyChooser } from './components/SimplifyChooser';

export default function Home() {
  const [traced, setTraced] = useState<TracedResult | null>(null);
  const [approvedSvg, setApprovedSvg] = useState<string | null>(null);

  function handleTraced(result: TracedResult) {
    setTraced(result);
    if (result.complexity.isClean) {
      setApprovedSvg(result.baseSvg);
    }
  }

  function handleReset() {
    setTraced(null);
    setApprovedSvg(null);
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
      {approvedSvg && <p>Logo aprobado, listo para generar el kit.</p>}
    </main>
  );
}
