import JSZip from 'jszip';
import saveAs from 'file-saver';
import { ImageSlot } from '../types';
import { sanitizeSku } from './prompts';

export interface ZipProgressCallback {
  (percent: number, currentFile: string): void;
}

/**
 * Creates and downloads a ZIP file containing the selected polished product images.
 * Uses JSZip and FileSaver client-side only.
 * Output name: "{sanitizedSku}.zip"
 * Files inside:
 *   {sku}-1-silver.webp
 *   {sku}-1-yellow-gold.webp
 *   {sku}-1-rose-gold.webp
 *   {sku}-2.webp
 *   {sku}-3.webp
 *   {sku}-4.webp
 */
export async function downloadSelectedZip(
  sku: string,
  slots: ImageSlot[],
  onProgress?: ZipProgressCallback
): Promise<void> {
  const cleanSku = sanitizeSku(sku);
  const selectedSlots = slots.filter((slot) => slot.selected && slot.optimizedUrl && slot.status === 'ready');

  if (selectedSlots.length === 0) {
    throw new Error('Please select at least one generated image to download.');
  }

  const zip = new JSZip();

  for (let i = 0; i < selectedSlots.length; i++) {
    const slot = selectedSlots[i];
    const filename = slot.zipSuffix ? `${cleanSku}${slot.zipSuffix}` : `${cleanSku}-${slot.id}.webp`;

    if (onProgress) {
      onProgress(Math.round(((i + 0.5) / selectedSlots.length) * 50), filename);
    }

    if (slot.blob) {
      zip.file(filename, slot.blob);
    } else if (slot.optimizedUrl) {
      const res = await fetch(slot.optimizedUrl);
      const blob = await res.blob();
      zip.file(filename, blob);
    }
  }

  if (onProgress) {
    onProgress(75, 'Compressing archive...');
  }

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(75 + Math.round((metadata.percent / 100) * 25), 'Finalizing ZIP...');
      }
    }
  );

  const zipFilename = `${cleanSku}.zip`;
  saveAs(zipBlob, zipFilename);
}

/**
 * Downloads a single slot image directly
 */
export async function downloadSingleImage(sku: string, slot: ImageSlot): Promise<void> {
  if (!slot.optimizedUrl && !slot.rawGeneratedUrl) {
    throw new Error('Image not ready for download');
  }

  const cleanSku = sanitizeSku(sku);
  const filename = slot.zipSuffix ? `${cleanSku}${slot.zipSuffix}` : `${cleanSku}-${slot.id}.webp`;

  if (slot.blob) {
    saveAs(slot.blob, filename);
  } else {
    const targetUrl = slot.optimizedUrl || slot.rawGeneratedUrl!;
    const res = await fetch(targetUrl);
    const blob = await res.blob();
    saveAs(blob, filename);
  }
}
