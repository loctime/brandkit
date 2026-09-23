declare module 'imagetracerjs' {
  export interface ImageTracerImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;
  }

  export interface ImageTracerColor {
    r: number;
    g: number;
    b: number;
    a: number;
  }

  export interface ImageTracerOptions {
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    numberofcolors?: number;
    colorsampling?: number;
    colorquantcycles?: number;
    mincolorratio?: number;
    pal?: ImageTracerColor[];
    viewbox?: boolean;
  }

  export interface ImageTracerStatic {
    imagedataToSVG(imageData: ImageTracerImageData, options?: ImageTracerOptions): string;
  }

  const ImageTracer: ImageTracerStatic;
  export default ImageTracer;
}
