import React, { useState, useEffect } from 'react';
import {
  RotateCw,
  Download,
  Maximize2,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  Sparkles,
  X,
  Columns,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { ImageSlot, MacroCallouts } from '../types';
import { formatBytes } from '../utils/imageProcessor';

interface ImageCardProps {
  slot: ImageSlot;
  sku: string;
  rawImageUrl?: string;
  onToggleSelect: (slotId: ImageSlot['id']) => void;
  onRegenerate: (slotId: ImageSlot['id']) => void;
  onDownloadSingle: (slot: ImageSlot) => void;
  onOpenLightbox: (slot: ImageSlot) => void;
  onOpenCompare?: (slot: ImageSlot) => void;
  isAnyGenerating: boolean;
  onUpdateSlotCallouts?: (callouts: MacroCallouts) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  slot,
  sku,
  rawImageUrl,
  onToggleSelect,
  onRegenerate,
  onDownloadSingle,
  onOpenLightbox,
  onOpenCompare,
  isAnyGenerating,
  onUpdateSlotCallouts,
}) => {
  const isReady = slot.status === 'ready' && (slot.optimizedUrl || slot.rawGeneratedUrl);
  const isLoading = slot.status === 'generating' || slot.status === 'processing';
  const isVerifying = slot.status === 'verifying';
  const isError = slot.status === 'error';
  const displayImage = slot.optimizedUrl || slot.rawGeneratedUrl;

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorCallouts, setEditorCallouts] = useState<MacroCallouts>(() => {
    return (
      slot.callouts || {
        enabled: true,
        autoSync: true,
        topLeft: 'Natural / Lab Grown\nDiamond',
        topRight: '18K White Gold /\n925 Silver',
        bottomLeft: 'Hallmarked\nJewellery',
        bottomRight: 'Handcrafted\nFinish',
      }
    );
  });

  useEffect(() => {
    if (slot.callouts) {
      setEditorCallouts(slot.callouts);
    }
  }, [slot.callouts]);

  const handleApplyCallouts = () => {
    if (onUpdateSlotCallouts) {
      onUpdateSlotCallouts({ ...editorCallouts, autoSync: false });
    }
    setIsEditorOpen(false);
  };

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden flex flex-col bg-white relative ${
        slot.selected && isReady
          ? 'border-[#0F3D2E]/30 shadow-md ring-1 ring-[#0F3D2E]/10'
          : 'border-stone-200/90 shadow-xs'
      }`}
    >
      {/* Card Header */}
      <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between gap-2 bg-[#FAF8F5]/70">
        <div className="flex items-center gap-2.5 min-w-0">
          <input
            type="checkbox"
            checked={slot.selected}
            disabled={!isReady}
            onChange={() => onToggleSelect(slot.id)}
            className="w-4 h-4 rounded border-stone-300 text-[#0F3D2E] focus:ring-[#0F3D2E]/20 cursor-pointer disabled:opacity-40"
            id={`select-slot-${slot.id}`}
          />
          <div className="truncate">
            <div className="flex items-center gap-1.5 flex-wrap">
              <label
                htmlFor={`select-slot-${slot.id}`}
                className="font-serif-title text-xs sm:text-sm font-bold text-stone-900 truncate block cursor-pointer"
              >
                {slot.title}
              </label>
              {slot.slotKey === 'macro' && (
                <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#C5A880]/20 text-[#0F3D2E] border border-[#C5A880]/40">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Callouts</span>
                </span>
              )}
            </div>
            <div className="text-[11px] text-stone-500 font-medium truncate">
              {slot.category}
            </div>
          </div>
        </div>

        {/* Status / Fidelity Badge / File Size Indicator */}
        <div className="shrink-0 flex items-center gap-2 text-right">
          {/* Verification Score Badge with Hover Popover */}
          {isReady && slot.verification && (
            <div className="relative group/score">
              <div
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border tabular-nums flex items-center gap-1 cursor-help transition-all ${
                  slot.verification.score >= 8
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs'
                    : slot.verification.score >= 6
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>{slot.verification.score}/10</span>
              </div>

              {/* Hover Tooltip */}
              <div className="absolute right-0 top-full mt-1.5 w-64 p-3 bg-stone-900 text-white rounded-xl shadow-xl text-[11px] z-40 opacity-0 pointer-events-none group-hover/score:opacity-100 group-hover/score:pointer-events-auto transition-opacity">
                <div className="font-semibold text-white flex items-center justify-between pb-1 border-b border-stone-700">
                  <span>Fidelity Score: {slot.verification.score}/10</span>
                  <span className={slot.verification.score >= 8 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {slot.verification.score >= 8 ? 'High Precision' : 'Review Differences'}
                  </span>
                </div>
                <p className="text-stone-300 mt-1 leading-tight text-[11px]">
                  {slot.verification.summary || 'Vision QA audited stone count, cuts, setting, and proportions.'}
                </p>
                {slot.verification.differences && slot.verification.differences.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-stone-800">
                    <span className="text-[10px] text-stone-400 font-semibold block mb-0.5">Observed notes:</span>
                    <ul className="list-disc pl-3 text-[10px] text-amber-200 space-y-0.5">
                      {slot.verification.differences.map((diff, i) => (
                        <li key={i}>{diff}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {isReady && slot.fileSizeBytes ? (
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 tabular-nums">
                {formatBytes(slot.fileSizeBytes)}
              </span>
              <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                {slot.width}×{slot.height} WebP
              </div>
            </div>
          ) : isVerifying ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium animate-pulse">
              <ShieldCheck className="w-3.5 h-3.5 animate-bounce" />
              <span>Vision QA...</span>
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-1.5 text-xs text-[#0F3D2E] font-medium animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{slot.status === 'processing' ? 'Canvas WebP...' : 'Generating...'}</span>
            </div>
          ) : isError ? (
            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Failed
            </span>
          ) : (
            <span className="text-[11px] text-stone-400">Standby</span>
          )}
        </div>
      </div>

      {/* Visual Canvas Viewport */}
      <div className="relative aspect-square w-full bg-stone-100 flex items-center justify-center overflow-hidden group">
        {isReady && displayImage ? (
          <>
            <img
              src={displayImage}
              alt={`${slot.title} preview`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02] cursor-pointer"
              onClick={() => onOpenLightbox(slot)}
              loading="lazy"
            />

            {/* Hover overlay with quick actions */}
            <div className="absolute inset-0 bg-stone-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={() => onOpenLightbox(slot)}
                className="p-2.5 rounded-full bg-white/90 text-stone-900 hover:bg-white hover:scale-105 transition-all shadow-md cursor-pointer"
                title="Inspect in full-size Lightbox (Zoom)"
                aria-label="Inspect in full-size Lightbox"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {rawImageUrl && onOpenCompare && (
                <button
                  type="button"
                  onClick={() => onOpenCompare(slot)}
                  className="p-2.5 rounded-full bg-white/90 text-[#0F3D2E] hover:bg-white hover:scale-105 transition-all shadow-md cursor-pointer"
                  title="Compare with Raw Photo (Split Slider)"
                  aria-label="Compare with Raw Photo"
                >
                  <Columns className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onDownloadSingle(slot)}
                className="p-2.5 rounded-full bg-white/90 text-[#0F3D2E] hover:bg-white hover:scale-105 transition-all shadow-md cursor-pointer"
                title="Download single WebP file"
                aria-label="Download single WebP file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : isVerifying ? (
          <div className="w-full h-full bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <p className="font-serif-title text-sm font-semibold text-stone-800">
              Verifying Product Fidelity
            </p>
            <p className="text-[11px] text-stone-500 max-w-[220px] mt-1">
              Gemini Vision auditing stone count, cuts, setting, and proportions...
            </p>
          </div>
        ) : isLoading ? (
          <div className="w-full h-full bg-gradient-to-tr from-[#FAF8F5] via-[#F4F1EA] to-[#ECE7DE] relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            
            <div className="w-12 h-12 rounded-full bg-white/80 shadow-xs flex items-center justify-center text-[#0F3D2E] mb-3 animate-spin">
              <Loader2 className="w-6 h-6" />
            </div>
            <p className="font-serif-title text-sm font-semibold text-stone-800">
              {slot.slotKey.includes('hero') ? 'Synthesizing Hero Packshot' : `Generating ${slot.title}`}
            </p>
            <p className="text-[11px] text-stone-500 max-w-[220px] mt-1">
              Preserving exact prongs, cuts & jewelry geometry...
            </p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center flex flex-col items-center justify-center space-y-3 bg-rose-50/40 w-full h-full">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="max-w-[260px]">
              <p className="text-xs font-semibold text-rose-900">Slot Generation Failed</p>
              <p className="text-[11px] text-rose-700 mt-1 line-clamp-3">
                {slot.error || 'Server or network error. Please try regenerating.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRegenerate(slot.id)}
              className="px-3 py-1.5 bg-white border border-rose-300 text-rose-800 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry Slot</span>
            </button>
          </div>
        ) : (
          <div className="p-6 text-center flex flex-col items-center justify-center text-stone-400">
            <div className="w-12 h-12 rounded-full bg-white border border-stone-200/60 flex items-center justify-center mb-2">
              <span className="font-serif-title font-bold text-stone-400 text-sm">
                {slot.zipSuffix.replace('.webp', '')}
              </span>
            </div>
            <p className="text-xs font-medium text-stone-600">{slot.title}</p>
            <p className="text-[11px] text-stone-400 max-w-[200px] mt-0.5">
              {slot.description}
            </p>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 py-2.5 border-t border-stone-100 bg-[#FAF8F5]/40 flex items-center justify-between text-xs flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onRegenerate(slot.id)}
          disabled={isLoading || isAnyGenerating}
          className="flex items-center gap-1.5 text-stone-600 hover:text-[#0F3D2E] disabled:opacity-40 font-medium transition-colors cursor-pointer"
          title="Regenerate only this slot"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Regenerate</span>
        </button>

        <div className="flex items-center gap-2">
          {rawImageUrl && isReady && onOpenCompare && (
            <button
              type="button"
              onClick={() => onOpenCompare(slot)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-stone-200 text-stone-700 hover:text-[#0F3D2E] hover:border-[#0F3D2E]/30 font-medium transition-colors cursor-pointer shadow-2xs"
              title="Compare side-by-side with raw photo"
            >
              <Columns className="w-3 h-3 text-[#0F3D2E]" />
              <span>Compare</span>
            </button>
          )}

          {slot.slotKey === 'macro' && onUpdateSlotCallouts && isReady && (
            <button
              type="button"
              onClick={() => setIsEditorOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAF8F5] border border-stone-200 text-stone-700 hover:text-[#0F3D2E] hover:border-[#0F3D2E]/30 font-medium transition-colors cursor-pointer"
              title="Edit pointer lines & callout text for Image 4"
            >
              <SlidersHorizontal className="w-3 h-3 text-[#0F3D2E]" />
              <span>Edit Callouts</span>
            </button>
          )}

          {isReady && (
            <button
              type="button"
              onClick={() => onDownloadSingle(slot)}
              className="flex items-center gap-1 text-[#0F3D2E] hover:text-[#154D3B] font-semibold transition-colors cursor-pointer"
              title="Download individual WebP"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save WebP</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Edit Callouts Modal for Slot 4 */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0F3D2E]" />
                <h3 className="font-serif-title font-bold text-stone-900 text-base">
                  Customize Image 4 Detailing Callouts
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Update the 4 corner callouts. Clicking <strong>Apply & Re-bake</strong> instantly draws new sharp vector pointer lines and serif typography onto your 4K WebP without regenerating from AI.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 flex items-center justify-between text-[11px]">
                  <span>↖ Top-Left (Stone)</span>
                </label>
                <textarea
                  rows={2}
                  value={editorCallouts.topLeft}
                  onChange={(e) => setEditorCallouts((prev) => ({ ...prev, topLeft: e.target.value }))}
                  className="w-full p-2 bg-[#FAF8F5] border border-stone-200 rounded font-serif text-xs focus:ring-1 focus:ring-[#0F3D2E] resize-none"
                  placeholder="Natural / Lab Grown&#10;Diamond"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 flex items-center justify-between text-[11px]">
                  <span>↗ Top-Right (Metal)</span>
                </label>
                <textarea
                  rows={2}
                  value={editorCallouts.topRight}
                  onChange={(e) => setEditorCallouts((prev) => ({ ...prev, topRight: e.target.value }))}
                  className="w-full p-2 bg-[#FAF8F5] border border-stone-200 rounded font-serif text-xs focus:ring-1 focus:ring-[#0F3D2E] resize-none"
                  placeholder="18K White Gold /&#10;925 Silver"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 flex items-center justify-between text-[11px]">
                  <span>↙ Bottom-Left (Hallmark)</span>
                </label>
                <textarea
                  rows={2}
                  value={editorCallouts.bottomLeft}
                  onChange={(e) => setEditorCallouts((prev) => ({ ...prev, bottomLeft: e.target.value }))}
                  className="w-full p-2 bg-[#FAF8F5] border border-stone-200 rounded font-serif text-xs focus:ring-1 focus:ring-[#0F3D2E] resize-none"
                  placeholder="Hallmarked&#10;Jewellery"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 flex items-center justify-between text-[11px]">
                  <span>↘ Bottom-Right (Finish)</span>
                </label>
                <textarea
                  rows={2}
                  value={editorCallouts.bottomRight}
                  onChange={(e) => setEditorCallouts((prev) => ({ ...prev, bottomRight: e.target.value }))}
                  className="w-full p-2 bg-[#FAF8F5] border border-stone-200 rounded font-serif text-xs focus:ring-1 focus:ring-[#0F3D2E] resize-none"
                  placeholder="Handcrafted&#10;Finish"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editorCallouts.enabled}
                  onChange={(e) => setEditorCallouts((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="w-3.5 h-3.5 rounded text-[#0F3D2E]"
                />
                <span>Include Detailing Callouts</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCallouts}
                  className="px-4 py-1.5 rounded-lg bg-[#0F3D2E] text-white text-xs font-semibold hover:bg-[#154D3B] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply & Re-bake</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
