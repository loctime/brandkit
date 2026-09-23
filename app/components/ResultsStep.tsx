'use client';

import { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { generateBrandKit, type GenerateKitInput } from '../../lib/pipeline/generate-kit';

interface ResultsStepProps {
  input: GenerateKitInput;
}

interface DownloadableFile {
  path: string;
  url: string;
}

// TypeScript's Uint8Array is generic over ArrayBufferLike (which includes
// SharedArrayBuffer), but Blob only accepts a plain ArrayBuffer-backed view —
// copy into a fresh, definitely-plain ArrayBuffer to satisfy that.
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer as ArrayBuffer;
}

export function ResultsStep({ input }: ResultsStepProps) {
  const [status, setStatus] = useState<'generating' | 'ready' | 'error'>('generating');
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<DownloadableFile[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const zipBytes = await generateBrandKit(input);
        if (cancelled) return;

        setZipUrl(URL.createObjectURL(new Blob([toArrayBuffer(zipBytes)], { type: 'application/zip' })));

        const zip = await JSZip.loadAsync(zipBytes);
        const entries = await Promise.all(
          Object.values(zip.files)
            .filter((f) => !f.dir)
            .map(async (f) => {
              const blob = await f.async('blob');
              return { path: f.name, url: URL.createObjectURL(blob) };
            })
        );
        if (!cancelled) {
          setFiles(entries);
          setStatus('ready');
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setStatus('error');
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [input]);

  if (status === 'generating') return <p>Generando tu kit de marca…</p>;
  if (status === 'error') return <p role="alert">Algo falló generando el kit. Probá de nuevo.</p>;

  return (
    <div>
      {zipUrl && (
        <a href={zipUrl} download="mi-logo-kit.zip">
          Descargar todo (.zip)
        </a>
      )}
      <ul>
        {files.map((file) => (
          <li key={file.path}>
            <a href={file.url} download={file.path.split('/').pop()}>
              {file.path}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
