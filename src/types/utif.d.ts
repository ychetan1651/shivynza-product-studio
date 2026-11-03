declare module 'utif' {
  export function decode(buffer: ArrayBuffer): any[];
  export function decodeImage(buffer: ArrayBuffer, ifd: any): void;
  export function toRGBA8(ifd: any): Uint8Array;
  export const tags: Record<string, any>;
  const utif: {
    decode: typeof decode;
    decodeImage: typeof decodeImage;
    toRGBA8: typeof toRGBA8;
    tags: typeof tags;
    [key: string]: any;
  };
  export default utif;
}
