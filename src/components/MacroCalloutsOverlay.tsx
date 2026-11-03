import React from 'react';
import { MacroCallouts } from '../types';

interface MacroCalloutsOverlayProps {
  callouts: MacroCallouts;
  className?: string;
}

export const MacroCalloutsOverlay: React.FC<MacroCalloutsOverlayProps> = ({
  callouts,
  className = '',
}) => {
  if (!callouts || !callouts.enabled) return null;

  const splitLines = (text: string) => {
    if (!text) return [];
    return text.split('\n');
  };

  const topLeftLines = splitLines(callouts.topLeft);
  const topRightLines = splitLines(callouts.topRight);
  const bottomLeftLines = splitLines(callouts.bottomLeft);
  const bottomRightLines = splitLines(callouts.bottomRight);

  return (
    <div className={`absolute inset-0 pointer-events-none select-none z-10 ${className}`}>
      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="calloutTextGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.85" />
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#000000" floodOpacity="0.6" />
          </filter>
          <filter id="calloutLineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* 1. Top Left: Diamond & Stone Callout */}
        <g filter="url(#calloutLineGlow)">
          {/* Pointer line */}
          <line
            x1="260"
            y1="235"
            x2="390"
            y2="490"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Anchor Dot */}
          <circle cx="390" cy="490" r="4.5" fill="#FFFFFF" />
        </g>
        <g filter="url(#calloutTextGlow)">
          <text
            x="250"
            y={topLeftLines.length > 1 ? 175 : 190}
            fontFamily="'Playfair Display', 'Cormorant Garamond', Georgia, serif"
            fontSize="32"
            fontWeight="500"
            fill="#FFFFFF"
            textAnchor="middle"
            letterSpacing="0.5"
          >
            {topLeftLines.map((line, idx) => (
              <tspan key={idx} x="250" dy={idx === 0 ? 0 : 36}>
                {line}
              </tspan>
            ))}
          </text>
        </g>

        {/* 2. Top Right: Metal & Purity Callout */}
        <g filter="url(#calloutLineGlow)">
          {/* Pointer line */}
          <line
            x1="765"
            y1="235"
            x2="630"
            y2="360"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Anchor Dot */}
          <circle cx="630" cy="360" r="4.5" fill="#FFFFFF" />
        </g>
        <g filter="url(#calloutTextGlow)">
          <text
            x="775"
            y={topRightLines.length > 1 ? 175 : 190}
            fontFamily="'Playfair Display', 'Cormorant Garamond', Georgia, serif"
            fontSize="32"
            fontWeight="500"
            fill="#FFFFFF"
            textAnchor="middle"
            letterSpacing="0.5"
          >
            {topRightLines.map((line, idx) => (
              <tspan key={idx} x="775" dy={idx === 0 ? 0 : 36}>
                {line}
              </tspan>
            ))}
          </text>
        </g>

        {/* 3. Bottom Left: Hallmark Certification Callout */}
        <g filter="url(#calloutLineGlow)">
          {/* Pointer line */}
          <line
            x1="250"
            y1="765"
            x2="390"
            y2="625"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Anchor Dot */}
          <circle cx="390" cy="625" r="4.5" fill="#FFFFFF" />
        </g>
        <g filter="url(#calloutTextGlow)">
          <text
            x="230"
            y={bottomLeftLines.length > 1 ? 805 : 820}
            fontFamily="'Playfair Display', 'Cormorant Garamond', Georgia, serif"
            fontSize="32"
            fontWeight="500"
            fill="#FFFFFF"
            textAnchor="middle"
            letterSpacing="0.5"
          >
            {bottomLeftLines.map((line, idx) => (
              <tspan key={idx} x="230" dy={idx === 0 ? 0 : 36}>
                {line}
              </tspan>
            ))}
          </text>
        </g>

        {/* 4. Bottom Right: Handcrafted Finish Callout */}
        <g filter="url(#calloutLineGlow)">
          {/* Pointer line */}
          <line
            x1="755"
            y1="765"
            x2="620"
            y2="625"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Anchor Dot */}
          <circle cx="620" cy="625" r="4.5" fill="#FFFFFF" />
        </g>
        <g filter="url(#calloutTextGlow)">
          <text
            x="770"
            y={bottomRightLines.length > 1 ? 805 : 820}
            fontFamily="'Playfair Display', 'Cormorant Garamond', Georgia, serif"
            fontSize="32"
            fontWeight="500"
            fill="#FFFFFF"
            textAnchor="middle"
            letterSpacing="0.5"
          >
            {bottomRightLines.map((line, idx) => (
              <tspan key={idx} x="770" dy={idx === 0 ? 0 : 36}>
                {line}
              </tspan>
            ))}
          </text>
        </g>
      </svg>
    </div>
  );
};
