import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import {
  Upload,
  X,
  Sparkles,
  Check,
  ChevronDown,
  Camera,
  Loader2,
  RefreshCw,
  Crop,
  ShieldCheck,
  Plus,
  Layers,
  Wand2,
} from 'lucide-react';
import {
  HeroMethod,
  LifestyleGender,
  MacroCallouts,
  MetalType,
  OriginalMetal,
  ProductInput,
  ProductType,
  RawImageItem,
  StoneType,
  StylePreset,
  QualityMode,
} from '../types';
import { getDefaultMacroCallouts, sanitizeSku } from '../utils/prompts';
import { SAMPLE_PRODUCTS, SampleProduct } from '../utils/sampleData';
import { CostWarning } from './CostWarning';
import { isDngFile, decodeDngFile } from '../utils/dngDecoder';
import { rasterizeSvgToPng } from '../utils/imageProcessor';
import { CropModal } from './CropModal';

interface InputSectionProps {
  input: ProductInput;
  onChangeInput: (updater: (prev: ProductInput) => ProductInput) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  qualityMode: QualityMode;
  onToggleQuality: (mode: QualityMode) => void;
  uploadInputRef: React.RefObject<HTMLInputElement | null>;
  onAnalyzeProductFacts?: () => void;
  isAnalyzingFacts?: boolean;
}

const PRODUCT_TYPES: ProductType[] = ['Ring', 'Pendant', 'Earrings', 'Bracelet', 'Chain', 'Other'];

const METALS: MetalType[] = [
  '18K Yellow Gold',
  '18K White Gold',
  '18K Rose Gold',
  '925 Sterling Silver',
  'Platinum',
];

const ORIGINAL_METALS: OriginalMetal[] = [
  'Silver/White Gold',
  'Yellow Gold',
  'Rose Gold',
];

const STONES: StoneType[] = [
  'Lab Grown Diamond',
  'Natural Diamond',
  'Moissanite',
  'Precious Gemstone',
  'None (Plain Metal)',
];

const STYLE_PRESETS: { id: StylePreset; label: string; swatch: string; desc: string }[] = [
  { id: 'White', label: 'White', swatch: 'bg-white border-stone-300', desc: 'Seamless Studio Pure White' },
  { id: 'Cream', label: 'Cream', swatch: 'bg-[#FDF9F3] border-[#E8DEC8]', desc: 'Warm Ivory & Silk Flatlay' },
  { id: 'Blush', label: 'Blush', swatch: 'bg-[#FBF1EE] border-[#ECCBC2]', desc: 'Rose Quartz & Travertine' },
  { id: 'Dark Green', label: 'Dark Green', swatch: 'bg-[#0F3D2E] border-[#09261C]', desc: 'Shivynza Emerald Velvet' },
];

