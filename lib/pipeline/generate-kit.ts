import { buildColorVariant, type VariantName } from '../color/variants';
import { pickPrimaryBrandColor, type PaletteColor } from '../color/palette';
import type { FontPairing } from '../color/personality';
import { renderWordmarkSvg } from './wordmark';
import { buildIco, type IcoImage } from '../ico/packer';
import { expectedManifestPaths } from '../package/manifest';
import { buildZipBytes, type ZipEntry } from '../package/zip';
import { renderPng, type Background } from './render-raster';
import { renderBrandSheet } from './render-brand-sheet';

const VARIANTS: VariantName[] = ['full-color', 'black', 'white', 'grayscale', 'monochrome'];
const BACKGROUNDS: Background[] = ['transparent', 'white', 'black'];
const PNG_SIZES = [128, 256, 512, 1024];
const FAVICON_SIZES = [16, 32, 48];

export interface GenerateKitInput {
  baseSvg: string;
  brandName: string;
  palette: PaletteColor[];
  fontPairing: FontPairing;
}

export async function generateBrandKit(input: GenerateKitInput): Promise<Uint8Array> {
  const monochromeHex = pickPrimaryBrandColor(input.palette)?.hex ?? '#000000';
  const entries: ZipEntry[] = [];

  const variantSvgs: Record<VariantName, string> = {} as Record<VariantName, string>;
  for (const variant of VARIANTS) {
    variantSvgs[variant] = buildColorVariant(input.baseSvg, variant, monochromeHex);
    entries.push({ path: `svg/logo-${variant}.svg`, data: variantSvgs[variant] });
  }

  for (const variant of VARIANTS) {
    for (const background of BACKGROUNDS) {
      for (const size of PNG_SIZES) {
        const blob = await renderPng(variantSvgs[variant], size, background);
        entries.push({
          path: `png/${variant}/${background}-${size}.png`,
          data: await blobToBytes(blob),
        });
      }
    }
  }

  const faviconPngs: IcoImage[] = [];
  for (const size of FAVICON_SIZES) {
    const blob = await renderPng(variantSvgs['full-color'], size, 'transparent');
    faviconPngs.push({ size, pngData: await blobToBytes(blob) });
  }
  entries.push({ path: 'favicon/favicon.ico', data: buildIco(faviconPngs) });
  entries.push({ path: 'favicon/favicon-16.png', data: faviconPngs[0].pngData });
  entries.push({ path: 'favicon/favicon-32.png', data: faviconPngs[1].pngData });

  const appleTouchBlob = await renderPng(variantSvgs['full-color'], 180, 'white');
  entries.push({ path: 'favicon/apple-touch-icon.png', data: await blobToBytes(appleTouchBlob) });

  const android192 = await renderPng(variantSvgs['full-color'], 192, 'transparent');
  entries.push({ path: 'favicon/android-chrome-192.png', data: await blobToBytes(android192) });
  const android512 = await renderPng(variantSvgs['full-color'], 512, 'transparent');
  entries.push({ path: 'favicon/android-chrome-512.png', data: await blobToBytes(android512) });

  const wordmarkSvg = renderWordmarkSvg(input.brandName, input.fontPairing);
  entries.push({ path: 'wordmark/wordmark.svg', data: wordmarkSvg });
  for (const background of BACKGROUNDS) {
    const blob = await renderPng(wordmarkSvg, 480, background);
    entries.push({ path: `wordmark/wordmark-${background}.png`, data: await blobToBytes(blob) });
  }

  const brandSheetBlob = await renderBrandSheet({
    logoSvg: variantSvgs['full-color'],
    palette: input.palette,
    fontPairing: input.fontPairing,
  });
  entries.push({ path: 'guia-de-marca.png', data: await blobToBytes(brandSheetBlob) });

  assertMatchesManifest(entries);
  return buildZipBytes(entries);
}

async function blobToBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

function assertMatchesManifest(entries: ZipEntry[]): void {
  const producedPaths = new Set(entries.map((e) => e.path));
  const missing = expectedManifestPaths().filter((path) => !producedPaths.has(path));
  if (missing.length > 0) {
    throw new Error(`generateBrandKit: missing expected paths: ${missing.join(', ')}`);
  }
}
