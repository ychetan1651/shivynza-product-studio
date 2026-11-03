/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, MouseEvent } from 'react';
import { X, Columns, Sliders, ShieldCheck, AlertTriangle, ZoomIn } from 'lucide-react';
import { AccuracyVerification } from '../types';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawImageUrl: string;
  generatedImageUrl: string;
  title: string;
  verification?: AccuracyVerification;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  rawImageUrl,
  generatedImageUrl,
  title,
  verification,
}) => {
  if (!isOpen) return null;

  const [sliderPos, setSliderPos] = useState(50); // percentage: 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    setSliderPos((x / rect.width) * 100);
  };

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    handleSliderMove(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleSliderMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const score = verification?.score ?? null;
  const scoreColor =
    score !== null
      ? score >= 8
        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
        : score >= 6
        ? 'bg-amber-100 text-amber-800 border-amber-300'
        : 'bg-rose-100 text-rose-800 border-rose-300'
      : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="bg-white rounded-2xl border border-stone-200 max-w-4xl w-full flex flex-col max-h-[92vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0F3D2E]/10 flex items-center justify-center text-[#0F3D2E]">
              <Columns className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-title font-bold text-stone-900 text-base">
                  Verify Fidelity · {title}
                </h3>
                {score !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border tabular-nums flex items-center gap-1 ${scoreColor}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Fidelity Score: {score}/10</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">
                Compare original reference photo vs final catalog output
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-stone-200/70 p-0.5 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode('slider')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'slider' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Split Slider
              </button>
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'side-by-side' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Side-by-Side
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comparison Viewport */}
        <div className="flex-1 bg-stone-950 p-6 flex items-center justify-center overflow-hidden min-h-[440px]">
          {viewMode === 'slider' ? (
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              className="relative aspect-square max-h-[60vh] w-full max-w-[600px] overflow-hidden rounded-xl shadow-2xl cursor-ew-resize border border-white/20 select-none"
            >
              {/* Generated Image (Right/Base) */}
              <img
                src={generatedImageUrl}
                alt="Generated final"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
              <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs z-10">
                Generated 4K
              </span>

              {/* Raw Image (Left/Clipped) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <img
                  src={rawImageUrl}
                  alt="Raw original reference"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
                <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-[#0F3D2E]/80 text-white text-[11px] font-medium backdrop-blur-xs z-10">
                  Raw Original
                </span>
              </div>

              {/* Vertical Divider Line with handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.8)] z-20 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-lg border border-stone-300">
                  <Sliders className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 w-full max-h-[60vh]">
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-stone-300 mb-2">Raw Reference Photo</span>
                <div className="aspect-square w-full rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
                  <img
                    src={rawImageUrl}
                    alt="Raw photo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-stone-300 mb-2">Generated / Polish Output</span>
                <div className="aspect-square w-full rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
                  <img
                    src={generatedImageUrl}
                    alt="Generated output"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Verification Details Footer */}
        {verification && (
          <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 text-xs">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {verification.score >= 8 ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div className="space-y-1 flex-1">
                <div className="font-semibold text-stone-800 flex items-center gap-2">
                  <span>Gemini Vision Fidelity Audit:</span>
                  <span className="text-stone-500 font-normal">
                    {verification.summary ||
                      (verification.score >= 8
                        ? 'High precision match. Prongs, stone cuts, and metal proportions faithful.'
                        : 'Review differences below.')}
                  </span>
                </div>
                {verification.differences && verification.differences.length > 0 && (
                  <ul className="list-disc pl-4 space-y-0.5 text-stone-600 text-[11px]">
                    {verification.differences.map((diff, idx) => (
                      <li key={idx}>{diff}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
