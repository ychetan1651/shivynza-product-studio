import { LifestyleGender, MacroCallouts, ProductInput, ProductType, StylePreset, SlotKey, ImageSlot, OriginalMetal } from '../types';

/**
 * Sanitizes the product name / SKU:
 * Lowercase, replace spaces with hyphens, remove special characters.
 * E.g. "Diamond Halo Ring - R101" -> "diamond-halo-ring-r101"
 */
export function sanitizeSku(sku: string): string {
  if (!sku) return 'product';
  return sku
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'product';
}

export const SHARED_PROMPT_RULES = 
  "Keep the jewelry exactly the same as the reference image — identical design, shape, stone cut, stone count, prong/setting details, metal color, proportions and engraving. Do not redesign, add, remove or alter any element. Remove dust, scratches, fingerprints, glare and the original background. Photorealistic, true-to-life metal and diamond sparkle, sharp focus, high-end jewelry catalog photography. No text, no logos, no watermarks, no extra jewelry.";

export function getLifestyleAnatomy(type: ProductType, gender: LifestyleGender = 'Female'): string {
  if (gender === 'Male') {
    switch (type) {
      case 'Ring':
        return "the product worn on a natural, masculine male hand (correct anatomy, five fingers, natural skin texture, well-groomed, clean masculine aesthetic), soft blurred neutral background, shallow depth of field.";
      case 'Pendant':
      case 'Chain':
        return "the product worn cleanly on a natural, masculine male neck and collar area (natural skin tone, modern masculine styling), soft blurred neutral background, shallow depth of field.";
      case 'Earrings':
        return "the product worn stylishly on a natural, masculine male ear (clean natural earlobe, modern masculine grooming), soft blurred neutral background, shallow depth of field.";
      case 'Bracelet':
        return "the product worn naturally on a masculine male wrist (natural skin tone, masculine wrist posture, clean luxury styling), soft blurred neutral background, shallow depth of field.";
      case 'Other':
      default:
        return "the product displayed in a modern luxury editorial lifestyle setting with natural male presence, soft blurred neutral background, shallow depth of field.";
    }
  }

  // Default Female
  switch (type) {
    case 'Ring':
      return "the product worn on a natural, elegant female hand (correct anatomy, five fingers, natural skin, neutral manicure), soft blurred neutral background, shallow depth of field.";
    case 'Pendant':
    case 'Chain':
      return "the product worn gracefully on a natural, elegant female neck and décolletage (natural skin tone, subtle collarbone line), soft blurred neutral background, shallow depth of field.";
    case 'Earrings':
      return "the product worn delicately on a natural, elegant female ear (natural earlobe, soft hair tucked behind ear, gentle skin texture), soft blurred neutral background, shallow depth of field.";
    case 'Bracelet':
      return "the product worn gracefully on a natural, elegant female wrist (natural skin tone, relaxed hand posture), soft blurred neutral background, shallow depth of field.";
    case 'Other':
    default:
      return "the product displayed in an authentic luxury editorial lifestyle setting with human presence, soft blurred neutral background, shallow depth of field.";
  }
}

export function getStylePresetDescription(preset: StylePreset): string {
  switch (preset) {
    case 'White':
      return "pure white / very light seamless studio cyclorama background with soft balanced light.";
    case 'Cream':
      return "warm cream/ivory textured surface (soft fabric or matte honed limestone) with soft diffused natural light.";
    case 'Blush':
      return "muted warm rose quartz and brushed travertine stone surface with soft ambient illumination.";
    case 'Dark Green':
      return "deep Shivynza emerald green velvet and dark honed charcoal stone surface with dramatic contrast rim lighting.";
    default:
      return "neutral high-end studio background.";
  }
}

export interface SlotConfig {
  id: number | string;
  slotKey: SlotKey;
  slotGroup: 'hero-variants' | 'catalog';
  title: string;
  category: string;
  description: string;
  zipSuffix: string;
  isHeroVariant?: boolean;
  variantMetal?: OriginalMetal;
}

