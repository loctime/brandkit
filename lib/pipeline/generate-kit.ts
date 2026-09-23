import { buildColorVariant, type VariantName } from '../color/variants';
import type { PaletteColor } from '../color/palette';
import type { FontPairing } from '../color/personality';
import { renderWordmarkSvg } from './wordmark';
import { buildIco, type IcoImage } from '../ico/packer';
import { expectedManifestPaths } from '../package/manifest';
import { buildZipBytes, type ZipEntry } from '../package/zip';
import { renderPng, renderRectPng, type Background } from './render-raster';
import { getSvgAspectRatio } from '../svg/aspect-ratio';
import { renderBrandSheet } from './render-brand-sheet';
import { 
  renderHorizontalLayoutSvg, 
  renderVerticalLayoutSvg, 
  renderBadgeLayoutSvg,
  renderAppIconLayoutSvg 
} from './layouts';
import { renderPatternSvg } from './patterns';
import { renderLinkedInBannerSvg, renderTwitterBannerSvg } from './banners';
import { renderGoldFoilSvg, renderNeonGlowSvg, renderStampGrungeSvg } from './styles';

const VARIANTS: VariantName[] = ['full-color', 'black', 'white', 'grayscale', 'monochrome'];
const BACKGROUNDS: Background[] = ['transparent', 'white', 'black'];
const PNG_SIZES = [128, 256, 512, 1024];
const FAVICON_SIZES = [16, 32, 48];

export interface GenerateKitInput {
  baseSvg: string;
  brandName: string;
  palette: PaletteColor[];
  primaryColor: PaletteColor;
  fontPairing: FontPairing;
}