export const InputSection: React.FC<InputSectionProps> = ({
  input,
  onChangeInput,
  onGenerate,
  isGenerating,
  qualityMode,
  onToggleQuality,
  uploadInputRef,
  onAnalyzeProductFacts,
  isAnalyzingFacts = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showSampleMenu, setShowSampleMenu] = useState(false);
  const [isDecodingDng, setIsDecodingDng] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const additionalUploadRef = useRef<HTMLInputElement>(null);

  const cleanSku = sanitizeSku(input.sku);
  const isSkuValid = input.sku.trim().length > 0;
  const isReadyToGenerate = Boolean(input.rawImage && isSkuValid && !isGenerating && !isDecodingDng);

  // Helper to update product fields and automatically synchronize detailing callouts
  const updateInputWithCalloutsAutoSync = (patch: Partial<ProductInput>) => {
    onChangeInput((prev) => {
      const merged = { ...prev, ...patch };
      const isAutoSync = merged.macroCallouts?.autoSync !== false;
      if (isAutoSync && (merged.macroCallouts?.enabled ?? true)) {
        const fresh = getDefaultMacroCallouts({
          metal: merged.metal,
          stoneType: merged.stoneType,
          extraNotes: merged.extraNotes,
          productType: merged.productType,
        });
        return {
          ...merged,
          macroCallouts: {
            ...fresh,
            enabled: merged.macroCallouts?.enabled ?? true,
            autoSync: true,
          },
        };
      }
      return merged;
    });
  };

  // File upload handlers (Supports .DNG raw, PNG, JPG, WebP, SVG, TIFF)
  const handlePrimaryFile = async (file: File) => {
    if (isDngFile(file)) {
      setIsDecodingDng(true);
      try {
        const decoded = await decodeDngFile(file);
        onChangeInput((prev) => ({
          ...prev,
          rawImage: {
            dataUrl: decoded.dataUrl,
            mimeType: decoded.mimeType,
            name: file.name,
            size: file.size,
            width: decoded.width,
            height: decoded.height,
            isRawDng: true,
            cameraModel: decoded.cameraModel,
          },
          sku: prev.sku.trim() ? prev.sku : file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9\s-]/g, ' ').trim(),
        }));
      } catch (err: any) {
        console.error('DNG decoding error:', err);
        alert(err?.message || 'Could not decode the .DNG file. Please ensure it has an embedded camera preview.');
      } finally {
        setIsDecodingDng(false);
      }
      return;
    }

    if (!file.type.match(/^image\/(png|jpeg|jpg|webp|svg\+xml|tiff)$/) && !file.name.match(/\.(png|jpe?g|webp|svg|tiff?)$/i)) {
      alert('Please upload a .DNG, PNG, JPG, WebP, or SVG product image.');
      return;
    }

    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    const reader = new FileReader();
    reader.onload = async (e) => {
      let dataUrl = e.target?.result as string;
      let mimeType = file.type || 'image/png';

      // Always rasterize vector SVG to standard PNG before processing
      if (isSvg || dataUrl.startsWith('data:image/svg')) {
        try {
          dataUrl = await rasterizeSvgToPng(dataUrl, 1600);
          mimeType = 'image/png';
        } catch (err) {
          console.warn('SVG rasterization failed, using original:', err);
        }
      }

      const img = new Image();
      img.onload = () => {
        onChangeInput((prev) => ({
          ...prev,
          rawImage: {
            dataUrl,
            mimeType,
            name: file.name,
            size: file.size,
            width: img.naturalWidth || 1600,
            height: img.naturalHeight || 1600,
            isRawDng: false,
          },
          sku: prev.sku.trim() ? prev.sku : file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9\s-]/g, ' ').trim(),
        }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleAdditionalFile = async (file: File) => {
    if (input.additionalImages.length >= 2) {
      alert('You can upload up to 3 total reference photos (1 Primary + 2 Angles).');
      return;
    }

    // Support .DNG and camera RAW files for additional angles
    if (isDngFile(file)) {
      setIsDecodingDng(true);
      try {
        const decoded = await decodeDngFile(file);
        const item: RawImageItem = {
          dataUrl: decoded.dataUrl,
          mimeType: decoded.mimeType,
          name: file.name,
          size: file.size,
          width: decoded.width,
          height: decoded.height,
          isRawDng: true,
          cameraModel: decoded.cameraModel,
        };
        onChangeInput((prev) => ({
          ...prev,
          additionalImages: [...prev.additionalImages, item],
        }));
      } catch (err: any) {
        console.error('DNG decoding error on additional angle:', err);
        alert(err?.message || 'Could not decode the .DNG file. Please ensure it has an embedded camera preview.');
      } finally {
        setIsDecodingDng(false);
      }
      return;
    }

    if (!file.type.match(/^image\/(png|jpeg|jpg|webp|svg\+xml|tiff)$/) && !file.name.match(/\.(png|jpe?g|webp|svg|tiff?)$/i)) {
      alert('Please upload a .DNG, PNG, JPG, WebP, or SVG product image.');
      return;
    }

    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    const reader = new FileReader();
    reader.onload = async (e) => {
      let dataUrl = e.target?.result as string;
      let mimeType = file.type || 'image/png';

      // Always rasterize vector SVG to standard PNG before processing
      if (isSvg || dataUrl.startsWith('data:image/svg')) {
        try {
          dataUrl = await rasterizeSvgToPng(dataUrl, 1600);
          mimeType = 'image/png';
        } catch (err) {
          console.warn('SVG rasterization failed, using original:', err);
        }
      }

      const img = new Image();
      img.onload = () => {
        const item: RawImageItem = {
          dataUrl,
          mimeType,
          name: file.name,
          size: file.size,
          width: img.naturalWidth || 1600,
          height: img.naturalHeight || 1600,
          isRawDng: false,
        };
        onChangeInput((prev) => ({
          ...prev,
          additionalImages: [...prev.additionalImages, item],
        }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePrimaryFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePrimary = () => {
    onChangeInput((prev) => ({ ...prev, rawImage: null }));
    if (uploadInputRef.current) {
      uploadInputRef.current.value = '';
    }
  };

  const handleRemoveAdditional = (index: number) => {
    onChangeInput((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }));
  };

  const handleSelectSample = async (sample: SampleProduct) => {
    let dataUrl = sample.dataUrl;
    let mimeType = 'image/png';

    if (sample.dataUrl.startsWith('data:image/svg') || sample.filename.toLowerCase().endsWith('.svg')) {
      try {
        dataUrl = await rasterizeSvgToPng(sample.dataUrl, 1200);
      } catch (err) {
        console.warn('Could not rasterize sample SVG, using raw dataUrl:', err);
      }
    }

    const sampleCallouts = getDefaultMacroCallouts(sample);

    onChangeInput((prev) => ({
      ...prev,
      rawImage: {
        dataUrl,
        mimeType,
        name: sample.filename,
        size: Math.round(dataUrl.length * 0.75),
        width: 1200,
        height: 1200,
        isRawDng: sample.isRawDng,
        cameraModel: sample.cameraModel,
      },
      sku: sample.name,
      productType: sample.productType,
      metal: sample.metal,
      stoneType: sample.stoneType,
      lifestyleGender: sample.lifestyleGender,
      extraNotes: sample.extraNotes,
      stylePreset: sample.stylePreset,
      macroCallouts: sampleCallouts,
      productFacts: [
        `• Product Type: ${sample.productType}`,
        `• Metal: ${sample.metal} mirror polish`,
        `• Primary Stones: ${sample.stoneType} with optical symmetry`,
        `• Setting: Secure basket setting with handcrafted prongs`,
        `• Proportions: True-to-life 1:1 scale`,
      ].join('\n'),
    }));
    setShowSampleMenu(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 space-y-6">
      {/* Section Header with Quick Sample Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <h2 className="font-serif-title text-lg font-bold text-stone-900 tracking-tight">
            Raw Product Intake & Multi-Angle References
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Upload up to 3 raw photos (different angles). The jewelry is preserved pixel-faithfully.
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSampleMenu((prev) => !prev)}
            className="px-3.5 py-1.5 rounded-lg border border-[#C5A880]/60 bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#0F3D2E] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Load Jewelry Sample</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {showSampleMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-stone-200 shadow-xl z-20 py-1.5">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider border-b border-stone-100">
                Preset Catalog Pieces
              </div>
              {SAMPLE_PRODUCTS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-[#FAF8F5] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div>
                    <span className="font-medium text-stone-900 block">{sample.name}</span>
                    <span className="text-[10px] text-stone-500">
                      {sample.productType} • {sample.metal}
                    </span>
                  </div>
                  {sample.isRawDng && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#0F3D2E] text-white">
                      DNG
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 1. Multi-Angle Reference Photos (Up to 3 Photos) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-stone-800 tracking-wide uppercase">
            Product Photos <span className="text-rose-500">*</span>
            <span className="text-stone-400 font-normal lowercase ml-1">
              (Primary photo required · up to 3 angles sent as references)
            </span>
          </label>
          <span className="text-[11px] text-[#0F3D2E] font-medium font-mono">
            {1 + input.additionalImages.length}/3 Photos Attached
          </span>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={uploadInputRef}
          type="file"
          accept=".dng,.raw,.png,.jpg,.jpeg,.webp,.svg,.tif,.tiff,image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handlePrimaryFile(e.target.files[0]);
            }
          }}
          className="hidden"
          id="primary-photo-upload"
        />

        <input
          ref={additionalUploadRef}
          type="file"
          accept=".dng,.raw,.png,.jpg,.jpeg,.webp,.svg,.tif,.tiff,image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleAdditionalFile(e.target.files[0]);
            }
            e.target.value = '';
          }}
          className="hidden"
          id="additional-photo-upload"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Primary Reference Image Card */}
          <div className="md:col-span-2">
            {!input.rawImage ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => uploadInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all h-full flex flex-col items-center justify-center min-h-[160px] ${
                  isDragging
                    ? 'border-[#0F3D2E] bg-emerald-50/40'
                    : 'border-stone-200 hover:border-[#0F3D2E]/40 hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-stone-200 mx-auto flex items-center justify-center text-[#0F3D2E] mb-2">
                  {isDecodingDng ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#0F3D2E]" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <p className="text-xs font-semibold text-stone-800">
                  {isDecodingDng ? 'Decoding .DNG RAW preview...' : 'Upload Primary Raw Jewelry Photo'}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Drag & drop or click. Native resolution preserved (no downscaling). Supports .DNG, PNG, JPG, WebP.
                </p>
              </div>
            ) : (
              <div className="relative rounded-2xl border border-stone-200 p-3 bg-[#FAF8F5] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-200 relative group">
                    <img
                      src={input.rawImage.dataUrl}
                      alt="Primary jewelry reference"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0F3D2E] text-white">
                        PRIMARY
                      </span>
                      {input.rawImage.isRawDng && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#C5A880] text-stone-900">
                          DNG RAW
                        </span>
                      )}
                      <p className="text-xs font-semibold text-stone-900 truncate">
                        {input.rawImage.name}
                      </p>
                    </div>
                    <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                      {input.rawImage.width}×{input.rawImage.height}px • {(input.rawImage.size / (1024 * 1024)).toFixed(2)} MB
                      {input.rawImage.cameraModel ? ` • ${input.rawImage.cameraModel}` : ''}
                    </p>
                    <p className="text-[10px] text-emerald-800 font-medium mt-0.5 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Full pixel fidelity sent to model</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCropModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Crop tight around jewelry before generating"
                  >
                    <Crop className="w-3.5 h-3.5 text-[#0F3D2E]" />
                    <span>Crop Tool</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemovePrimary}
                    className="p-1.5 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                    title="Remove primary image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Additional Angle References (Angle 2 & Angle 3) */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-stone-600 flex items-center justify-between">
              <span>Additional Angles (Optional)</span>
              <span className="text-stone-400 font-mono">{input.additionalImages.length}/2</span>
            </div>

            <div className="space-y-2">
              {input.additionalImages.map((img, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-stone-200 p-2.5 bg-[#FAF8F5] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={img.dataUrl}
                      alt={`Angle ${idx + 2}`}
                      className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#0F3D2E]">
                          ANGLE {idx + 2}
                        </span>
                        {img.isRawDng && (
                          <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-[#C5A880] text-stone-900">
                            DNG RAW
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-800 truncate block font-medium">
                        {img.name}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono block">
                        {img.width}×{img.height}px • {(img.size / (1024 * 1024)).toFixed(1)} MB
                        {img.cameraModel ? ` • ${img.cameraModel}` : ''}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAdditional(idx)}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
                    title="Remove this angle"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {input.additionalImages.length < 2 && (
                <button
                  type="button"
                  disabled={isDecodingDng}
                  onClick={() => additionalUploadRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-stone-300 hover:border-[#0F3D2E]/40 hover:bg-[#FAF8F5] text-stone-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isDecodingDng ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0F3D2E]" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-[#0F3D2E]" />
                  )}
                  <span>{isDecodingDng ? 'Decoding .DNG RAW preview...' : `+ Add Angle ${input.additionalImages.length + 2} Photo (.DNG / RAW / PNG)`}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Product Analysis Pass: Gemini Vision Structured Facts (Requirement 1b) */}
      <div className="rounded-xl border border-[#0F3D2E]/20 bg-[#FAF8F5] p-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0F3D2E]" />
            <label className="text-xs font-bold text-stone-900 tracking-wide uppercase">
              Product Facts (Vision AI Verified · Injected into Prompts)
            </label>
          </div>

          <button
            type="button"
            onClick={onAnalyzeProductFacts}
            disabled={!input.rawImage || isAnalyzingFacts}
            className="px-3 py-1.5 rounded-lg bg-[#0F3D2E] text-white hover:bg-[#154D3B] disabled:opacity-40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Scan raw jewelry with Gemini 2.5 Flash to extract exact stone count, cuts, setting, and metal facts"
          >
            {isAnalyzingFacts ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Auditing Jewelry Features...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3 h-3 text-[#C5A880]" />
                <span>Analyze Jewelry with Vision AI</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-stone-600">
          Gemini Vision inspects the photo and produces exact structured facts (stone count, cut, setting, prongs, band profile). You can review or edit below; these are injected into every prompt under <em>"PRODUCT FACTS (must match exactly)"</em>.
        </p>

        <textarea
          rows={4}
          value={input.productFacts}
          onChange={(e) => onChangeInput((prev) => ({ ...prev, productFacts: e.target.value }))}
          placeholder="• Product Type: Solitaire Ring&#10;• Metal Color: 18K Yellow Gold with mirror polish&#10;• Stones: 1 Round Brilliant center stone + 16 pavé shoulder stones&#10;• Setting: 4-prong claw basket with hidden gallery halo&#10;• Band Style: 2mm comfort-fit rounded shank"
          className="w-full text-xs font-mono bg-white border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#0F3D2E] resize-none"
        />
      </div>

      {/* 3. Product Specifications & Metal Variants Controls */}
      <div className="space-y-4">
        {/* SKU / Name */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="sku-input" className="block text-xs font-semibold text-stone-800 tracking-wide uppercase">
              Product Name / SKU <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-stone-400 font-mono">ZIP & WebP Prefix</span>
          </div>
          <input
            id="sku-input"
            type="text"
            value={input.sku}
            onChange={(e) => {
              const val = e.target.value;
              onChangeInput((prev) => ({ ...prev, sku: val }));
            }}
            placeholder="e.g. Diamond Halo Ring - R101"
            className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-all font-medium"
          />
          {input.sku && (
            <p className="text-[11px] text-stone-500 mt-1 font-mono">
              ZIP Output: <span className="text-[#0F3D2E] font-semibold">{cleanSku}.zip</span> ({cleanSku}-1-silver.webp, {cleanSku}-1-yellow-gold.webp, {cleanSku}-1-rose-gold.webp, {cleanSku}-2.webp, etc.)
            </p>
          )}
        </div>

        {/* Hero Method & Original Metal Color Controls (Requirements 1g & 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-[#C5A880]/30 bg-gradient-to-br from-[#FAF8F5] to-[#F5EFE6]">
          {/* Hero Method */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="hero-method-select" className="block text-xs font-bold text-stone-900 tracking-wide uppercase">
                Hero Image (Image 1) Method
              </label>
              <span className="text-[10px] text-emerald-800 font-semibold">Recommended</span>
            </div>
            <select
              id="hero-method-select"
              value={input.heroMethod}
              onChange={(e) => {
                const val = e.target.value as HeroMethod;
                onChangeInput((prev) => ({ ...prev, heroMethod: val }));
              }}
              className="mt-1.5 w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 font-semibold cursor-pointer"
            >
              <option value="exact">Exact photo (recommended) — 100% Identical Cut-out</option>
              <option value="ai">AI polish — Gemini Pixel-Faithful Editing</option>
            </select>
            <p className="text-[10px] text-stone-500 mt-1">
              {input.heroMethod === 'exact'
                ? 'Removes background in browser, centers original cut-out on pure white 1:1 canvas with 12% padding, soft contact shadow, and sharpening. Product stays 100% identical.'
                : 'Uses Gemini image editing to place jewelry on pure white studio cyclorama.'}
            </p>
          </div>

          {/* Original Metal Color */}
          <div>
            <label htmlFor="original-metal-select" className="block text-xs font-bold text-stone-900 tracking-wide uppercase">
              Original Metal Color in Photo
            </label>
            <select
              id="original-metal-select"
              value={input.originalMetal}
              onChange={(e) => {
                const val = e.target.value as OriginalMetal;
                onChangeInput((prev) => ({ ...prev, originalMetal: val }));
              }}
              className="mt-1.5 w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 font-semibold cursor-pointer"
            >
              {ORIGINAL_METALS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-stone-500 mt-1">
              Specifies the raw metal so the other two variants are generated by targeted metal recoloring.
            </p>
          </div>

          {/* Generate Variants Checkboxes */}
          <div className="sm:col-span-2 pt-2 border-t border-stone-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-stone-800">
              Generate Hero Metal Variants:
            </span>
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={input.variantToggles.silver}
                  onChange={(e) =>
                    onChangeInput((prev) => ({
                      ...prev,
                      variantToggles: { ...prev.variantToggles, silver: e.target.checked },
                    }))
                  }
                  className="w-3.5 h-3.5 rounded text-[#0F3D2E] focus:ring-[#0F3D2E]/20"
                />
                <span>Silver / White Gold</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={input.variantToggles.yellowGold}
                  onChange={(e) =>
                    onChangeInput((prev) => ({
                      ...prev,
                      variantToggles: { ...prev.variantToggles, yellowGold: e.target.checked },
                    }))
                  }
                  className="w-3.5 h-3.5 rounded text-[#0F3D2E] focus:ring-[#0F3D2E]/20"
                />
                <span>18K Yellow Gold</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={input.variantToggles.roseGold}
                  onChange={(e) =>
                    onChangeInput((prev) => ({
                      ...prev,
                      variantToggles: { ...prev.variantToggles, roseGold: e.target.checked },
                    }))
                  }
                  className="w-3.5 h-3.5 rounded text-[#0F3D2E] focus:ring-[#0F3D2E]/20"
                />
                <span>18K Rose Gold</span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Type & Body Model Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="product-type-select" className="block text-xs font-semibold text-stone-800 tracking-wide uppercase">
              Product Category
            </label>
            <select
              id="product-type-select"
              value={input.productType}
              onChange={(e) => {
                updateInputWithCalloutsAutoSync({ productType: e.target.value as ProductType });
              }}
              className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-all cursor-pointer font-medium"
            >
              {PRODUCT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-stone-800 tracking-wide uppercase">
                Image 3 Lifestyle Body Model
              </label>
              <span className="text-[10px] text-stone-400 font-mono">Lifestyle Anatomy</span>
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5 p-1 bg-[#FAF8F5] rounded-lg border border-stone-200">
              <button
                type="button"
                onClick={() => onChangeInput((prev) => ({ ...prev, lifestyleGender: 'Female' }))}
                className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  input.lifestyleGender === 'Female'
                    ? 'bg-[#0F3D2E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>Female Body</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeInput((prev) => ({ ...prev, lifestyleGender: 'Male' }))}
                className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  input.lifestyleGender === 'Male'
                    ? 'bg-[#0F3D2E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>Male Body</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metal & Gemstone Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="metal-select" className="block text-xs font-semibold text-stone-800 tracking-wide uppercase">
              Catalog Precious Metal
            </label>
            <select
              id="metal-select"
              value={input.metal}
              onChange={(e) => {
                updateInputWithCalloutsAutoSync({ metal: e.target.value as MetalType });
              }}
              className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-all cursor-pointer font-medium"
            >
              {METALS.map((metal) => (
                <option key={metal} value={metal}>
                  {metal}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stone-select" className="block text-xs font-semibold text-stone-800 tracking-wide uppercase">
              Diamond & Gemstone Category
            </label>
            <select
              id="stone-select"
              value={input.stoneType}
              onChange={(e) => {
                updateInputWithCalloutsAutoSync({ stoneType: e.target.value as StoneType });
              }}
              className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-all cursor-pointer font-medium"
            >
              {STONES.map((stone) => (
                <option key={stone} value={stone}>
                  {stone}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Background Style Preset */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-stone-800 tracking-wide uppercase">
              Background Style Preset (Image 2)
            </label>
            <span className="text-[10px] text-stone-400 font-mono">Editorial Surface</span>
          </div>
          <div className="mt-1.5 grid grid-cols-4 gap-1.5">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onChangeInput((prev) => ({ ...prev, stylePreset: preset.id }));
                  localStorage.setItem('shivynza_style_preset', preset.id);
                }}
                className={`flex flex-col items-center p-2 rounded-lg border text-[11px] transition-all cursor-pointer ${
                  input.stylePreset === preset.id
                    ? 'border-[#0F3D2E] bg-emerald-50/40 text-[#0F3D2E] font-bold shadow-xs'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
                title={preset.desc}
              >
                <span className={`w-4 h-4 rounded-full border mb-1.5 ${preset.swatch}`} />
                <span className="truncate max-w-full font-medium">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Extra Notes & Macro Art Direction */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="extra-notes-input" className="block text-xs font-semibold text-stone-800 tracking-wide uppercase">
              Extra Notes & Art Direction <span className="text-[#0F3D2E] font-semibold">(Ref words for Image 4 Macro)</span>
            </label>
            <span className="text-[10px] text-stone-400 font-mono">Craftsmanship details</span>
          </div>
          <textarea
            id="extra-notes-input"
            rows={2}
            value={input.extraNotes}
            onChange={(e) => {
              updateInputWithCalloutsAutoSync({ extraNotes: e.target.value });
            }}
            placeholder="e.g. Pavé shoulder prongs, vintage milgrain edge, 8-heart optical symmetry, micro-claw basket, high contrast fire"
            className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-all resize-none"
          />
        </div>

        {/* 4. Product Detailing Callouts with Auto-Sync */}
        <div className="rounded-xl border border-[#C5A880]/40 bg-gradient-to-br from-[#FAF8F5] to-[#F4EFE6] p-4 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F3D2E] animate-pulse" />
              <label className="text-xs font-bold text-stone-900 tracking-wide uppercase">
                Image 4 · Product Detailing Callouts
              </label>
              {input.macroCallouts?.autoSync !== false ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                  <span>Auto-Synced with Specs</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <span>Custom Edits</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const nextSync = input.macroCallouts?.autoSync === false;
                  if (nextSync) {
                    const fresh = getDefaultMacroCallouts({
                      metal: input.metal,
                      stoneType: input.stoneType,
                      extraNotes: input.extraNotes,
                      productType: input.productType,
                    });
                    onChangeInput((prev) => ({
                      ...prev,
                      macroCallouts: {
                        ...fresh,
                        enabled: prev.macroCallouts?.enabled ?? true,
                        autoSync: true,
                      },
                    }));
                  } else {
                    onChangeInput((prev) => ({
                      ...prev,
                      macroCallouts: {
                        ...prev.macroCallouts,
                        autoSync: false,
                      },
                    }));
                  }
                }}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                  input.macroCallouts?.autoSync !== false
                    ? 'bg-[#0F3D2E]/10 text-[#0F3D2E] hover:bg-[#0F3D2E]/20'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
                title="Toggle Auto-Syncing with Precious Metal, Diamond Category, and Art Notes"
              >
                <RefreshCw className={`w-3 h-3 ${input.macroCallouts?.autoSync !== false ? 'text-[#0F3D2E]' : 'text-stone-500'}`} />
                <span>Auto-Sync: {input.macroCallouts?.autoSync !== false ? 'ON' : 'OFF'}</span>
              </button>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={input.macroCallouts?.enabled ?? true}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    onChangeInput((prev) => ({
                      ...prev,
                      macroCallouts: { ...prev.macroCallouts, enabled },
                    }));
                  }}
                  className="w-3.5 h-3.5 rounded border-stone-300 text-[#0F3D2E] focus:ring-[#0F3D2E]/20"
                />
                <span>Active</span>
              </label>
            </div>
          </div>

          <p className="text-[11px] text-stone-600">
            Draws luxury catalog pointer lines and typography onto Image 4 (Macro Detail) highlighting metal purity, diamond category, hallmark, and craftsmanship.
          </p>

          {input.macroCallouts?.enabled && (
            <div className="space-y-2.5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Top-Left: Gemstone */}
                <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-stone-500 uppercase mb-1">
                    <span>Top-Left (Stone Specification)</span>
                    <span className="text-[#0F3D2E]">↖ Pointer 1</span>
                  </div>
                  <textarea
                    rows={2}
                    value={input.macroCallouts?.topLeft || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChangeInput((prev) => ({
                        ...prev,
                        macroCallouts: { ...prev.macroCallouts, topLeft: val, autoSync: false },
                      }));
                    }}
                    placeholder="e.g. Natural / Lab Grown&#10;Diamond"
                    className="w-full text-xs font-serif bg-[#FAF8F5] border border-stone-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-[#0F3D2E] resize-none"
                  />
                </div>

                {/* Top-Right: Metal */}
                <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-stone-500 uppercase mb-1">
                    <span>Top-Right (Precious Metal)</span>
                    <span className="text-[#0F3D2E]">↗ Pointer 2</span>
                  </div>
                  <textarea
                    rows={2}
                    value={input.macroCallouts?.topRight || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChangeInput((prev) => ({
                        ...prev,
                        macroCallouts: { ...prev.macroCallouts, topRight: val, autoSync: false },
                      }));
                    }}
                    placeholder="e.g. 18K White Gold /&#10;925 Silver"
                    className="w-full text-xs font-serif bg-[#FAF8F5] border border-stone-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-[#0F3D2E] resize-none"
                  />
                </div>

                {/* Bottom-Left: Hallmark */}
                <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-stone-500 uppercase mb-1">
                    <span>Bottom-Left (Hallmark & Purity)</span>
                    <span className="text-[#0F3D2E]">↙ Pointer 3</span>
                  </div>
                  <textarea
                    rows={2}
                    value={input.macroCallouts?.bottomLeft || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChangeInput((prev) => ({
                        ...prev,
                        macroCallouts: { ...prev.macroCallouts, bottomLeft: val, autoSync: false },
                      }));
                    }}
                    placeholder="e.g. Hallmarked&#10;Jewellery"
                    className="w-full text-xs font-serif bg-[#FAF8F5] border border-stone-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-[#0F3D2E] resize-none"
                  />
                </div>

                {/* Bottom-Right: Finish */}
                <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-stone-500 uppercase mb-1">
                    <span>Bottom-Right (Craftsmanship Finish)</span>
                    <span className="text-[#0F3D2E]">↘ Pointer 4</span>
                  </div>
                  <textarea
                    rows={2}
                    value={input.macroCallouts?.bottomRight || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChangeInput((prev) => ({
                        ...prev,
                        macroCallouts: { ...prev.macroCallouts, bottomRight: val, autoSync: false },
                      }));
                    }}
                    placeholder="e.g. Handcrafted&#10;Finish"
                    className="w-full text-xs font-serif bg-[#FAF8F5] border border-stone-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-[#0F3D2E] resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Strict QA Mode Toggle (Requirement 1e) */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200 bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">
                  Strict Vision QA Verification
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Default ON
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Audits stone count, cuts, setting & proportions after each generation. Auto-retries up to 2x if score &lt; 7.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={input.strictMode}
              onChange={(e) =>
                onChangeInput((prev) => ({ ...prev, strictMode: e.target.checked }))
              }
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F3D2E]" />
          </label>
        </div>

        {/* Cost & Batch Notice */}
        <CostWarning
          qualityMode={qualityMode}
          onToggleQuality={onToggleQuality}
          heroMethod={input.heroMethod}
          strictMode={input.strictMode}
          activeVariantsCount={
            (input.variantToggles.silver ? 1 : 0) +
            (input.variantToggles.yellowGold ? 1 : 0) +
            (input.variantToggles.roseGold ? 1 : 0)
          }
        />

        {/* Primary Action Button */}
        <div>
          <button
            type="button"
            onClick={onGenerate}
            disabled={!isReadyToGenerate}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#0F3D2E] via-[#134A38] to-[#0F3D2E] hover:from-[#134A38] hover:to-[#175742] text-white font-serif-title text-base font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.005] active:scale-[0.995] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Synthesizing 6 E-Commerce Product Images...</span>
              </>
            ) : isDecodingDng ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Reading Camera .DNG RAW...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-[#C5A880]" />
                <span>Generate 6 Polished Images</span>
              </>
            )}
          </button>

          {!input.rawImage ? (
            <p className="text-[11px] text-stone-400 text-center mt-2">
              Please attach a raw jewelry photo above to proceed.
            </p>
          ) : !isSkuValid ? (
            <p className="text-[11px] text-stone-400 text-center mt-2">
              Product Name / SKU is required for ZIP and WebP naming.
            </p>
          ) : null}
        </div>
      </div>

      {/* Crop Modal */}
      {isCropModalOpen && input.rawImage && (
        <CropModal
          isOpen={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
          imageUrl={input.rawImage.dataUrl}
          imageName={input.rawImage.name}
          onApplyCrop={(croppedDataUrl, width, height) => {
            onChangeInput((prev) => ({
              ...prev,
              rawImage: prev.rawImage
                ? {
                    ...prev.rawImage,
                    dataUrl: croppedDataUrl,
                    width,
                    height,
                  }
                : null,
            }));
          }}
        />
      )}
    </div>
  );
};
