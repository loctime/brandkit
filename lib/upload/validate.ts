export interface FileLike {
  type: string;
  size: number;
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'];
const MAX_SIZE_BYTES = 15 * 1024 * 1024;

export function validateUploadedFile(file: FileLike): ValidationResult {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { ok: false, error: 'Formato no soportado. Subí un PNG, JPG, WEBP, GIF o SVG.' };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { ok: false, error: 'El archivo es demasiado pesado (máximo 15MB).' };
  }
  return { ok: true };
}
