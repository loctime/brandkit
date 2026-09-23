'use client';

import { useMemo } from 'react';
import { generateSimplifiedCandidates } from '../../lib/pipeline/simplify';
import { traceToSvg } from '../../lib/pipeline/trace';
import type { TracedResult } from './UploadStep';

interface SimplifyChooserProps {
  traced: TracedResult;
  onChoose: (svg: string) => void;
  onRejectAll: () => void;
}

export function SimplifyChooser({ traced, onChoose, onRejectAll }: SimplifyChooserProps) {
  // generateSimplifiedCandidates runs 3 posterize+trace passes over the full
  // pixel buffer — expensive enough that it must not re-run on every render.
  const candidates = useMemo(
    () => generateSimplifiedCandidates(traced.pixels, traceToSvg),
    [traced.pixels]
  );

  return (
    <div>
      <p>
        Tu logo es complejo para vectorizarlo de forma limpia. Elegí una versión
        simplificada, o subí una imagen más simple.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {candidates.map((candidate) => (
          <button
            key={candidate.levels}
            type="button"
            className="simplify-candidate"
            onClick={() => onChoose(candidate.svgMarkup)}
            dangerouslySetInnerHTML={{ __html: candidate.svgMarkup }}
          />
        ))}
      </div>
      <button type="button" onClick={onRejectAll}>
        Ninguna me sirve, quiero subir otra imagen
      </button>
    </div>
  );
}
