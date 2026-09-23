declare module 'imagetracerjs' {
  interface ImageTracerImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;
  }

  interface ImageTracerOptions {
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    numberofcolors?: number;
  }

  interface ImageTracerStatic {
    imagedataToSVG(imageData: ImageTracerImageData, options?: ImageTracerOptions): string;
  }

  const ImageTracer: ImageTracerStatic;
  export default ImageTracer;
}
