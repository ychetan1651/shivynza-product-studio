import React from 'react';
import { X, Download, Clock, Archive, ArrowUpRight, Trash2 } from 'lucide-react';
import { SessionHistoryItem } from '../types';
import { formatBytes } from '../utils/imageProcessor';
import JSZip from 'jszip';
import saveAs from 'file-saver';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: SessionHistoryItem[];
  onClearHistory: () => void;
  onRestoreItem: (item: SessionHistoryItem) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onRestoreItem,
}) => {
  if (!isOpen) return null;

  const handleDownloadHistoricalZip = async (item: SessionHistoryItem) => {
    const zip = new JSZip();
    for (const slot of item.slots) {
      if (slot.optimizedUrl) {
        const res = await fetch(slot.optimizedUrl);
        const blob = await res.blob();
        zip.file(`${item.sanitizedSku}-${slot.id}.webp`, blob);
      }
    }
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    saveAs(zipBlob, `${item.sanitizedSku}.zip`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0F3D2E]" />
            <h3 className="font-serif-title font-bold text-base text-stone-900">
              Session History
            </h3>
            <span className="text-xs bg-[#0F3D2E]/10 text-[#0F3D2E] font-semibold px-2 py-0.5 rounded-full">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-xs flex items-center gap-1"
                title="Clear history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-stone-400 px-6">
              <Archive className="w-10 h-10 stroke-1 mb-2 text-stone-300" />
              <p className="text-xs font-semibold text-stone-600">No batch history yet</p>
              <p className="text-[11px] text-stone-400 mt-1">
                Completed product generations in this session will appear here for fast re-downloading.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-stone-200/90 bg-[#FAF8F5]/60 hover:bg-white hover:shadow-xs transition-all flex flex-col gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-stone-100 border border-stone-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.sku}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Archive className="w-5 h-5 text-stone-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-serif-title font-bold text-xs text-stone-900 truncate">
                      {item.sku}
                    </div>
                    <div className="text-[11px] text-stone-500 font-mono mt-0.5 truncate">
                      {item.sanitizedSku}.zip
                    </div>
                    <div className="text-[10px] text-stone-400 mt-1 flex items-center gap-2">
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>·</span>
                      <span>{item.slots.length} shots</span>
                      <span>·</span>
                      <span className="font-mono text-[#0F3D2E] font-semibold">{formatBytes(item.totalSizeBytes)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <button
                    onClick={() => onRestoreItem(item)}
                    className="text-stone-600 hover:text-[#0F3D2E] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Load to Studio</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDownloadHistoricalZip(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F3D2E] hover:bg-[#154D3B] text-white text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="w-3 h-3 text-[#C5A880]" />
                    <span>Download ZIP</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
