import JSZip from 'jszip';

export interface ZipEntry {
  path: string;
  data: Uint8Array | string;
}

export async function buildZipBytes(entries: ZipEntry[]): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const entry of entries) {
    zip.file(entry.path, entry.data);
  }
  return zip.generateAsync({ type: 'uint8array' });
}
