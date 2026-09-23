const VARIANTS = ['full-color', 'black', 'white', 'grayscale', 'monochrome'] as const;
const BACKGROUNDS = ['transparent', 'white', 'black'] as const;
const PNG_SIZES = [128, 256, 512, 1024] as const;

export function expectedManifestPaths(): string[] {
  const paths: string[] = [
    'favicon/favicon.ico',
    'favicon/favicon-16.png',
    'favicon/favicon-32.png',
    'favicon/apple-touch-icon.png',
    'favicon/android-chrome-192.png',
    'favicon/android-chrome-512.png',
    ...VARIANTS.map((v) => `svg/logo-${v}.svg`),
    'wordmark/wordmark.svg',
    ...BACKGROUNDS.map((bg) => `wordmark/wordmark-${bg}.png`),
    'guia-de-marca.png',
  ];

  for (const variant of VARIANTS) {
    for (const bg of BACKGROUNDS) {
      for (const size of PNG_SIZES) {
        paths.push(`png/${variant}/${bg}-${size}.png`);
      }
    }
  }

  return paths;
}
