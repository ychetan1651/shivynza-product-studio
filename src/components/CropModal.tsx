/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, MouseEvent, TouchEvent } from 'react';
import { Crop, Check, X, RotateCcw, ZoomIn } from 'lucide-react';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
  onApplyCrop: (croppedDataUrl: string, width: number, height: number) => void;
}

export const CropModal: React.FC<CropModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  onApplyCrop,
}) => {
  if (!isOpen) return null;

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Normalized crop rectangle: 0 to 1
  const [crop, setCrop] = useState({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'move' | 'nw' | 'ne' | 'se' | 'sw' | null>(null);
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 1200, height: 1200 });
  const [isSquare1x1, setIsSquare1x1] = useState(true);

  // Initialize crop centered square
  const handleImageLoaded = () => {
    if (imgRef.current) {
      const nw = imgRef.current.naturalWidth || 1200;
      const nh = imgRef.current.naturalHeight || 1200;
      setNaturalSize({ width: nw, height: nh });

      const minDim = Math.min(nw, nh);
      const wNorm = (minDim * 0.85) / nw;
      const hNorm = (minDim * 0.85) / nh;
      setCrop({
        x: (1 - wNorm) / 2,
        y: (1 - hNorm) / 2,
        width: wNorm,
        height: hNorm,
      });
    }
  };

  const handleMouseDown = (e: MouseEvent, mode: 'move' | 'nw' | 'ne' | 'se' | 'sw') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragMode(mode);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      cropX: crop.x,
      cropY: crop.y,
      cropW: crop.width,
      cropH: crop.height,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!isDragging || !imgRef.current) return;

      const rect = imgRef.current.getBoundingClientRect();
      const dx = (e.clientX - dragStart.mouseX) / rect.width;
      const dy = (e.clientY - dragStart.mouseY) / rect.height;

      setCrop(() => {
        let newX = dragStart.cropX;
        let newY = dragStart.cropY;
        let newW = dragStart.cropW;
        let newH = dragStart.cropH;

        if (dragMode === 'move') {
          newX = Math.max(0, Math.min(1 - newW, dragStart.cropX + dx));
          newY = Math.max(0, Math.min(1 - newH, dragStart.cropY + dy));
        } else if (dragMode === 'se') {
          newW = Math.max(0.15, Math.min(1 - dragStart.cropX, dragStart.cropW + dx));
          newH = isSquare1x1
            ? (newW * naturalSize.width) / naturalSize.height
            : Math.max(0.15, Math.min(1 - dragStart.cropY, dragStart.cropH + dy));
          if (newY + newH > 1) newH = 1 - newY;
        } else if (dragMode === 'nw') {
          const right = dragStart.cropX + dragStart.cropW;
          const bottom = dragStart.cropY + dragStart.cropH;
          newX = Math.max(0, Math.min(right - 0.15, dragStart.cropX + dx));
          newY = Math.max(0, Math.min(bottom - 0.15, dragStart.cropY + dy));
          newW = right - newX;
          newH = isSquare1x1 ? (newW * naturalSize.width) / naturalSize.height : bottom - newY;
        } else if (dragMode === 'ne') {
          const left = dragStart.cropX;
          const bottom = dragStart.cropY + dragStart.cropH;
          newW = Math.max(0.15, Math.min(1 - left, dragStart.cropW + dx));
          newH = isSquare1x1 ? (newW * naturalSize.width) / naturalSize.height : Math.max(0.15, bottom - (dragStart.cropY + dy));
          newY = bottom - newH;
          if (newY < 0) {
            newY = 0;
            newH = bottom;
          }
        } else if (dragMode === 'sw') {
          const right = dragStart.cropX + dragStart.cropW;
          newX = Math.max(0, Math.min(right - 0.15, dragStart.cropX + dx));
          newW = right - newX;
          newH = isSquare1x1 ? (newW * naturalSize.width) / naturalSize.height : Math.max(0.15, Math.min(1 - dragStart.cropY, dragStart.cropH + dy));
          if (newY + newH > 1) newH = 1 - newY;
        }

        return { x: Math.max(0, newX), y: Math.max(0, newY), width: Math.min(1 - newX, newW), height: Math.min(1 - newY, newH) };
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragMode(null);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragMode, dragStart, isSquare1x1, naturalSize]);

  // Execute high-resolution pixel crop onto canvas
  const handleConfirmCrop = () => {
    if (!imgRef.current) return;

    const img = imgRef.current;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    const srcX = Math.round(crop.x * nw);
    const srcY = Math.round(crop.y * nh);
    const srcW = Math.round(crop.width * nw);
    const srcH = Math.round(crop.height * nh);

    const canvas = document.createElement('canvas');
    canvas.width = srcW;
    canvas.height = srcH;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

    const croppedDataUrl = canvas.toDataURL('image/png');
    onApplyCrop(croppedDataUrl, srcW, srcH);
    onClose();
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0, width: 1, height: 1 });
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-stone-200 max-w-2xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F3D2E]/10 flex items-center justify-center text-[#0F3D2E]">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-stone-900 text-sm">
                Crop Tight Around Jewelry
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                {naturalSize.width} × {naturalSize.height}px (Full Resolution Preserved)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport with Draggable Crop Box */}
        <div
          ref={containerRef}
          className="relative flex-1 bg-stone-900/95 flex items-center justify-center p-6 overflow-hidden select-none"
        >
          <div className="relative inline-block max-h-[55vh] max-w-full">
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop target"
              onLoad={handleImageLoaded}
              className="max-h-[55vh] max-w-full object-contain pointer-events-none block"
            />

            {/* Dark semi-transparent scrim around crop */}
            <div
              className="absolute pointer-events-none border border-white/80 shadow-2xl"
              style={{
                left: `${crop.x * 100}%`,
                top: `${crop.y * 100}%`,
                width: `${crop.width * 100}%`,
                height: `${crop.height * 100}%`,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
              }}
            >
              {/* Rule of thirds grid lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                <div className="border-r border-b border-white/25" />
                <div className="border-r border-b border-white/25" />
                <div className="border-b border-white/25" />
                <div className="border-r border-b border-white/25" />
                <div className="border-r border-b border-white/25" />
                <div className="border-b border-white/25" />
                <div className="border-r border-white/25" />
                <div className="border-r border-white/25" />
                <div />
              </div>
            </div>

            {/* Interactive Move Zone */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'move')}
              className="absolute cursor-move"
              style={{
                left: `${crop.x * 100}%`,
                top: `${crop.y * 100}%`,
                width: `${crop.width * 100}%`,
                height: `${crop.height * 100}%`,
              }}
            >
              {/* Corner Handles */}
              <div
                onMouseDown={(e) => handleMouseDown(e, 'nw')}
                className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-[#0F3D2E] rounded-xs cursor-nwse-resize shadow-md"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'ne')}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-[#0F3D2E] rounded-xs cursor-nesw-resize shadow-md"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'se')}
                className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-[#0F3D2E] rounded-xs cursor-nwse-resize shadow-md"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'sw')}
                className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-[#0F3D2E] rounded-xs cursor-nesw-resize shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Toolbar & Actions */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSquare1x1((v) => !v)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                isSquare1x1
                  ? 'bg-[#0F3D2E] text-white border-[#0F3D2E]'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              1:1 Square Lock
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmCrop}
              className="px-5 py-2 rounded-lg bg-[#0F3D2E] text-white font-semibold hover:bg-[#154D3B] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Apply Crop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