export async function generateBrandKit(input: GenerateKitInput): Promise<Uint8Array> {
  const monochromeHex = input.primaryColor?.hex ?? '#000000';
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
    const wordmarkForBg =
      background === 'black' ? renderWordmarkSvg(input.brandName, input.fontPairing, '#f5f5f5') : wordmarkSvg;
    const blob = await renderPng(wordmarkForBg, 480, background);
    entries.push({ path: `wordmark/wordmark-${background}.png`, data: await blobToBytes(blob) });
  }

  const brandSheetBlob = await renderBrandSheet({
    logoSvg: variantSvgs['full-color'],
    palette: input.palette,
    fontPairing: input.fontPairing,
  });
  entries.push({ path: 'guia-de-marca.png', data: await blobToBytes(brandSheetBlob) });

  // 1. Layouts (Combined Icon + Wordmark)
  const horizontalSvg = renderHorizontalLayoutSvg({
    logoSvg: variantSvgs['full-color'],
    brandName: input.brandName,
    fontPairing: input.fontPairing,
  });
  entries.push({ path: 'layouts/logo-horizontal.svg', data: horizontalSvg });
  // The horizontal layout's own width is dynamic (it grows with the brand
  // name's length) — rendering it into a hardcoded rect stretched/squished
  // it whenever that width wasn't exactly 800. Reading the SVG's real size
  // keeps the PNG an undistorted match of the SVG it's exported alongside.
  const horizontalSize = getSvgAspectRatio(horizontalSvg);
  const horizontalBlob = await renderRectPng(horizontalSvg, horizontalSize.width, horizontalSize.height, 'transparent');
  entries.push({ path: 'layouts/logo-horizontal.png', data: await blobToBytes(horizontalBlob) });

  const verticalSvg = renderVerticalLayoutSvg({
    logoSvg: variantSvgs['full-color'],
    brandName: input.brandName,
    fontPairing: input.fontPairing,
    primaryColor: monochromeHex,
  });
  entries.push({ path: 'layouts/logo-vertical.svg', data: verticalSvg });
  const verticalBlob = await renderPng(verticalSvg, 600, 'transparent');
  entries.push({ path: 'layouts/logo-vertical.png', data: await blobToBytes(verticalBlob) });

  const badgeSvg = renderBadgeLayoutSvg({
    logoSvg: variantSvgs['full-color'],
    brandName: input.brandName,
    fontPairing: input.fontPairing,
    primaryColor: monochromeHex,
  });
  entries.push({ path: 'layouts/logo-badge.svg', data: badgeSvg });
  const badgeBlob = await renderPng(badgeSvg, 600, 'transparent');
  entries.push({ path: 'layouts/logo-badge.png', data: await blobToBytes(badgeBlob) });

  const appIconSvg = renderAppIconLayoutSvg({
    logoSvg: variantSvgs['full-color'],
    brandName: input.brandName,
    fontPairing: input.fontPairing,
    primaryColor: monochromeHex,
  });
  entries.push({ path: 'layouts/logo-app-icon.svg', data: appIconSvg });
  const appIconBlob = await renderPng(appIconSvg, 512, 'transparent');
  entries.push({ path: 'layouts/logo-app-icon.png', data: await blobToBytes(appIconBlob) });

  // 2. Social Media Banners
  const liBannerSvg = renderLinkedInBannerSvg({
    logoSvg: variantSvgs['full-color'],
    brandName: input.brandName,
    fontPairing: input.fontPairing,
    primaryColor: monochromeHex,
  });
  entries.push({ path: 'banners/banner-linkedin.svg', data: liBannerSvg });
  const liBannerBlob = await renderRectPng(liBannerSvg, 1584, 396, 'black');
  entries.push({ path: 'banners/banner-linkedin.png', data: await blobToBytes(liBannerBlob) });

  const twBannerSvg = renderTwitterBannerSvg({
    logoSvg: variantSvgs['full-color'],
    brandName: input.brandName,
    fontPairing: input.fontPairing,
    primaryColor: monochromeHex,
  });
  entries.push({ path: 'banners/banner-twitter.svg', data: twBannerSvg });
  const twBannerBlob = await renderRectPng(twBannerSvg, 1500, 500, 'black');
  entries.push({ path: 'banners/banner-twitter.png', data: await blobToBytes(twBannerBlob) });

  // 3. Brand Patterns & Wallpapers
  const monogramDesktopSvg = renderPatternSvg({
    logoSvg: variantSvgs['white'],
    bgColor: '#090a0f',
    opacity: 0.08,
    width: 1920,
    height: 1080,
    tileScale: 120,
  });
  entries.push({ path: 'fondos/patron-monograma-desktop.svg', data: monogramDesktopSvg });
  const monogramDesktopBlob = await renderRectPng(monogramDesktopSvg, 1920, 1080, 'black');
  entries.push({ path: 'fondos/patron-monograma-desktop.png', data: await blobToBytes(monogramDesktopBlob) });

  const monogramMobileSvg = renderPatternSvg({
    logoSvg: variantSvgs['white'],
    bgColor: '#090a0f',
    opacity: 0.08,
    width: 1080,
    height: 1920,
    tileScale: 100,
  });
  entries.push({ path: 'fondos/patron-monograma-mobile.svg', data: monogramMobileSvg });
  const monogramMobileBlob = await renderRectPng(monogramMobileSvg, 1080, 1920, 'black');
  entries.push({ path: 'fondos/patron-monograma-mobile.png', data: await blobToBytes(monogramMobileBlob) });

  // 4. Textured & Aesthetic Styles
  const goldFoilSvg = renderGoldFoilSvg(variantSvgs['full-color']);
  entries.push({ path: 'estilos/logo-dorado.svg', data: goldFoilSvg });
  const goldBlob = await renderPng(goldFoilSvg, 512, 'black');
  entries.push({ path: 'estilos/logo-dorado.png', data: await blobToBytes(goldBlob) });

  const neonGlowSvg = renderNeonGlowSvg(variantSvgs['full-color'], monochromeHex);
  entries.push({ path: 'estilos/logo-neon.svg', data: neonGlowSvg });
  const neonBlob = await renderPng(neonGlowSvg, 512, 'black');
  entries.push({ path: 'estilos/logo-neon.png', data: await blobToBytes(neonBlob) });

  const stampSvg = renderStampGrungeSvg(variantSvgs['full-color'], '#1f2937');
  entries.push({ path: 'estilos/logo-sello.svg', data: stampSvg });
  const stampBlob = await renderPng(stampSvg, 512, 'white');
  entries.push({ path: 'estilos/logo-sello.png', data: await blobToBytes(stampBlob) });

  // 5. Pack para Canva (Capas sueltas)
  entries.push({
    path: 'para-canva/01-isotipo-hd.png',
    data: await blobToBytes(await renderPng(variantSvgs['full-color'], 1024, 'transparent')),
  });
  entries.push({
    path: 'para-canva/02-wordmark-hd.png',
    data: await blobToBytes(await renderPng(wordmarkSvg, 1024, 'transparent')),
  });

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
