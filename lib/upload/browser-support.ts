export function isWasmSupported(): boolean {
  return typeof WebAssembly !== 'undefined';
}
