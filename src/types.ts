export type ProductType = 'Ring' | 'Pendant' | 'Earrings' | 'Bracelet' | 'Chain' | 'Other';

export type StylePreset = 'White' | 'Cream' | 'Blush' | 'Dark Green';

export type QualityMode = 'draft' | 'final';

export type ExportSize = 4096 | 2048 | 1600;

export type SlotStatus = 'idle' | 'generating' | 'processing' | 'verifying' | 'ready' | 'error';

export type HeroMethod = 'exact' | 'ai';

export type OriginalMetal = 'Silver/White Gold' | 'Yellow Gold' | 'Rose Gold';

export interface VariantToggles {
  silver: boolean;
  yellowGold: boolean;
  roseGold: boolean;
}

export interface AccuracyVerification {
  score: number;             // 1-10
  differences: string[];     // list of detected discrepancies
  summary?: string;          // brief overall verdict
  verifiedAt?: number;
}

export interface MacroCallouts {
  enabled: boolean;
  autoSync?: boolean;        // whether callouts auto-synchronize with metal/stone/notes
  topLeft: string;           // e.g. "Natural / Lab Grown\nDiamond"
  topRight: string;          // e.g. "18K White Gold /\n925 Silver"
  bottomLeft: string;        // e.g. "Hallmarked\nJewellery"
  bottomRight: string;       // e.g. "Handcrafted\nFinish"
}

export type SlotKey =
  | 'hero-silver'
  | 'hero-yellow'
  | 'hero-rose'
  | 'styled'
  | 'lifestyle'
  | 'macro';

export interface ImageSlot {
  id: number | string;
  slotKey: SlotKey;
  slotGroup: 'hero-variants' | 'catalog';
  title: string;
  category: string;
  description: string;
  status: SlotStatus;
  rawGeneratedUrl?: string;
  optimizedUrl?: string;
  blob?: Blob;
  fileSizeBytes?: number;
  width?: number;
  height?: number;
  error?: string;
  selected: boolean;
  prompt: string;
  retryCount?: number;
  callouts?: MacroCallouts;
  verification?: AccuracyVerification;
  zipSuffix: string;         // e.g. "-1-silver.webp", "-2.webp"
  isHeroVariant?: boolean;
  variantMetal?: OriginalMetal;
}

export type LifestyleGender = 'Female' | 'Male';

export type MetalType =
  | '18K Yellow Gold'
  | '18K White Gold'
  | '18K Rose Gold'
  | '925 Sterling Silver'
  | 'Platinum';

export type StoneType =
  | 'Natural Diamond'
  | 'Lab Grown Diamond'
  | 'Moissanite'
  | 'Precious Gemstone'
  | 'None (Plain Metal)';

export interface RawImageItem {
  dataUrl: string;
  mimeType: string;
  name: string;
  size: number;
  width?: number;
  height?: number;
  isRawDng?: boolean;
  cameraModel?: string;
}

export interface ProductInput {
  rawImage: RawImageItem | null;       // Primary reference image
  additionalImages: RawImageItem[];    // Up to 2 additional angle photos (total 3)
  sku: string;
  productType: ProductType;
  metal: MetalType;
  stoneType: StoneType;
  lifestyleGender: LifestyleGender;
  extraNotes: string;
  stylePreset: StylePreset;
  macroCallouts: MacroCallouts;

  // New Accuracy & Hero Variant Controls
  originalMetal: OriginalMetal;
  heroMethod: HeroMethod;
  variantToggles: VariantToggles;
  strictMode: boolean;
  productFacts: string;                // Vision AI structured facts (editable by user)
  isAnalyzingFacts?: boolean;
}

export interface AppSettings {
  apiKey: string;
  model: string;
  qualityMode: QualityMode;
  stylePreset: StylePreset;
  demoMode: boolean;
  exportSize: ExportSize;
  exportQuality: number;
  strictMode: boolean;
}

export interface HistoryItemSlot {
  id: number | string;
  title: string;
  optimizedUrl: string;
  fileSizeBytes: number;
}

export interface SessionHistoryItem {
  id: string;
  timestamp: number;
  sku: string;
  sanitizedSku: string;
  productType: ProductType;
  thumbnailUrl: string;
  slots: HistoryItemSlot[];
  totalSizeBytes: number;
  exportSize: ExportSize;
}
