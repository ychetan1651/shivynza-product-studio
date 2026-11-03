import React from 'react';
import { ImageSlot, MacroCallouts } from '../types';
import { ImageCard } from './ImageCard';
import { CheckSquare, Square, Sparkles, Layers } from 'lucide-react';

interface PreviewGridProps {
  slots: ImageSlot[];
  sku: string;
  rawImageUrl?: string;
  onToggleSelect: (slotId: ImageSlot['id']) => void;
  onSelectAll: (select: boolean) => void;
  onRegenerate: (slotId: ImageSlot['id']) => void;
  onDownloadSingle: (slot: ImageSlot) => void;
  onOpenLightbox: (slot: ImageSlot) => void;
  onOpenCompare?: (slot: ImageSlot) => void;
  isAnyGenerating: boolean;
  onUpdateSlotCallouts?: (callouts: MacroCallouts) => void;
}

export const PreviewGrid: React.FC<PreviewGridProps> = ({
  slots,
  sku,
  rawImageUrl,
  onToggleSelect,
  onSelectAll,
  onRegenerate,
  onDownloadSingle,
  onOpenLightbox,
  onOpenCompare,
  isAnyGenerating,
  onUpdateSlotCallouts,
}) => {
  const readySlots = slots.filter((s) => s.status === 'ready');
  const selectedCount = slots.filter((s) => s.selected && s.status === 'ready').length;
  const allSelected = readySlots.length > 0 && selectedCount === readySlots.length;

  const heroSlots = slots.filter((s) => s.slotGroup === 'hero-variants');
  const catalogSlots = slots.filter((s) => s.slotGroup === 'catalog');

  return (
    <div className="space-y-8">
      {/* Grid Sub-header & Global Select All */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 border-b border-stone-200/80 pb-3">
        <div>
          <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-900 tracking-tight">
            Polished 4K Showcase Grid (6 Output Sets)
          </h3>
          <p className="text-xs text-stone-500">
            Compare with raw photo, inspect details in full 4K, and toggle inclusion in final ZIP export.
          </p>
        </div>

        {readySlots.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectAll(!allSelected)}
              className="text-xs font-semibold text-[#0F3D2E] hover:underline flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {allSelected ? (
                <>
                  <CheckSquare className="w-4 h-4 text-[#0F3D2E]" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-stone-400" />
                  <span>Select All ({readySlots.length})</span>
                </>
              )}
            </button>

            <span className="text-stone-300" aria-hidden="true">·</span>

            <span className="text-xs font-mono font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
              {readySlots.length}/{slots.length} Ready
            </span>
          </div>
        )}
      </div>

      {/* Row 1: Hero – Metal Variants (User Requested 3-Variant Grouping) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]" />
            <h4 className="font-serif-title font-bold text-stone-900 text-sm tracking-wide uppercase">
              Hero – Metal Variants
            </h4>
            <span className="text-[11px] text-stone-500 font-medium">
              (White Gold / Silver · 18K Yellow Gold · 18K Rose Gold)
            </span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">
            Pure White Seamless Packshot
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {heroSlots.map((slot) => (
            <ImageCard
              key={slot.id}
              slot={slot}
              sku={sku}
              rawImageUrl={rawImageUrl}
              onToggleSelect={onToggleSelect}
              onRegenerate={onRegenerate}
              onDownloadSingle={onDownloadSingle}
              onOpenLightbox={onOpenLightbox}
              onOpenCompare={onOpenCompare}
              isAnyGenerating={isAnyGenerating}
            />
          ))}
        </div>
      </div>

      {/* Row 2: Catalog & Editorial Showcase */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F3D2E]" />
            <h4 className="font-serif-title font-bold text-stone-900 text-sm tracking-wide uppercase">
              Catalog & Editorial Shots
            </h4>
            <span className="text-[11px] text-stone-500 font-medium">
              (Luxury Styled · On-Hand Lifestyle · Extreme Macro Detail)
            </span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">
            Editorial & Lifestyle
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {catalogSlots.map((slot) => (
            <ImageCard
              key={slot.id}
              slot={slot}
              sku={sku}
              rawImageUrl={rawImageUrl}
              onToggleSelect={onToggleSelect}
              onRegenerate={onRegenerate}
              onDownloadSingle={onDownloadSingle}
              onOpenLightbox={onOpenLightbox}
              onOpenCompare={onOpenCompare}
              isAnyGenerating={isAnyGenerating}
              onUpdateSlotCallouts={slot.slotKey === 'macro' ? onUpdateSlotCallouts : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
