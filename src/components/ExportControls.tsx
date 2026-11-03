import React from 'react';
import { Download, Sliders, Archive, CheckCircle2, Loader2 } from 'lucide-react';
import { ExportSize, ImageSlot } from '../types';
import { formatBytes } from '../utils/imageProcessor';
import { sanitizeSku } from '../utils/prompts';

interface ExportControlsProps {
  slots: ImageSlot[];
  sku: string;
  exportSize: ExportSize;
  onChangeExportSize: (size: ExportSize) => void;
  quality: number;
  onChangeQuality: (quality: number) => void;
  onDownloadZip: () => void;
  isDownloadingZip: boolean;
  zipProgress: { percent: number; message: string } | null;
  isProcessingWebP: boolean;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  slots,
  sku,
  exportSize,
  onChangeExportSize,
  quality,
  onChangeQuality,
  onDownloadZip,
  isDownloadingZip,
  zipProgress,
  isProcessingWebP,
}) => {
  const selectedSlots = slots.filter((s) => s.selected && s.status === 'ready');
  const totalSizeBytes = selectedSlots.reduce((acc, s) => acc + (s.fileSizeBytes || 0), 0);
  const cleanSku = sanitizeSku(sku);
  const canDownload = selectedSlots.length > 0 && !isDownloadingZip && !isProcessingWebP;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-md p-5 space-y-5">
      {/* Top row: Settings & Optimization */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2 text-stone-900 font-serif-title font-bold text-base">
          <Sliders className="w-4 h-4 text-[#0F3D2E]" />
          <span>Catalog Optimization & Export Settings</span>
        </div>

        {isProcessingWebP && (
          <div className="flex items-center gap-2 text-xs font-medium text-[#0F3D2E] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Re-encoding WebP canvases...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Export Size Selector (4 cols) */}
        <div className="md:col-span-4 space-y-1.5">
          <label htmlFor="export-size-select" className="block text-xs font-semibold text-stone-700 tracking-wide uppercase">
            Export Dimension (1:1 Ratio)
          </label>
          <select
            id="export-size-select"
            value={exportSize}
            onChange={(e) => onChangeExportSize(Number(e.target.value) as ExportSize)}
            className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-all cursor-pointer font-medium"
          >
            <option value={4096}>4096 × 4096 px (Full 4K Ultra Archival - Default)</option>
            <option value={2048}>2048 × 2048 px (Recommended for Web Stores)</option>
            <option value={1600}>1600 × 1600 px (Fast Load Mobile Catalog)</option>
          </select>
        </div>

        {/* WebP Quality Slider (5 cols) */}
        <div className="md:col-span-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="quality-slider" className="font-semibold text-stone-700 tracking-wide uppercase">
              WebP Quality: <span className="font-mono text-[#0F3D2E] font-bold">{Math.round(quality * 100)}%</span>
            </label>
            <span className="text-[11px] text-stone-500 font-mono">
              (0.60 – 0.95 range)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-stone-400 font-mono">0.60</span>
            <input
              id="quality-slider"
              type="range"
              min={0.6}
              max={0.95}
              step={0.01}
              value={quality}
              onChange={(e) => onChangeQuality(parseFloat(e.target.value))}
              className="w-full accent-[#0F3D2E] cursor-pointer h-1.5 bg-stone-200 rounded-lg"
            />
            <span className="text-[11px] text-stone-400 font-mono">0.95</span>
          </div>
        </div>

        {/* Payload Summary (3 cols) */}
        <div className="md:col-span-3 bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/80 text-center">
          <span className="block text-[11px] text-stone-500 font-medium">Estimated Archive Payload</span>
          <div className="font-mono text-base font-bold text-[#0F3D2E] mt-0.5 tabular-nums">
            {formatBytes(totalSizeBytes)}
          </div>
          <span className="text-[10px] text-stone-400">
            {selectedSlots.length} of {slots.length} files selected
          </span>
        </div>
      </div>

      {/* Bottom row: Primary Download ZIP CTA */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100">
        <div className="text-xs text-stone-500 flex items-center gap-2">
          <Archive className="w-4 h-4 text-stone-400 shrink-0" />
          <span>
            Archive name: <code className="font-mono text-[#0F3D2E] font-semibold bg-stone-100 px-1.5 py-0.5 rounded">{cleanSku}.zip</code>
          </span>
        </div>

        <button
          type="button"
          onClick={onDownloadZip}
          disabled={!canDownload}
          className={`w-full sm:w-auto px-7 py-3 rounded-xl font-semibold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap ${
            canDownload
              ? 'bg-[#0F3D2E] hover:bg-[#154D3B] text-white active:scale-95 shadow-emerald-950/20'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
          }`}
        >
          {isDownloadingZip ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>{zipProgress?.message || 'Building ZIP Archive...'} ({zipProgress?.percent || 0}%)</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-[#C5A880]" />
              <span>Download ZIP ({selectedSlots.length} Images · {formatBytes(totalSizeBytes)})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
