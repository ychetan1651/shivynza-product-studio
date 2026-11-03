import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download, RotateCw, ChevronLeft, ChevronRight, SplitSquareVertical, Copy, Check } from 'lucide-react';
import { ImageSlot } from '../types';
import { formatBytes } from '../utils/imageProcessor';

interface LightboxModalProps {
  slot: ImageSlot | null;
  rawImageUrl?: string | null;
  sku: string;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onRegenerate: (slotId: ImageSlot['id']) => void;
  onDownloadSingle: (slot: ImageSlot) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  slot,
  rawImageUrl,
  sku,
  onClose,
  onNavigate,
  onRegenerate,
  onDownloadSingle,
}) => {
  const [zoomLevel, setZoomLevel] = useState<1 | 2 | 4>(1);
  const [isComparing, setIsComparing] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate('prev');
      if (e.key === 'ArrowRight') onNavigate('next');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate]);

  if (!slot) return null;

  const currentImage = slot.optimizedUrl || slot.rawGeneratedUrl;

  const handleCopyPrompt = () => {
    if (slot.prompt) {
      navigator.clipboard.writeText(slot.prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none">
      {/* Top Modal Bar */}
      <div className="w-full max-w-7xl flex items-center justify-between py-3 px-4 text-white border-b border-white/10 mb-2">
        <div className="flex items-center gap-3">
          <span className="font-serif-title font-bold text-lg tracking-tight">
            Image {slot.id} · {slot.title}
          </span>
          <span className="text-white/40 font-mono text-xs">|</span>
          <span className="text-xs text-[#C5A880] font-mono">
            {slot.width}×{slot.height} WebP · {slot.fileSizeBytes ? formatBytes(slot.fileSizeBytes) : ''}
          </span>
        </div>

        {/* Center Controls: Zoom & Compare */}
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md text-xs">
          <button
            onClick={() => setZoomLevel(1)}
            className={`px-2 py-0.5 rounded cursor-pointer ${zoomLevel === 1 ? 'bg-white text-stone-900 font-bold' : 'text-white/80 hover:text-white'}`}
          >
            Fit (1×)
          </button>
          <button
            onClick={() => setZoomLevel(2)}
            className={`px-2 py-0.5 rounded cursor-pointer ${zoomLevel === 2 ? 'bg-white text-stone-900 font-bold' : 'text-white/80 hover:text-white'}`}
          >
            2× Detail
          </button>
          <button
            onClick={() => setZoomLevel(4)}
            className={`px-2 py-0.5 rounded cursor-pointer ${zoomLevel === 4 ? 'bg-white text-stone-900 font-bold' : 'text-white/80 hover:text-white'}`}
          >
            4× Macro
          </button>

          {rawImageUrl && (
            <>
              <span className="text-white/20">|</span>
              <button
                onClick={() => setIsComparing(!isComparing)}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded cursor-pointer ${
                  isComparing ? 'bg-[#0F3D2E] text-white font-bold' : 'text-white/80 hover:text-white'
                }`}
                title="Compare against the raw input reference"
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>Compare vs Raw</span>
              </button>
            </>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onRegenerate(slot.id)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Regenerate this slot"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDownloadSingle(slot)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F3D2E] hover:bg-[#154D3B] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save WebP</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-rose-600/80 text-white transition-colors cursor-pointer ml-2"
            title="Close Lightbox (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 w-full max-w-7xl flex items-center justify-center overflow-hidden rounded-xl bg-stone-900/60 border border-white/5 p-4">
        {/* Navigation Arrows */}
        <button
          onClick={() => onNavigate('prev')}
          className="absolute left-4 z-20 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer backdrop-blur-sm"
          title="Previous Image (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => onNavigate('next')}
          className="absolute right-4 z-20 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer backdrop-blur-sm"
          title="Next Image (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Image Display */}
        <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
          {isComparing && rawImageUrl && currentImage ? (
            /* Interactive Comparison Slider */
            <div className="relative w-full max-w-[800px] aspect-square rounded-lg overflow-hidden border border-white/20 shadow-2xl">
              {/* Polished Generated Image (Base) */}
              <img
                src={currentImage}
                alt="Polished result"
                className="absolute inset-0 w-full h-full object-contain"
              />

              {/* Raw Reference Image (Clipped) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${splitPosition}% 0, ${splitPosition}% 100%, 0 100%)` }}
              >
                <img
                  src={rawImageUrl}
                  alt="Raw reference"
                  className="w-full h-full object-contain filter contrast-[1.02]"
                />
                <span className="absolute top-4 left-4 bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-md backdrop-blur-md">
                  RAW REFERENCE
                </span>
              </div>

              <span className="absolute top-4 right-4 bg-[#0F3D2E]/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-md backdrop-blur-md">
                4K POLISHED
              </span>

              {/* Divider Line & Handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize shadow-lg"
                style={{ left: `${splitPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-stone-900 shadow-xl flex items-center justify-center text-xs font-bold">
                  ↔
                </div>
              </div>

              {/* Slider Input overlay */}
              <input
                type="range"
                min="0"
                max="100"
                value={splitPosition}
                onChange={(e) => setSplitPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
              />
            </div>
          ) : (
            /* Regular Zoom Image */
            <div
              className="transition-transform duration-200 ease-out origin-center flex items-center justify-center"
              style={{
                transform: `scale(${zoomLevel})`,
                cursor: zoomLevel > 1 ? 'grab' : 'zoom-in',
              }}
              onClick={() => {
                if (zoomLevel === 1) setZoomLevel(2);
                else if (zoomLevel === 2) setZoomLevel(4);
                else setZoomLevel(1);
              }}
            >
              <img
                src={currentImage}
                alt={slot.title}
                className="max-h-[80vh] max-w-[85vw] object-contain rounded-lg shadow-2xl"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Technical Drawer */}
      <div className="w-full max-w-7xl mt-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="truncate max-w-3xl">
          <span className="text-white font-semibold">Gemini Prompt:</span>{' '}
          <span className="text-white/60 font-mono text-[11px] truncate">{slot.prompt}</span>
        </div>
        <button
          onClick={handleCopyPrompt}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] cursor-pointer shrink-0"
        >
          {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
        </button>
      </div>
    </div>
  );
};
