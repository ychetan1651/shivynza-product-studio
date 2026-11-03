import React from 'react';
import { Info, Zap, ShieldCheck } from 'lucide-react';
import { HeroMethod, QualityMode } from '../types';

interface CostWarningProps {
  qualityMode: QualityMode;
  onToggleQuality: (mode: QualityMode) => void;
  heroMethod?: HeroMethod;
  strictMode?: boolean;
  activeVariantsCount?: number;
}

export const CostWarning: React.FC<CostWarningProps> = ({
  qualityMode,
  onToggleQuality,
  heroMethod = 'exact',
  strictMode = true,
  activeVariantsCount = 3,
}) => {
  // 3 catalog shots + (active hero variants: if exact method, 1 is free browser cut-out)
  const isExact = heroMethod === 'exact';
  const generativeHeroCount = isExact ? Math.max(0, activeVariantsCount - 1) : activeVariantsCount;
  const totalGenerations = 3 + generativeHeroCount; // 3 catalog + AI hero variants
  const perImageCost = qualityMode === 'draft' ? 0.04 : 0.08;
  const totalGenCost = totalGenerations * perImageCost;
  const verificationCost = strictMode ? totalGenerations * 0.0005 : 0;
  const visionAuditCost = 0.0005;
  const totalCost = (totalGenCost + verificationCost + visionAuditCost).toFixed(2);

  if (qualityMode === 'draft') {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>
            <strong>Draft Mode (1K) active:</strong> Fast ~${totalCost} total ({totalGenerations} AI generations @ $0.04 {strictMode ? '+ Vision QA verification' : ''}).
          </span>
        </div>
        <button
          onClick={() => onToggleQuality('final')}
          className="text-emerald-800 hover:text-emerald-950 underline font-semibold cursor-pointer shrink-0"
        >
          Switch to 4K Production
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#C5A880]/30 text-xs text-stone-700">
      <div className="flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-[#0F3D2E] shrink-0" />
        <span>
          <strong>Estimated Batch Cost:</strong> ~${totalCost} for up to {totalGenerations} AI outputs ({isExact ? '1 Exact Photo cut-out free in browser, ' : ''}{generativeHeroCount} Hero variants + 3 catalog shots {strictMode ? '+ Gemini Vision QA verification audits' : ''}).
        </span>
      </div>
      <button
        onClick={() => onToggleQuality('draft')}
        className="text-[#0F3D2E] hover:underline font-semibold cursor-pointer shrink-0"
      >
        Use Draft (1K)
      </button>
    </div>
  );
};
