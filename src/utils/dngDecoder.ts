import UTIF from 'utif';

export interface DecodedDngResult {
  dataUrl: string;
  mimeType: string;
  width: number;
  height: number;
  cameraModel?: string;
  cameraMake?: string;
  isDng: boolean;
  extractionMethod: 'embedded-jpeg' | 'tiff-rgba-decoder' | 'standard';
}

/**
 * Checks if a given file is a Digital Negative (.dng) or RAW image
 */
export function isDngFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    name.endsWith('.dng') ||
    name.endsWith('.raw') ||
    name.endsWith('.cr2') ||
    name.endsWith('.nef') ||
    name.endsWith('.arw') ||
    type.includes('dng') ||
    type.includes('x-adobe-dng') ||
    type.includes('tiff')
  );
}

/**
 * Scans an ArrayBuffer for embedded JPEG streams.
 * Almost all DNG camera files (Leica, Canon/Nikon, iPhone ProRAW, DJI, Hasselblad)
 * store camera-interpolated previews as embedded JPEG data.
 */
function findEmbeddedJpegs(buffer: ArrayBuffer): { offset: number; length: number }[] {
  const bytes = new Uint8Array(buffer);
  const results: { offset: number; length: number }[] = [];
  const len = bytes.length;

  for (let i = 0; i < len - 4; i++) {
    // SOI marker: 0xFF 0xD8 0xFF
    if (bytes[i] === 0xFF && bytes[i + 1] === 0xD8 && bytes[i + 2] === 0xFF) {
      // Search forward for EOI marker: 0xFF 0xD9
      for (let j = i + 10; j < len - 1; j++) {
        if (bytes[j] === 0xFF && bytes[j + 1] === 0xD9) {
          // Confirm not a false match by checking there's substantial data
          const jpegLen = j + 2 - i;
          if (jpegLen > 4096) {
            results.push({ offset: i, length: jpegLen });
          }
          i = j + 2; // Jump past this JPEG
          break;
        }
      }
    }
  }

  return results;
}

/**
 * Reads basic ASCII metadata strings from a TIFF / DNG buffer
 */
function extractCameraMetadata(buffer: ArrayBuffer): { make?: string; model?: string } {
  try {
    const bytes = new Uint8Array(buffer.slice(0, Math.min(buffer.byteLength, 100000)));
    const text = new TextDecoder('latin1').decode(bytes);

    let make: string | undefined;
    let model: string | undefined;

    // Common camera makers in DNGs
    const makers = ['Canon', 'Nikon', 'Sony', 'Apple', 'Leica', 'Fujifilm', 'Panasonic', 'Hasselblad', 'DJI'];
    for (const m of makers) {
      if (text.includes(m)) {
        make = m;
        break;
      }
    }

    if (text.includes('iPhone')) model = 'Apple iPhone ProRAW';
    else if (text.includes('Leica')) model = 'Leica DNG Raw';
    else if (text.includes('Sony')) model = 'Sony Alpha Raw';
    else if (text.includes('Canon')) model = 'Canon EOS Raw';
    else if (text.includes('Nikon')) model = 'Nikon Z Raw';

    return { make, model };
  } catch {
    return {};
  }
}

/**
 * Loads an image blob and returns dimensions and data URL
 */
function blobToImageResult(blob: Blob, metadata: { make?: string; model?: string }, method: 'embedded-jpeg' | 'tiff-rgba-decoder'): Promise<DecodedDngResult> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      // Convert to dataUrl for storage
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to create canvas context for DNG'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      URL.revokeObjectURL(url);

      resolve({
        dataUrl,
        mimeType: 'image/jpeg',
        width,
        height,
        cameraMake: metadata.make,
        cameraModel: metadata.model || (metadata.make ? `${metadata.make} Camera Raw` : 'Digital Negative (.DNG)'),
        isDng: true,
        extractionMethod: method,
      });
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode extracted image preview: ' + e));
    };
    img.src = url;
  });
}

/**
 * Decodes a .DNG camera raw file
 */
export async function decodeDngFile(file: File): Promise<DecodedDngResult> {
  const arrayBuffer = await file.arrayBuffer();
  const metadata = extractCameraMetadata(arrayBuffer);

  // Strategy 1: Fast & lossless extraction of embedded camera-interpolated JPEG
  const jpegs = findEmbeddedJpegs(arrayBuffer);
  if (jpegs.length > 0) {
    // Sort by length descending to pick the highest resolution preview
    jpegs.sort((a, b) => b.length - a.length);
    const bestJpeg = jpegs[0];

    const jpegBytes = new Uint8Array(arrayBuffer, bestJpeg.offset, bestJpeg.length);
    const blob = new Blob([jpegBytes], { type: 'image/jpeg' });

    try {
      return await blobToImageResult(blob, metadata, 'embedded-jpeg');
    } catch (err) {
      console.warn('Embedded JPEG preview decode failed, trying UTIF fallback...', err);
    }
  }

  // Strategy 2: UTIF TIFF/DNG parser for raw strips / IFDs
  try {
    const ifds = (UTIF as any).decode(arrayBuffer);
    if (ifds && ifds.length > 0) {
      // Find the highest resolution IFD
      let targetIfd = ifds[0];
      for (const ifd of ifds) {
        if ((ifd.width || 0) * (ifd.height || 0) > (targetIfd.width || 0) * (targetIfd.height || 0)) {
          targetIfd = ifd;
        }
      }

      (UTIF as any).decodeImage(arrayBuffer, targetIfd);
      const rgba = (UTIF as any).toRGBA8(targetIfd);

      const width = targetIfd.width;
      const height = targetIfd.height;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas context');

      const imgData = ctx.createImageData(width, height);
      imgData.data.set(rgba);
      ctx.putImageData(imgData, 0, 0);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      return {
        dataUrl,
        mimeType: 'image/jpeg',
        width,
        height,
        cameraMake: metadata.make,
        cameraModel: metadata.model || 'DNG Raw Sensor',
        isDng: true,
        extractionMethod: 'tiff-rgba-decoder',
      };
    }
  } catch (utifErr) {
    console.warn('UTIF decode failed:', utifErr);
  }

  throw new Error(
    `Could not extract visual preview from .DNG file "${file.name}". Please ensure the DNG contains an embedded preview or export as high-res PNG/JPG.`
  );
}
