'use client';

import { generateSimplifiedCandidates } from '../../lib/pipeline/simplify';
import { traceToSvg } from '../../lib/pipeline/trace';
import type { TracedResult } from './UploadStep';

interface SimplifyChooserProps {
  traced: TracedResult;
  onChoose: (svg: string) => void;
  onRejectAll: () => void;
}

export function SimplifyChooser({ traced, onChoose, onRejectAll }: SimplifyChooserProps) {
  const candidates = generateSimplifiedCandidates(traced.pixels, traceToSvg);

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
