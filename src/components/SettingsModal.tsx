import React, { useState } from 'react';
import { X, Key, Cpu, Zap, Shield, HelpCircle, Check, Eye, EyeOff } from 'lucide-react';
import { AppSettings, QualityMode, StylePreset } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onClose: () => void;
  hasEnvKey: boolean;
}

const MODELS = [
  {
    id: 'gemini-3-pro-image',
    name: 'Nano Banana Pro (gemini-3-pro-image)',
    description: 'Premier 4K jewelry model with maximum diamond brilliance, facet clarity, and realism (Default)',
    supports4K: true,
  },
  {
    id: 'gemini-nano-banana-2.1',
    name: 'Nano Banana 2.1 (gemini-nano-banana-2.1)',
    description: 'High-quality 4K/2K/1K image generation with fast turnarounds',
    supports4K: true,
  },
  {
    id: 'gemini-3.1-flash-lite-image',
    name: 'Nano Banana Lite (gemini-3.1-flash-lite-image)',
    description: 'Ultra-fast draft testing model (1K output, lower cost)',
    supports4K: false,
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
  hasEnvKey,
}) => {
  const [form, setForm] = useState<AppSettings>({ ...settings });
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    localStorage.setItem('shivynza_api_key', form.apiKey);
    localStorage.setItem('shivynza_model', form.model);
    localStorage.setItem('shivynza_quality_mode', form.qualityMode);
    localStorage.setItem('shivynza_demo_mode', String(form.demoMode));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <h3 className="font-serif-title font-bold text-lg text-stone-900">
              Studio Configuration & Settings
            </h3>
            <p className="text-xs text-stone-500">
              Configure your Gemini image engine, quality thresholds, and credentials.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Gemini API Key */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="settings-api-key" className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 tracking-wide uppercase">
                <Key className="w-3.5 h-3.5 text-[#0F3D2E]" />
                <span>Gemini API Key</span>
              </label>
              {hasEnvKey && (
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium flex items-center gap-1 border border-emerald-200/60">
                  <Shield className="w-3 h-3" />
                  <span>Env key detected</span>
                </span>
              )}
            </div>

            <div className="relative mt-1.5">
              <input
                id="settings-api-key"
                type={showKey ? 'text' : 'password'}
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder={hasEnvKey ? 'Using server environment GEMINI_API_KEY (leave blank or override)' : 'Enter your Gemini API key'}
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-[#FAF8F5] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Stored securely in your local browser storage. Never hardcoded.
            </p>
          </div>

          {/* Model Selector */}
          <div>
            <label htmlFor="settings-model" className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 tracking-wide uppercase">
              <Cpu className="w-3.5 h-3.5 text-[#0F3D2E]" />
              <span>Gemini Image Model</span>
            </label>
            <select
              id="settings-model"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="mt-1.5 w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-all cursor-pointer font-medium"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.supports4K ? '(4K Ready)' : '(1K Draft)'}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-stone-500 mt-1">
              {MODELS.find((m) => m.id === form.model)?.description || 'Custom configured model'}
            </p>
          </div>

          {/* Quality Mode Toggle */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 tracking-wide uppercase">
              <Zap className="w-3.5 h-3.5 text-[#0F3D2E]" />
              <span>Generation Quality Level</span>
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2 p-1 bg-[#FAF8F5] rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => setForm({ ...form, qualityMode: 'final' })}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex flex-col items-center ${
                  form.qualityMode === 'final'
                    ? 'bg-white text-[#0F3D2E] font-bold shadow-xs border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>Final Production (4K)</span>
                <span className="text-[10px] text-stone-400 font-normal">4096×4096 px resolution</span>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, qualityMode: 'draft' })}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex flex-col items-center ${
                  form.qualityMode === 'draft'
                    ? 'bg-white text-emerald-800 font-bold shadow-xs border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>Draft Mode (1K)</span>
                <span className="text-[10px] text-stone-400 font-normal">1024×1024 px for speed/testing</span>
              </button>
            </div>
          </div>

          {/* Demo / Simulation Mode Toggle */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-amber-900 block">
                Offline Simulation / Demo Mode
              </span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Generate procedural jewelry studio packshots locally without consuming Gemini API tokens. Great for testing ZIP workflows and UI speeds.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.demoMode}
              onChange={(e) => setForm({ ...form, demoMode: e.target.checked })}
              className="w-4 h-4 rounded text-[#0F3D2E] focus:ring-[#0F3D2E]/20 mt-1 cursor-pointer"
            />
          </div>

          {/* Footer Save Button */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0F3D2E] hover:bg-[#154D3B] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
