import { LifestyleGender, MetalType, ProductType, StoneType, StylePreset } from '../types';

export interface SampleProduct {
  id: string;
  name: string;
  sku: string;
  productType: ProductType;
  metal: MetalType;
  stoneType: StoneType;
  lifestyleGender: LifestyleGender;
  extraNotes: string;
  stylePreset: StylePreset;
  dataUrl: string;
  filename: string;
  isRawDng?: boolean;
  cameraModel?: string;
}

// Crisp vector SVG jewelry renders encoded as base64 data URLs
function createRingSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
    <defs>
      <radialGradient id="ringBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="70%" stop-color="#F7F5F0"/>
        <stop offset="100%" stop-color="#ECE7DE"/>
      </radialGradient>
      <linearGradient id="goldBand" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FBF2DE"/>
        <stop offset="25%" stop-color="#EAC98E"/>
        <stop offset="50%" stop-color="#B88A44"/>
        <stop offset="75%" stop-color="#F3E1B8"/>
        <stop offset="100%" stop-color="#8F6222"/>
      </linearGradient>
      <linearGradient id="whiteGoldShine" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="30%" stop-color="#E2E8F0"/>
        <stop offset="70%" stop-color="#CBD5E1"/>
        <stop offset="100%" stop-color="#94A3B8"/>
      </linearGradient>
      <radialGradient id="diamondBrilliance" cx="45%" cy="40%" r="55%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="35%" stop-color="#F0F9FF"/>
        <stop offset="65%" stop-color="#BAE6FD"/>
        <stop offset="85%" stop-color="#7DD3FC"/>
        <stop offset="100%" stop-color="#38BDF8"/>
      </radialGradient>
      <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      <filter id="contactShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="14"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.1   0 0 0 0 0.1   0 0 0 0 0.1  0 0 0 0.35 0"/>
        <feOffset dx="0" dy="24"/>
        <feBlend in="SourceGraphic" mode="normal"/>
      </filter>
    </defs>

    <rect width="1000" height="1000" fill="url(#ringBg)"/>

    <!-- Contact shadow beneath ring -->
    <ellipse cx="500" cy="740" rx="220" ry="28" fill="#1E293B" opacity="0.18" filter="url(#softGlow)"/>
    <ellipse cx="500" cy="735" rx="140" ry="14" fill="#0F172A" opacity="0.3" filter="url(#softGlow)"/>

    <!-- Ring Group -->
    <g filter="url(#contactShadow)">
      <!-- Main Ring Shank -->
      <ellipse cx="500" cy="560" rx="180" ry="165" fill="none" stroke="url(#goldBand)" stroke-width="48" stroke-linecap="round"/>
      <!-- Inner Ring Shank Depth -->
      <ellipse cx="500" cy="565" rx="156" ry="142" fill="none" stroke="#784E17" stroke-width="6" opacity="0.7"/>
      <!-- Ring Band Specular Highlights -->
      <ellipse cx="500" cy="560" rx="178" ry="163" fill="none" stroke="#FFF7ED" stroke-width="4" stroke-dasharray="80 120 40 260" opacity="0.9"/>

      <!-- Pavé Micro Diamonds on Shoulders -->
      <g fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.5">
        <circle cx="370" cy="460" r="7"/>
        <circle cx="390" cy="435" r="7.5"/>
        <circle cx="415" cy="415" r="8"/>
        <circle cx="442" cy="400" r="8.5"/>
        
        <circle cx="630" cy="460" r="7"/>
        <circle cx="610" cy="435" r="7.5"/>
        <circle cx="585" cy="415" r="8"/>
        <circle cx="558" cy="400" r="8.5"/>
      </g>

      <!-- Center Setting Basket & Prongs -->
      <g stroke="url(#whiteGoldShine)" stroke-width="7" fill="none">
        <path d="M 450 370 Q 460 310 472 260"/>
        <path d="M 550 370 Q 540 310 528 260"/>
        <path d="M 480 380 Q 490 320 495 255"/>
        <path d="M 520 380 Q 510 320 505 255"/>
      </g>

      <!-- Center Brilliant Cut Diamond -->
      <!-- Pavilion & Table Facets -->
      <g filter="url(#softGlow)">
        <!-- Table octagonal face -->
        <polygon points="500,240 545,255 565,295 545,335 500,350 455,335 435,295 455,255" fill="url(#diamondBrilliance)" stroke="#CBD5E1" stroke-width="3"/>
        
        <!-- Internal Facet Star Lines -->
        <line x1="500" y1="240" x2="500" y2="350" stroke="#FFFFFF" stroke-width="2.5" opacity="0.85"/>
        <line x1="435" y1="295" x2="565" y2="295" stroke="#FFFFFF" stroke-width="2.5" opacity="0.85"/>
        <line x1="455" y1="255" x2="545" y2="335" stroke="#BAE6FD" stroke-width="2"/>
        <line x1="455" y1="335" x2="545" y2="255" stroke="#BAE6FD" stroke-width="2"/>

        <!-- Central Table -->
        <polygon points="500,265 528,276 538,295 528,314 500,325 472,314 462,295 472,276" fill="#FFFFFF" fill-opacity="0.9" stroke="#93C5FD" stroke-width="1.5"/>

        <!-- Intense Prismatic Diamond Flares -->
        <polygon points="500,230 504,245 518,245 506,254 511,268 500,259 489,268 494,254 482,245 496,245" fill="#FFFFFF" opacity="0.95"/>
        <polygon points="460,285 463,293 472,293 465,299 468,307 460,302 452,307 455,299 448,293 457,293" fill="#E0F2FE" opacity="0.9"/>
      </g>

      <!-- 4 Golden Prongs Securing Diamond -->
      <g fill="url(#goldBand)" stroke="#784E17" stroke-width="2">
        <circle cx="452" cy="256" r="8"/>
        <circle cx="548" cy="256" r="8"/>
        <circle cx="548" cy="336" r="8"/>
        <circle cx="452" cy="336" r="8"/>
      </g>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createPendantSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
    <defs>
      <radialGradient id="pendantBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="70%" stop-color="#FBF9F5"/>
        <stop offset="100%" stop-color="#EAE5DC"/>
      </radialGradient>
      <linearGradient id="whiteGoldChain" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F1F5F9"/>
        <stop offset="50%" stop-color="#94A3B8"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
      <radialGradient id="sapphireDepth" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#38BDF8"/>
        <stop offset="25%" stop-color="#1D4ED8"/>
        <stop offset="60%" stop-color="#0F172A"/>
        <stop offset="100%" stop-color="#020617"/>
      </radialGradient>
    </defs>
    <rect width="1000" height="1000" fill="url(#pendantBg)"/>
    
    <!-- Chain loops -->
    <path d="M 280 120 C 340 320, 470 420, 500 450" fill="none" stroke="url(#whiteGoldChain)" stroke-width="6" stroke-dasharray="10 6"/>
    <path d="M 720 120 C 660 320, 530 420, 500 450" fill="none" stroke="url(#whiteGoldChain)" stroke-width="6" stroke-dasharray="10 6"/>
    
    <!-- Bail -->
    <ellipse cx="500" cy="450" rx="16" ry="32" fill="#E2E8F0" stroke="#64748B" stroke-width="3"/>
    
    <!-- Shadow -->
    <ellipse cx="500" cy="740" rx="160" ry="24" fill="#0F172A" opacity="0.2"/>

    <!-- Halo of Round Cut Diamonds -->
    <ellipse cx="500" cy="580" rx="135" ry="160" fill="#E2E8F0" stroke="#94A3B8" stroke-width="4"/>
    <g fill="#FFFFFF" stroke="#64748B" stroke-width="2">
      <circle cx="500" cy="415" r="14"/>
      <circle cx="545" cy="430" r="14"/>
      <circle cx="585" cy="470" r="14"/>
      <circle cx="610" cy="525" r="14"/>
      <circle cx="615" cy="585" r="14"/>
      <circle cx="600" cy="645" r="14"/>
      <circle cx="565" cy="695" r="14"/>
      <circle cx="500" cy="735" r="14"/>
      <circle cx="435" cy="695" r="14"/>
      <circle cx="400" cy="645" r="14"/>
      <circle cx="385" cy="585" r="14"/>
      <circle cx="390" cy="525" r="14"/>
      <circle cx="415" cy="470" r="14"/>
      <circle cx="455" cy="430" r="14"/>
    </g>

    <!-- Center Oval Royal Ceylon Sapphire -->
    <ellipse cx="500" cy="580" rx="95" ry="120" fill="url(#sapphireDepth)" stroke="#60A5FA" stroke-width="3"/>
    
    <!-- Facet reflections inside Sapphire -->
    <polygon points="500,480 540,510 560,580 540,650 500,680 460,650 440,580 460,510" fill="none" stroke="#60A5FA" stroke-width="2" opacity="0.75"/>
    <polygon points="500,515 525,535 538,580 525,625 500,645 475,625 462,580 475,535" fill="none" stroke="#93C5FD" stroke-width="2" opacity="0.9"/>
    
    <!-- Light reflections -->
    <ellipse cx="475" cy="530" rx="30" ry="15" fill="#FFFFFF" opacity="0.4" transform="rotate(-30 475 530)"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createEarringsSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
    <defs>
      <radialGradient id="earringBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="75%" stop-color="#F5F3EC"/>
        <stop offset="100%" stop-color="#E5E0D5"/>
      </radialGradient>
      <linearGradient id="yellowGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDF4DC"/>
        <stop offset="35%" stop-color="#E8BE6E"/>
        <stop offset="70%" stop-color="#B28236"/>
        <stop offset="100%" stop-color="#764F13"/>
      </linearGradient>
      <radialGradient id="emeraldDepth" cx="45%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#34D399"/>
        <stop offset="30%" stop-color="#059669"/>
        <stop offset="70%" stop-color="#064E3B"/>
        <stop offset="100%" stop-color="#022C22"/>
      </radialGradient>
    </defs>
    <rect width="1000" height="1000" fill="url(#earringBg)"/>

    <!-- Left Earring Shadow -->
    <ellipse cx="380" cy="740" rx="90" ry="18" fill="#0F172A" opacity="0.18"/>
    <!-- Right Earring Shadow -->
    <ellipse cx="620" cy="740" rx="90" ry="18" fill="#0F172A" opacity="0.18"/>

    <!-- Left Earring -->
    <g transform="translate(380, 480)">
      <!-- French Wire / Hook -->
      <path d="M 0,-240 C -30,-240 -60,-190 -50,-130 C -45,-80 -10,-40 0,0" fill="none" stroke="url(#yellowGold)" stroke-width="8" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="16" fill="url(#yellowGold)"/>
      <circle cx="0" cy="0" r="9" fill="#FFFFFF"/>

      <!-- Art Deco Drop Setting -->
      <polygon points="-65,50 65,50 50,220 -50,220" fill="url(#yellowGold)" stroke="#764F13" stroke-width="4"/>
      <!-- Colombian Emerald Cut Stone -->
      <polygon points="-52,65 52,65 40,205 -40,205" fill="url(#emeraldDepth)" stroke="#6EE7B7" stroke-width="2"/>
      <!-- Inner step facets -->
      <polygon points="-36,80 36,80 28,190 -28,190" fill="none" stroke="#A7F3D0" stroke-width="1.5"/>
      <polygon points="-20,95 20,95 15,175 -15,175" fill="#34D399" fill-opacity="0.3" stroke="#D1FAE5" stroke-width="1.5"/>
    </g>

    <!-- Right Earring -->
    <g transform="translate(620, 480)">
      <!-- French Wire / Hook -->
      <path d="M 0,-240 C 30,-240 60,-190 50,-130 C 45,-80 10,-40 0,0" fill="none" stroke="url(#yellowGold)" stroke-width="8" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="16" fill="url(#yellowGold)"/>
      <circle cx="0" cy="0" r="9" fill="#FFFFFF"/>

      <!-- Art Deco Drop Setting -->
      <polygon points="-65,50 65,50 50,220 -50,220" fill="url(#yellowGold)" stroke="#764F13" stroke-width="4"/>
      <!-- Colombian Emerald Cut Stone -->
      <polygon points="-52,65 52,65 40,205 -40,205" fill="url(#emeraldDepth)" stroke="#6EE7B7" stroke-width="2"/>
      <!-- Inner step facets -->
      <polygon points="-36,80 36,80 28,190 -28,190" fill="none" stroke="#A7F3D0" stroke-width="1.5"/>
      <polygon points="-20,95 20,95 15,175 -15,175" fill="#34D399" fill-opacity="0.3" stroke="#D1FAE5" stroke-width="1.5"/>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: 'sample-ring-1',
    name: 'Aethel Solitaire Halo Ring',
    sku: 'halo-solitaire-r101',
    productType: 'Ring',
    metal: '18K Yellow Gold',
    stoneType: 'Lab Grown Diamond',
    lifestyleGender: 'Female',
    extraNotes: 'Pavé shoulder setting, round brilliant cut with crisp facet reflections, high brilliance',
    stylePreset: 'Cream',
    dataUrl: createRingSvg(),
    filename: 'shivynza-raw-solitaire-ring.svg',
  },
  {
    id: 'sample-pendant-2',
    name: 'Ceylon Royal Sapphire Halo Pendant',
    sku: 'royal-sapphire-p204',
    productType: 'Pendant',
    metal: '18K White Gold',
    stoneType: 'Natural Diamond',
    lifestyleGender: 'Female',
    extraNotes: '4.0ct unheated oval blue sapphire haloed by 14 brilliant diamonds, delicate cable chain',
    stylePreset: 'White',
    dataUrl: createPendantSvg(),
    filename: 'shivynza-raw-sapphire-pendant.svg',
  },
  {
    id: 'sample-earrings-3',
    name: 'Verdant Art Deco Emerald Drops',
    sku: 'deco-emerald-e302',
    productType: 'Earrings',
    metal: '18K Yellow Gold',
    stoneType: 'Precious Gemstone',
    lifestyleGender: 'Female',
    extraNotes: 'Colombian emerald-cut stones with step facets and velvety deep green glow, french wire hooks',
    stylePreset: 'Dark Green',
    dataUrl: createEarringsSvg(),
    filename: 'shivynza-raw-emerald-earrings.svg',
  },
  {
    id: 'sample-dng-ring',
    name: 'Leica DNG Raw Solitaire Diamond',
    sku: 'leica-solitaire-dng101',
    productType: 'Ring',
    metal: '18K White Gold',
    stoneType: 'Moissanite',
    lifestyleGender: 'Male',
    extraNotes: 'Shot in Leica M11 DNG Camera Raw, uncompressed 14-bit dynamic range, modern signet-style halo',
    stylePreset: 'Cream',
    dataUrl: createRingSvg(),
    filename: 'SHIVYNZA_RAW_0842.DNG',
    isRawDng: true,
    cameraModel: 'Leica M11 DNG Raw (60MP)',
  },
];
