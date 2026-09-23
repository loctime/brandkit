'use client';

import { UploadStep, type TracedResult } from './components/UploadStep';

export default function Home() {
  function handleTraced(result: TracedResult) {
    console.log('traced result', result);
  }

  return (
    <main>
      <h1>BrandKit</h1>
      <UploadStep onTraced={handleTraced} />
    </main>
  );
}
