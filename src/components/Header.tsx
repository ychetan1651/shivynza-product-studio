import React from 'react';
import { Sparkles, RotateCcw, Settings, Clock } from 'lucide-react';
import { QualityMode } from '../types';

interface HeaderProps {
  onNewProduct: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  qualityMode: QualityMode;
  model: string;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewProduct,
  onOpenSettings,
  onOpenHistory,
  historyCount,
  qualityMode,
  model,
  isGenerating,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#0F3D2E]/10 px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#0F3D2E] flex items-center justify-center text-[#C5A880] shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif-title text-xl font-bold tracking-tight text-[#0F3D2E] whitespace-nowrap leading-none">
              Shivynza Product Studio
            </span>
            <span className="text-[11px] font-medium text-stone-500 tracking-wider uppercase mt-1">
              Fine Jewelry 4K Catalog Generator
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation & Status Indicators */}
        <div className="hidden lg:flex items-center gap-6 text-xs text-stone-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-stone-400">Active Model:</span>
            <span className="font-mono text-stone-800 bg-[#F4F1EA] px-2 py-0.5 rounded text-[11px]">
              {model.replace('gemini-', '')}
            </span>
          </div>
          <span className="text-stone-300" aria-hidden="true">·</span>
          <div className="flex items-center gap-2">
            <span className="text-stone-400">Resolution:</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${qualityMode === 'final' ? 'bg-[#0F3D2E]/10 text-[#0F3D2E]' : 'bg-amber-100 text-amber-800'}`}>
              {qualityMode === 'final' ? '4K Ultra (4096px)' : '1K Draft (1024px)'}
            </span>
          </div>
          <span className="text-stone-300" aria-hidden="true">·</span>
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 hover:text-[#0F3D2E] transition-colors cursor-pointer"
            title="View products processed in this session"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Session History</span>
            {historyCount > 0 && (
              <span className="bg-[#0F3D2E] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {historyCount}
              </span>
            )}
          </button>
        </div>

        {/* Zone 3: Primary Action & Settings */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-stone-600 hover:text-[#0F3D2E] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
            title="Settings & API Key"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onNewProduct}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#0F3D2E] bg-[#F4F1EA] hover:bg-[#ECE7DE] border border-[#0F3D2E]/15 rounded-lg shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer whitespace-nowrap"
            title="Clear all inputs and reset for next product"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Product</span>
          </button>
        </div>
      </div>
    </header>
  );
};