export const ALL_SLOT_CONFIGS: SlotConfig[] = [
  {
    id: 'hero-silver',
    slotKey: 'hero-silver',
    slotGroup: 'hero-variants',
    title: 'Hero Silver / White Gold',
    category: 'Hero Variant · White Gold / Silver',
    description: 'Front-facing hero angle in 18K White Gold / 925 Silver on pure white background.',
    zipSuffix: '-1-silver.webp',
    isHeroVariant: true,
    variantMetal: 'Silver/White Gold',
  },
  {
    id: 'hero-yellow',
    slotKey: 'hero-yellow',
    slotGroup: 'hero-variants',
    title: 'Hero 18K Yellow Gold',
    category: 'Hero Variant · 18K Yellow Gold',
    description: 'Front-facing hero angle in rich 18K Yellow Gold on pure white background.',
    zipSuffix: '-1-yellow-gold.webp',
    isHeroVariant: true,
    variantMetal: 'Yellow Gold',
  },
  {
    id: 'hero-rose',
    slotKey: 'hero-rose',
    slotGroup: 'hero-variants',
    title: 'Hero 18K Rose Gold',
    category: 'Hero Variant · 18K Rose Gold',
    description: 'Front-facing hero angle in warm 18K Rose Gold on pure white background.',
    zipSuffix: '-1-rose-gold.webp',
    isHeroVariant: true,
    variantMetal: 'Rose Gold',
  },
  {
    id: 'styled',
    slotKey: 'styled',
    slotGroup: 'catalog',
    title: 'Image 2 · Luxury Styled',
    category: 'Editorial Surface',
    description: 'Artfully composed on textured marble/fabric with gentle diffused window light.',
    zipSuffix: '-2.webp',
  },
  {
    id: 'lifestyle',
    slotKey: 'lifestyle',
    slotGroup: 'catalog',
    title: 'Image 3 · On-Body Lifestyle',
    category: 'Human Context',
    description: 'Worn on anatomy with natural skin texture, authentic scale, and gentle bokeh.',
    zipSuffix: '-3.webp',
  },
  {
    id: 'macro',
    slotKey: 'macro',
    slotGroup: 'catalog',
    title: 'Image 4 · Extreme Macro Detail',
    category: 'Craftsmanship 4K',
    description: 'Extreme close-up revealing stone cut, prongs, and metal luster with diamond fire sparkle.',
    zipSuffix: '-4.webp',
  },
];

export function getSlotMetadata(slotKey: SlotKey, input: ProductInput): SlotConfig {
  const found = ALL_SLOT_CONFIGS.find((s) => s.slotKey === slotKey);
  if (!found) return ALL_SLOT_CONFIGS[0];

  if (slotKey === 'styled') {
    return {
      ...found,
      category: `Editorial · ${input.stylePreset} Surface`,
      description: `Artfully composed on ${input.stylePreset.toLowerCase()} surface with gentle diffused light.`,
    };
  }
  if (slotKey === 'lifestyle') {
    return {
      ...found,
      category: `Lifestyle · ${input.lifestyleGender} Model`,
      description: `Worn on natural ${input.lifestyleGender.toLowerCase()} anatomy with realistic skin texture.`,
    };
  }
  if (slotKey === 'macro') {
    return {
      ...found,
      category: `Macro 4K · ${input.metal}`,
      description: `Extreme 4K close-up highlighting ${input.metal} finish, prong setting, and ${input.stoneType} fire.`,
    };
  }
  return found;
}

/**
 * Builds the compositional prompt for each slot
 */
export function buildSlotPrompt(slotKey: SlotKey, input: ProductInput): string {
  const parts: string[] = [SHARED_PROMPT_RULES];

  if (input.rawImage?.isRawDng) {
    parts.push(
      "Reference image was captured in camera RAW (.DNG). Preserve true optical white balance, realistic metal specular sheen, and authentic diamond refractive fire without over-saturation."
    );
  }

  const notesInfo = input.extraNotes.trim()
    ? `Art direction & styling notes: ${input.extraNotes.trim()}.`
    : '';

  switch (slotKey) {
    case 'hero-silver':
      parts.push(
        `Hero packshot: ${input.productType} in 18K White Gold / 925 Silver centered on a pure white / very light seamless background, front-facing hero angle, soft natural contact shadow, clean and shadow-balanced.`
      );
      break;

    case 'hero-yellow':
      parts.push(
        `Hero packshot: ${input.productType} in 18K Yellow Gold centered on a pure white / very light seamless background, front-facing hero angle, soft natural contact shadow, clean and shadow-balanced.`
      );
      break;

    case 'hero-rose':
      parts.push(
        `Hero packshot: ${input.productType} in 18K Rose Gold centered on a pure white / very light seamless background, front-facing hero angle, soft natural contact shadow, clean and shadow-balanced.`
      );
      break;

    case 'styled':
      parts.push(
        `Luxury styled: ${input.productType} on a ${getStylePresetDescription(input.stylePreset)}, soft diffused window light, gentle reflection, premium and elegant mood.`
      );
      if (notesInfo) parts.push(notesInfo);
      break;

    case 'lifestyle':
      parts.push(
        `Lifestyle shot: ${getLifestyleAnatomy(input.productType, input.lifestyleGender)} Gender styling: ${input.lifestyleGender}. Authentic human anatomy, true anatomical scale.`
      );
      if (notesInfo) parts.push(notesInfo);
      break;

    case 'macro':
      const rawNotes = input.extraNotes.trim();
      const refKeywords = rawNotes ? `Craftsmanship reference details: ${rawNotes}.` : '';

      parts.push(
        `Macro detail: extreme 4K macro catalog close-up emphasizing the ${input.metal} mirror polish and metallurgical finish, prong claw setting craftsmanship, and ${input.stoneType} cut, table facet brilliance, scintillation, refractive dispersion fire, and micro-luster reflections. Product category: luxury fine jewelry ${input.productType}. ${refKeywords} Shot with high-end 100mm macro lens at f/5.6 with razor-sharp focal plane on primary gemstones and prongs, beautiful subtle bokeh falloff, dramatic soft directional studio lighting on dark deep-green or charcoal backdrop for maximum contrast.`
      );
      break;
  }

  return parts.join(' ');
}

