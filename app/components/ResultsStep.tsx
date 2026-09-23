/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, useMemo } from 'react';
import JSZip from 'jszip';
import { 
  Download, 
  FileArchive, 
  Layers, 
  Palette, 
  Type, 
  Laptop, 
  FolderTree, 
  RefreshCw, 
  Check, 
  Sparkles,
  Search,
  FileCode2,
  FileImage,
  Maximize2,
  Monitor,
  Smartphone,
  Share2,
  Wand2
} from 'lucide-react';
import { generateBrandKit, type GenerateKitInput } from '../../lib/pipeline/generate-kit';

interface ResultsStepProps {
  input: GenerateKitInput;
  onReset?: () => void;
}

interface DownloadableFile {
  path: string;
  url: string;
  size: number;
  text?: string;
}

type TabType = 
  | 'sheet' 
  | 'layouts' 
  | 'banners' 
  | 'styles' 
  | 'patterns' 
  | 'variants' 
  | 'favicons' 
  | 'wordmark' 
  | 'explorer';

function getMimeType(path: string): string {
  if (path.endsWith('.svg')) return 'image/svg+xml';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream';
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer as ArrayBuffer;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResultsStep({ input, onReset }: ResultsStepProps) {
  const [status, setStatus] = useState<'generating' | 'ready' | 'error'>('generating');
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [zipSize, setZipSize] = useState<number>(0);
  const [files, setFiles] = useState<DownloadableFile[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('sheet');

  // Interactive controls for Variants Tab
  const [selectedVariant, setSelectedVariant] = useState<string>('full-color');
  const [variantBg, setVariantBg] = useState<'checker' | 'white' | 'black'>('checker');

  // Interactive controls for Layouts Tab
  const [selectedLayout, setSelectedLayout] = useState<'horizontal' | 'vertical' | 'badge' | 'appIcon'>('horizontal');
  const [layoutBg, setLayoutBg] = useState<'checker' | 'white' | 'black'>('checker');

  // Search filter for file explorer tab
  const [fileSearch, setFileSearch] = useState('');

  // Zoom modal for brand sheet
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const zipBytes = await generateBrandKit(input);
        if (cancelled) return;

        setZipSize(zipBytes.length);
        setZipUrl(URL.createObjectURL(new Blob([toArrayBuffer(zipBytes)], { type: 'application/zip' })));

        const zip = await JSZip.loadAsync(zipBytes);
        const entries = await Promise.all(
          Object.values(zip.files)
            .filter((f) => !f.dir)
            .map(async (f) => {
              const bytes = await f.async('uint8array');
              const mimeType = getMimeType(f.name);
              const blob = new Blob([toArrayBuffer(bytes)], { type: mimeType });
              const text = f.name.endsWith('.svg') ? await f.async('string') : undefined;
              return { 
                path: f.name, 
                url: URL.createObjectURL(blob), 
                size: blob.size,
                text
              };
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

  // Quick lookups
  const filesMap = useMemo(() => {
    const map = new Map<string, DownloadableFile>();
    for (const f of files) map.set(f.path, f);
    return map;
  }, [files]);

  const brandSheet = filesMap.get('guia-de-marca.png');
  const selectedVariantSvg = filesMap.get(`svg/logo-${selectedVariant}.svg`);
  const faviconIco = filesMap.get('favicon/favicon.ico');
  const favicon32 = filesMap.get('favicon/favicon-32.png');
  const appleIcon = filesMap.get('favicon/apple-touch-icon.png');
  const android512 = filesMap.get('favicon/android-chrome-512.png');
  const wordmarkSvg = filesMap.get('wordmark/wordmark.svg');
  const wordmarkTransparent = filesMap.get('wordmark/wordmark-transparent.png');
  const wordmarkWhite = filesMap.get('wordmark/wordmark-white.png');
  const wordmarkBlack = filesMap.get('wordmark/wordmark-black.png');

  // Layouts lookups
  const layoutHorizontalSvg = filesMap.get('layouts/logo-horizontal.svg');
  const layoutHorizontalPng = filesMap.get('layouts/logo-horizontal.png');
  const layoutVerticalSvg = filesMap.get('layouts/logo-vertical.svg');
  const layoutVerticalPng = filesMap.get('layouts/logo-vertical.png');
  const layoutBadgeSvg = filesMap.get('layouts/logo-badge.svg');
  const layoutBadgePng = filesMap.get('layouts/logo-badge.png');
  const layoutAppIconSvg = filesMap.get('layouts/logo-app-icon.svg');
  const layoutAppIconPng = filesMap.get('layouts/logo-app-icon.png');

  // Banners lookups
  const bannerLiSvg = filesMap.get('banners/banner-linkedin.svg');
  const bannerLiPng = filesMap.get('banners/banner-linkedin.png');
  const bannerTwSvg = filesMap.get('banners/banner-twitter.svg');
  const bannerTwPng = filesMap.get('banners/banner-twitter.png');

  // Styles lookups
  const styleGoldSvg = filesMap.get('estilos/logo-dorado.svg');
  const styleGoldPng = filesMap.get('estilos/logo-dorado.png');
  const styleNeonSvg = filesMap.get('estilos/logo-neon.svg');
  const styleNeonPng = filesMap.get('estilos/logo-neon.png');
  const styleStampSvg = filesMap.get('estilos/logo-sello.svg');
  const styleStampPng = filesMap.get('estilos/logo-sello.png');

  // Patterns lookups
  const patternDesktopSvg = filesMap.get('fondos/patron-monograma-desktop.svg');
  const patternDesktopPng = filesMap.get('fondos/patron-monograma-desktop.png');
  const patternMobileSvg = filesMap.get('fondos/patron-monograma-mobile.svg');
  const patternMobilePng = filesMap.get('fondos/patron-monograma-mobile.png');

  const filteredFiles = useMemo(() => {
    if (!fileSearch.trim()) return files;
    const q = fileSearch.toLowerCase();
    return files.filter((f) => f.path.toLowerCase().includes(q));
  }, [files, fileSearch]);

  if (status === 'generating') {
    return (
      <div className="w-full max-w-2xl mx-auto py-20 text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Sparkles className="w-10 h-10 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Generando tu Brand Studio completo
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Renderizando layouts, banners de redes, fondos con tramas, efectos de textura y favicons multi-resolución...
          </p>
        </div>
        <div className="w-64 mx-auto bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-3/4 animate-pulse rounded-full" />
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full max-w-lg mx-auto py-16 text-center space-y-6">
        <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-200 space-y-4">
          <h3 className="text-lg font-semibold text-red-100">Algo falló al generar el kit</h3>
          <p className="text-sm text-red-300">
            Ocurrió un problema procesando las variantes o empaquetando el zip. Probá nuevamente o con otro archivo.
          </p>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
            >
              Volver al inicio
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Hero */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-zinc-900/90 to-purple-950/60 border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Check className="w-3.5 h-3.5" />
            <span>Kit generado exitosamente</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {input.brandName ? input.brandName : 'Tu Brand Studio'}
          </h2>
          <p className="text-sm text-zinc-400">
            {files.length} archivos vectoriales, layouts, banners, texturas y fondos ({formatBytes(zipSize)}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {zipUrl && (
            <a
              href={zipUrl}
              download={`${input.brandName ? input.brandName.toLowerCase().replace(/\s+/g, '-') : 'marca'}-kit.zip`}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Descargar todo (.zip)</span>
            </a>
          )}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              title="Procesar otro logo"
              className="inline-flex items-center justify-center p-3.5 rounded-2xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab('sheet')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shrink-0 ${
            activeTab === 'sheet'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Lámina</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('layouts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shrink-0 ${
            activeTab === 'layouts'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Layouts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shrink-0 ${
            activeTab === 'banners'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Banners Redes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('styles')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shrink-0 ${
            activeTab === 'styles'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>Texturas & Efectos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('patterns')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shrink-0 ${
            activeTab === 'patterns'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Fondos Pantalla</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('variants')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shrink-0 ${
            activeTab === 'variants'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Variantes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('favicons')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shrink-0 ${
            activeTab === 'favicons'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Favicons</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wordmark')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shrink-0 ${
            activeTab === 'wordmark'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Wordmark</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('explorer')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shrink-0 ${
            activeTab === 'explorer'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Archivos ({files.length})</span>
        </button>
      </div>

      {/* Tab 1: Lámina de Marca */}
      {activeTab === 'sheet' && brandSheet && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Guía de Marca Generada</h3>
                <p className="text-xs text-zinc-400">
                  Lámina unificada de 1200x800 px con el logo en los 3 fondos, paleta de colores y tipografía.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Ver en grande</span>
                </button>
                <a
                  href={brandSheet.url}
                  download="guia-de-marca.png"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar lámina</span>
                </a>
              </div>
            </div>

            <div 
              onClick={() => setIsZoomOpen(true)}
              className="relative w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 cursor-pointer group shadow-2xl"
            >
              <img
                src={brandSheet.url}
                alt="Guía de marca"
                className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium gap-2">
                <Maximize2 className="w-5 h-5" />
                <span>Hacé clic para ampliar</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Layouts (Horizontal, Vertical, Badge) */}
      {activeTab === 'layouts' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
                {[
                  { id: 'horizontal', label: 'Horizontal (Web & Navbar)' },
                  { id: 'vertical', label: 'Vertical / Editorial' },
                  { id: 'badge', label: 'Sello / Emblema' },
                  { id: 'appIcon', label: 'Icono de App / Avatar' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setSelectedLayout(l.id as typeof selectedLayout)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      selectedLayout === l.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setLayoutBg('checker')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    layoutBg === 'checker' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Ajedrez
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutBg('white')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    layoutBg === 'white' ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Blanco
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutBg('black')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    layoutBg === 'black' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Oscuro
                </button>
              </div>
            </div>

            {/* Display Box */}
            <div
              className={`w-full aspect-[16/9] md:aspect-[21/9] min-h-[300px] rounded-2xl border border-zinc-800 flex items-center justify-center p-8 transition-colors overflow-hidden ${
                layoutBg === 'checker'
                  ? 'checker-bg'
                  : layoutBg === 'white'
                  ? 'bg-white'
                  : 'bg-zinc-950'
              }`}
            >
              {selectedLayout === 'horizontal' && layoutHorizontalSvg?.text && (
                <div
                  className="preview-svg w-full h-full max-w-full max-h-full flex items-center justify-center pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: layoutHorizontalSvg.text }}
                />
              )}
              {selectedLayout === 'vertical' && layoutVerticalSvg?.text && (
                <div
                  className="preview-svg w-full h-full max-w-full max-h-full flex items-center justify-center pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: layoutVerticalSvg.text }}
                />
              )}
              {selectedLayout === 'badge' && layoutBadgeSvg?.text && (
                <div
                  className="preview-svg w-full h-full max-w-full max-h-full flex items-center justify-center pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: layoutBadgeSvg.text }}
                />
              )}
              {selectedLayout === 'appIcon' && layoutAppIconSvg?.text && (
                <div
                  className="preview-svg w-full h-full max-w-full max-h-full flex items-center justify-center pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: layoutAppIconSvg.text }}
                />
              )}
            </div>

            {/* Downloads */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Descargar composición seleccionada:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {selectedLayout === 'horizontal' && layoutHorizontalSvg && (
                  <a
                    href={layoutHorizontalSvg.url}
                    download="logo-horizontal.svg"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <FileCode2 className="w-4 h-4" />
                    <span>Descargar SVG Horizontal</span>
                  </a>
                )}
                {selectedLayout === 'horizontal' && layoutHorizontalPng && (
                  <a
                    href={layoutHorizontalPng.url}
                    download="logo-horizontal.png"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    <span>PNG Horizontal</span>
                  </a>
                )}

                {selectedLayout === 'vertical' && layoutVerticalSvg && (
                  <a
                    href={layoutVerticalSvg.url}
                    download="logo-vertical.svg"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <FileCode2 className="w-4 h-4" />
                    <span>Descargar SVG Vertical</span>
                  </a>
                )}
                {selectedLayout === 'vertical' && layoutVerticalPng && (
                  <a
                    href={layoutVerticalPng.url}
                    download="logo-vertical.png"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    <span>PNG Vertical</span>
                  </a>
                )}

                {selectedLayout === 'badge' && layoutBadgeSvg && (
                  <a
                    href={layoutBadgeSvg.url}
                    download="logo-sello.svg"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <FileCode2 className="w-4 h-4" />
                    <span>Descargar SVG Sello Oficial</span>
                  </a>
                )}
                {selectedLayout === 'badge' && layoutBadgePng && (
                  <a
                    href={layoutBadgePng.url}
                    download="logo-sello.png"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    <span>PNG Sello</span>
                  </a>
                )}

                {selectedLayout === 'appIcon' && layoutAppIconSvg && (
                  <a
                    href={layoutAppIconSvg.url}
                    download="logo-app-icon.svg"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <FileCode2 className="w-4 h-4" />
                    <span>Descargar SVG App Icon</span>
                  </a>
                )}
                {selectedLayout === 'appIcon' && layoutAppIconPng && (
                  <a
                    href={layoutAppIconPng.url}
                    download="logo-app-icon.png"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    <span>PNG App Icon</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Banners de Redes */}
      {activeTab === 'banners' && (
        <div className="space-y-6 animate-in fade-in">
          {/* LinkedIn Banner */}
          <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-semibold text-white">Banner de LinkedIn Empresa</h4>
                <p className="text-xs text-zinc-400">1584 x 396 px — diseñado dejando espacio libre a la izquierda para la foto de perfil.</p>
              </div>
              <div className="flex items-center gap-2">
                {bannerLiSvg && (
                  <a
                    href={bannerLiSvg.url}
                    download="banner-linkedin.svg"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar SVG</span>
                  </a>
                )}
                {bannerLiPng && (
                  <a
                    href={bannerLiPng.url}
                    download="banner-linkedin.png"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 hover:text-white text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar PNG</span>
                  </a>
                )}
              </div>
            </div>

            <div className="w-full aspect-[4/1] rounded-2xl border border-zinc-800 overflow-hidden bg-black flex items-center justify-center">
              {bannerLiSvg?.text && (
                <div
                  className="preview-svg w-full h-full pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: bannerLiSvg.text }}
                />
              )}
            </div>
          </div>

          {/* Twitter / X Banner */}
          <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-semibold text-white">Encabezado de X / Twitter</h4>
                <p className="text-xs text-zinc-400">1500 x 500 px — composición panorámica centrada.</p>
              </div>
              <div className="flex items-center gap-2">
                {bannerTwSvg && (
                  <a
                    href={bannerTwSvg.url}
                    download="banner-twitter.svg"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar SVG</span>
                  </a>
                )}
                {bannerTwPng && (
                  <a
                    href={bannerTwPng.url}
                    download="banner-twitter.png"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 hover:text-white text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar PNG</span>
                  </a>
                )}
              </div>
            </div>

            <div className="w-full aspect-[3/1] rounded-2xl border border-zinc-800 overflow-hidden bg-black flex items-center justify-center">
              {bannerTwSvg?.text && (
                <div
                  className="preview-svg w-full h-full pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: bannerTwSvg.text }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Texturas & Efectos */}
      {activeTab === 'styles' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Efectos y Texturas del Logo</h3>
              <p className="text-xs text-zinc-400">
                Variantes estilizadas aplicadas mediante filtros y gradientes vectoriales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Gold Foil */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-amber-300">Dorado / Gold Foil</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Gradiente metálico de oro pulido</p>
                </div>
                <div className="w-full aspect-square rounded-xl bg-black border border-zinc-800/80 p-6 flex items-center justify-center">
                  {styleGoldSvg?.text && (
                    <div
                      className="preview-svg w-full h-full pointer-events-none"
                      dangerouslySetInnerHTML={{ __html: styleGoldSvg.text }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  {styleGoldSvg && (
                    <a
                      href={styleGoldSvg.url}
                      download="logo-dorado.svg"
                      className="flex-1 text-center py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-medium transition-colors"
                    >
                      SVG Dorado
                    </a>
                  )}
                  {styleGoldPng && (
                    <a
                      href={styleGoldPng.url}
                      download="logo-dorado.png"
                      className="py-2 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs hover:text-white"
                      title="PNG Dorado"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Neon Glow */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-cyan-300">Neón / Cyber Glow</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Resplandor luminoso del color de marca</p>
                </div>
                <div className="w-full aspect-square rounded-xl bg-black border border-zinc-800/80 p-6 flex items-center justify-center">
                  {styleNeonSvg?.text && (
                    <div
                      className="preview-svg w-full h-full pointer-events-none"
                      dangerouslySetInnerHTML={{ __html: styleNeonSvg.text }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  {styleNeonSvg && (
                    <a
                      href={styleNeonSvg.url}
                      download="logo-neon.svg"
                      className="flex-1 text-center py-2 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-medium transition-colors"
                    >
                      SVG Neón
                    </a>
                  )}
                  {styleNeonPng && (
                    <a
                      href={styleNeonPng.url}
                      download="logo-neon.png"
                      className="py-2 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs hover:text-white"
                      title="PNG Neón"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Stamp Grunge */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">Sello / Grunge</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Textura de tinta con bordes desgastados</p>
                </div>
                <div className="w-full aspect-square rounded-xl bg-zinc-100 border border-zinc-300/80 p-6 flex items-center justify-center">
                  {styleStampSvg?.text && (
                    <div
                      className="preview-svg w-full h-full pointer-events-none"
                      dangerouslySetInnerHTML={{ __html: styleStampSvg.text }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  {styleStampSvg && (
                    <a
                      href={styleStampSvg.url}
                      download="logo-sello.svg"
                      className="flex-1 text-center py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                    >
                      SVG Sello
                    </a>
                  )}
                  {styleStampPng && (
                    <a
                      href={styleStampPng.url}
                      download="logo-sello.png"
                      className="py-2 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs hover:text-white"
                      title="PNG Sello"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Fondos & Patrones */}
      {activeTab === 'patterns' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Desktop Wallpaper */}
            <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-indigo-400" />
                    <span>Fondo Desktop (16:9)</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400">1920 x 1080 px con monograma de marca.</p>
                </div>
                {patternDesktopPng && (
                  <a
                    href={patternDesktopPng.url}
                    download="patron-monograma-desktop.png"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PNG 1080p</span>
                  </a>
                )}
              </div>

              <div className="w-full aspect-[16/9] rounded-2xl border border-zinc-800 overflow-hidden bg-black flex items-center justify-center shadow-xl">
                {patternDesktopSvg?.text && (
                  <div
                    className="preview-svg w-full h-full pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: patternDesktopSvg.text }}
                  />
                )}
              </div>
            </div>

            {/* Mobile Wallpaper */}
            <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span>Fondo Móvil / Historias (9:16)</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400">1080 x 1920 px para fondos y reels/stories.</p>
                </div>
                {patternMobilePng && (
                  <a
                    href={patternMobilePng.url}
                    download="patron-monograma-mobile.png"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PNG 9:16</span>
                  </a>
                )}
              </div>

              <div className="w-full aspect-[16/9] rounded-2xl border border-zinc-800 overflow-hidden bg-black flex items-center justify-center shadow-xl">
                {patternMobileSvg?.text && (
                  <div
                    className="preview-svg w-full h-full pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: patternMobileSvg.text }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Variantes del Logo */}
      {activeTab === 'variants' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
                {[
                  { id: 'full-color', label: 'Full Color' },
                  { id: 'black', label: 'Negro 100%' },
                  { id: 'white', label: 'Blanco 100%' },
                  { id: 'grayscale', label: 'Escala de Grises' },
                  { id: 'monochrome', label: 'Monocromático' },
                ].map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      selectedVariant === variant.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {variant.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setVariantBg('checker')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    variantBg === 'checker' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Ajedrez
                </button>
                <button
                  type="button"
                  onClick={() => setVariantBg('white')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    variantBg === 'white' ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Blanco
                </button>
                <button
                  type="button"
                  onClick={() => setVariantBg('black')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    variantBg === 'black' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Oscuro
                </button>
              </div>
            </div>

            <div
              className={`w-full aspect-[16/9] md:aspect-[21/9] min-h-[300px] rounded-2xl border border-zinc-800 flex items-center justify-center p-8 transition-colors overflow-hidden ${
                variantBg === 'checker'
                  ? 'checker-bg'
                  : variantBg === 'white'
                  ? 'bg-white'
                  : 'bg-zinc-950'
              }`}
            >
              {selectedVariantSvg?.text ? (
                <div
                  className="preview-svg w-full h-full max-w-full max-h-full flex items-center justify-center pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: selectedVariantSvg.text }}
                />
              ) : selectedVariantSvg ? (
                <img
                  src={selectedVariantSvg.url}
                  alt={`Logo ${selectedVariant}`}
                  className="max-w-full max-h-full object-contain"
                />
              ) : null}
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Descargas directas de esta variante:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {selectedVariantSvg && (
                  <a
                    href={selectedVariantSvg.url}
                    download={`logo-${selectedVariant}.svg`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <FileCode2 className="w-4 h-4" />
                    <span>Descargar SVG Vectorial</span>
                  </a>
                )}

                {[1024, 512, 256, 128].map((size) => {
                  const bg = variantBg === 'white' ? 'white' : variantBg === 'black' ? 'black' : 'transparent';
                  const pngFile = filesMap.get(`png/${selectedVariant}/${bg}-${size}.png`);
                  if (!pngFile) return null;

                  return (
                    <a
                      key={size}
                      href={pngFile.url}
                      download={`logo-${selectedVariant}-${bg}-${size}.png`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-zinc-400" />
                      <span>PNG {size}px</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Favicons & Apps */}
      {activeTab === 'favicons' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-zinc-200">Simulación: Pestaña de Navegador</h4>
                <span className="text-[11px] text-zinc-500 font-mono">16x16 / 32x32</span>
              </div>

              <div className="w-full rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-xl">
                <div className="bg-zinc-900 px-3 pt-2.5 flex items-center gap-2 border-b border-zinc-800">
                  <div className="flex items-center gap-1.5 pr-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-xl bg-zinc-950 border-t border-x border-zinc-800 text-xs text-zinc-200 max-w-[200px]">
                    {favicon32 && (
                      <img src={favicon32.url} alt="Favicon" className="w-4 h-4 rounded-sm object-contain" />
                    )}
                    <span className="truncate font-medium">
                      {input.brandName ? `${input.brandName} — Inicio` : 'Tu Marca'}
                    </span>
                  </div>
                </div>

                <div className="p-8 text-center space-y-2">
                  <p className="text-xs text-zinc-500">
                    Así ven los usuarios el favicon cuando abren tu sitio en Chrome, Safari o Firefox.
                  </p>
                </div>
              </div>

              {faviconIco && (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Favicon ICO empaquetado:</span>
                  <a
                    href={faviconIco.url}
                    download="favicon.ico"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>favicon.ico (16/32/48)</span>
                  </a>
                </div>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-zinc-200">Simulación: Pantalla Móvil</h4>
                <span className="text-[11px] text-zinc-500 font-mono">180x180 / 192x192</span>
              </div>

              <div className="w-full rounded-2xl bg-zinc-950 border border-zinc-800 p-6 flex flex-col items-center justify-center space-y-3 shadow-xl">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-2xl border border-white/20 flex items-center justify-center overflow-hidden">
                      {appleIcon && (
                        <img src={appleIcon.url} alt="Apple Icon" className="w-full h-full object-contain" />
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium">iOS</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 p-2.5 shadow-2xl border border-zinc-700 flex items-center justify-center overflow-hidden">
                      {android512 && (
                        <img src={android512.url} alt="Android Icon" className="w-full h-full object-contain" />
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium">Android</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 pt-2 text-center">
                  Iconos optimizados para guardar en pantalla de inicio de iPhone y Android PWA.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                {appleIcon && (
                  <a
                    href={appleIcon.url}
                    download="apple-touch-icon.png"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    <span>apple-touch-icon.png</span>
                  </a>
                )}
                {android512 && (
                  <a
                    href={android512.url}
                    download="android-chrome-512.png"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    <span>android-512.png</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Wordmark */}
      {activeTab === 'wordmark' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Wordmark Tipográfico</h3>
                <p className="text-xs text-zinc-400">
                  Fuente calibrada: <span className="text-indigo-400 font-medium">{input.fontPairing.heading}</span> + <span className="text-purple-400 font-medium">{input.fontPairing.body}</span> ({input.fontPairing.category})
                </p>
              </div>

              {wordmarkSvg && (
                <a
                  href={wordmarkSvg.url}
                  download="wordmark.svg"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
                >
                  <FileCode2 className="w-4 h-4" />
                  <span>Descargar Wordmark SVG</span>
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <span className="text-xs font-medium text-zinc-400">Fondo transparente</span>
                <div className="h-28 rounded-xl checker-bg flex items-center justify-center p-4">
                  {wordmarkTransparent && (
                    <img src={wordmarkTransparent.url} alt="Wordmark transparente" className="max-h-full max-w-full object-contain" />
                  )}
                </div>
                {wordmarkTransparent && (
                  <div className="text-right">
                    <a
                      href={wordmarkTransparent.url}
                      download="wordmark-transparent.png"
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>PNG transparente</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <span className="text-xs font-medium text-zinc-400">Sobre fondo oscuro</span>
                <div className="h-28 rounded-xl bg-black flex items-center justify-center p-4">
                  {wordmarkBlack && (
                    <img src={wordmarkBlack.url} alt="Wordmark oscuro" className="max-h-full max-w-full object-contain" />
                  )}
                </div>
                {wordmarkBlack && (
                  <div className="text-right">
                    <a
                      href={wordmarkBlack.url}
                      download="wordmark-black.png"
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>PNG fondo negro</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-white border border-zinc-200 text-zinc-900 space-y-4">
                <span className="text-xs font-medium text-zinc-500">Sobre fondo claro</span>
                <div className="h-28 rounded-xl bg-zinc-100 flex items-center justify-center p-4">
                  {wordmarkWhite && (
                    <img src={wordmarkWhite.url} alt="Wordmark claro" className="max-h-full max-w-full object-contain" />
                  )}
                </div>
                {wordmarkWhite && (
                  <div className="text-right">
                    <a
                      href={wordmarkWhite.url}
                      download="wordmark-white.png"
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>PNG fondo blanco</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: Explorador de Archivos */}
      {activeTab === 'explorer' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Todos los archivos ({files.length})</h3>
                <p className="text-xs text-zinc-400">
                  Podés descargar cualquier asset de forma individual sin necesidad de descomprimir el ZIP.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="divide-y divide-zinc-800/80 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950">
              {filteredFiles.map((file) => {
                const isSvg = file.path.endsWith('.svg');
                const isIco = file.path.endsWith('.ico');
                const fileName = file.path.split('/').pop() ?? file.path;

                return (
                  <div
                    key={file.path}
                    className="p-3.5 px-4 flex items-center justify-between gap-4 hover:bg-zinc-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      {isSvg ? (
                        <FileCode2 className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : isIco ? (
                        <FileArchive className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <FileImage className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                      <span className="text-xs font-mono text-zinc-300 truncate">{file.path}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-zinc-500 font-mono">{formatBytes(file.size)}</span>
                      <a
                        href={file.url}
                        download={fileName}
                        className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        title={`Descargar ${fileName}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Zoom Modal for Brand Sheet */}
      {isZoomOpen && brandSheet && (
        <div 
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center animate-in fade-in cursor-zoom-out"
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] overflow-auto rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-2">
            <img
              src={brandSheet.url}
              alt="Guía de marca ampliada"
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
