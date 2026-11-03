import { ExportSize, MacroCallouts } from '../types';

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Loads an image URL into an HTMLImageElement safely without CORS errors
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // NEVER set crossOrigin on data: or blob: URIs as browsers reject or taint them
    if (!url.startsWith('data:') && !url.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image for processing: ' + err));
    img.src = url;
  });
}

export interface ProcessedImageResult {
  dataUrl: string;
  blob: Blob;
  sizeBytes: number;
  width: number;
  height: number;
}

/**
 * Draws luxury jewelry pointer callouts and typography onto the 2D canvas
 */
export function drawMacroCalloutsOnCanvas(
  ctx: CanvasRenderingContext2D,
  size: number,
  callouts: MacroCallouts
) {
  if (!callouts || !callouts.enabled) return;

  const s = size / 1000;
  ctx.save();

  // Helper for drawing pointer line with anchor dot
  const drawPointer = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = Math.round(4 * s);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.max(1.8 * s, 1.5);
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x1 * s, y1 * s);
    ctx.lineTo(x2 * s, y2 * s);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x2 * s, y2 * s, 4.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Helper for drawing multi-line serif text with contrast shadow
  const drawCalloutText = (text: string, centerX: number, startY: number) => {
    if (!text) return;
    const lines = text.split('\n');
    const fontSize = Math.round(32 * s);
    const lineHeight = Math.round(36 * s);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `500 ${fontSize}px 'Playfair Display', 'Cormorant Garamond', Georgia, serif`;
    
    // Multiple shadow passes for strong legibility against any background
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = Math.round(8 * s);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(2 * s);
    ctx.fillStyle = '#FFFFFF';

    const totalHeight = lines.length * lineHeight;
    let currentY = (startY * s) - (totalHeight / 2) + (lineHeight / 2);

    lines.forEach((line) => {
      // Stroke outline for razor-sharp legibility over white highlights
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = Math.max(2 * s, 1);
      ctx.strokeText(line, centerX * s, currentY);
      ctx.fillText(line, centerX * s, currentY);
      currentY += lineHeight;
    });

    ctx.restore();
  };

  // 1. Top-Left: Gemstone specification
  drawPointer(260, 235, 390, 490);
  drawCalloutText(callouts.topLeft, 250, 185);

  // 2. Top-Right: Metal specification
  drawPointer(765, 235, 630, 360);
  drawCalloutText(callouts.topRight, 775, 185);

  // 3. Bottom-Left: Hallmark Certification
  drawPointer(250, 765, 390, 625);
  drawCalloutText(callouts.bottomLeft, 230, 815);

  // 4. Bottom-Right: Handcrafted Finish
  drawPointer(755, 765, 620, 625);
  drawCalloutText(callouts.bottomRight, 770, 815);

  ctx.restore();
}

/**
 * Client-side canvas processing:
 * - Resizes to target dimension (1:1 ratio: 4096, 2048, or 1600)
 * - Optionally bakes macro callout overlay for Image 4
 * - Converts to WebP format with specified quality (0.60 - 0.95)
 * - Returns dataUrl, Blob, and precise byte count
 */
export async function processImageToWebP(
  sourceUrl: string,
  targetSize: ExportSize = 4096,
  quality: number = 0.82,
  callouts?: MacroCallouts
): Promise<ProcessedImageResult> {
  const img = await loadImage(sourceUrl);

  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;

  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
  if (!ctx) {
    throw new Error('Canvas 2D context could not be created');
  }

  // High quality resampling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Neutral background fill before drawing (avoids black background if transparent)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetSize, targetSize);

  // Compute cover or contain aspect fit for 1:1 square
  const sWidth = img.naturalWidth || img.width;
  const sHeight = img.naturalHeight || img.height;

  let sx = 0;
  let sy = 0;
  let sSize = Math.min(sWidth, sHeight);

  if (sWidth > sHeight) {
    sx = (sWidth - sHeight) / 2;
  } else {
    sy = (sHeight - sWidth) / 2;
  }

  ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, targetSize, targetSize);

  // If macro detailing callouts are enabled, bake them onto the canvas
  if (callouts && callouts.enabled) {
    drawMacroCalloutsOnCanvas(ctx, targetSize, callouts);
  }

  // Convert to WebP blob
  const mimeType = 'image/webp';
  let blob: Blob;
  let dataUrl: string;

  try {
    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to convert canvas to WebP'));
        },
        mimeType,
        quality
      );
    });
    dataUrl = canvas.toDataURL(mimeType, quality);
  } catch (canvasExportErr) {
    console.warn('Canvas export fallback, using original source directly:', canvasExportErr);
    return {
      dataUrl: sourceUrl,
      blob: new Blob([]),
      sizeBytes: sourceUrl.length,
      width: targetSize,
      height: targetSize,
    };
  }

  return {
    dataUrl,
    blob,
    sizeBytes: blob.size,
    width: targetSize,
    height: targetSize,
  };
}

/**
 * Converts an SVG data URL (or any vector SVG) into a high-res raster PNG data URL.
 * Required because Gemini API only accepts raster formats (PNG/JPEG/WebP) and rejects SVG.
 */
export async function rasterizeSvgToPng(svgUrl: string, size: number = 1200): Promise<string> {
  try {
    const img = await loadImage(svgUrl);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return svgUrl;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    const sWidth = img.naturalWidth || img.width || size;
    const sHeight = img.naturalHeight || img.height || size;

    let sx = 0;
    let sy = 0;
    let sSize = Math.min(sWidth, sHeight);
    if (sWidth > sHeight) {
      sx = (sWidth - sHeight) / 2;
    } else {
      sy = (sHeight - sWidth) / 2;
    }

    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, size, size);
    return canvas.toDataURL('image/png', 0.95);
  } catch (err) {
    console.warn('Failed to rasterize SVG to PNG:', err);
    return svgUrl;
  }
}


/**
 * Calculates estimated compressed file size for a given quality and size
 */
export function estimateFileSize(originalBytes: number, targetSize: ExportSize, quality: number): number {
  // Baseline scaling factors relative to 4096 and 0.82
  const sizeRatio = (targetSize / 4096) * (targetSize / 4096);
  const qualityFactor = Math.pow(quality / 0.82, 1.8);
  const estimate = Math.round(originalBytes * sizeRatio * qualityFactor);
  return Math.max(estimate, 120 * 1024); // Minimum ~120KB for high-res webp
}