/**
 * Intelligent default callouts for Image 4 (Macro Details & Craftsmanship)
 * Derived automatically from user-selected stone category, metal, and extra notes.
 */
export function getDefaultMacroCallouts(input?: Partial<ProductInput>): MacroCallouts {
  // Top-Left: Diamond & Gemstone
  let stone = 'Natural / Lab Grown\nDiamond';
  if (input?.stoneType === 'None (Plain Metal)') {
    stone = 'High Mirror\nPolish';
  } else if (input?.stoneType === 'Natural Diamond') {
    stone = 'Natural Diamond\nPrecision Cut';
  } else if (input?.stoneType === 'Lab Grown Diamond') {
    stone = 'Natural / Lab Grown\nDiamond';
  } else if (input?.stoneType === 'Moissanite') {
    stone = 'Fire Moissanite\nBrilliance';
  } else if (input?.stoneType === 'Precious Gemstone') {
    stone = 'Precious Gemstone\nAccents';
  }

  // Top-Right: Precious Metal
  let metal = '18K White Gold /\n925 Silver';
  if (input?.metal === '18K White Gold') {
    metal = '18K White Gold /\n925 Silver';
  } else if (input?.metal === '18K Yellow Gold') {
    metal = '18K Yellow Gold /\nMirror Polish';
  } else if (input?.metal === '18K Rose Gold') {
    metal = '18K Rose Gold /\nWarm Luster';
  } else if (input?.metal === '925 Sterling Silver') {
    metal = '18K White Gold /\n925 Silver';
  } else if (input?.metal === 'Platinum') {
    metal = 'Platinum Pt950 /\nMirror Finish';
  } else if (input?.metal) {
    metal = `${input.metal}\nFine Hallmark`;
  }

  // Bottom-Right: Craftsmanship / Finish (intelligent keyword detector from extra notes)
  let finish = 'Handcrafted\nFinish';
  if (input?.extraNotes && input.extraNotes.trim().length > 0) {
    const raw = input.extraNotes.toLowerCase();
    if (raw.includes('pavé') || raw.includes('pave')) {
      finish = 'Micro-Pavé Setting\nHandcrafted';
    } else if (raw.includes('milgrain')) {
      finish = 'Vintage Milgrain\nHandcrafted';
    } else if (raw.includes('solitaire')) {
      finish = 'Solitaire Mount\nHandcrafted';
    } else if (raw.includes('claw') || raw.includes('prong')) {
      finish = 'Precision Claw\nHandcrafted';
    } else if (raw.includes('bezel')) {
      finish = 'Bezel Setting\nHandcrafted';
    } else if (raw.includes('channel')) {
      finish = 'Channel Setting\nHandcrafted';
    } else if (raw.includes('halo')) {
      finish = 'Diamond Halo\nHandcrafted';
    } else {
      const candidate = input.extraNotes.split(/[,.;]/)[0].trim();
      if (candidate.length > 2 && candidate.length <= 26) {
        finish = candidate.includes(' ') && !candidate.includes('\n')
          ? candidate.replace(' ', '\n')
          : candidate;
      }
    }
  }

  return {
    enabled: true,
    autoSync: true,
    topLeft: stone,
    topRight: metal,
    bottomLeft: 'Hallmarked\nJewellery',
    bottomRight: finish,
  };
}
