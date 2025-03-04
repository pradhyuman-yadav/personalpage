// types/save-svg-as-png.d.ts
declare module 'save-svg-as-png' {
    interface SaveSvgAsPngOptions {  // Define a more specific type
      scale?: number;
      backgroundColor?: string;
      // Add other options as needed, based on the library's documentation
    }
    export function saveSvgAsPng(el: Element, filename: string, options?: SaveSvgAsPngOptions): void;
}