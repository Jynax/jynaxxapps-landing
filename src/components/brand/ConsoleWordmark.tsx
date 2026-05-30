/**
 * ConsoleWordmark.tsx — Console-tinted Jynaxx wordmark for the jynaxxapps.com
 * Console direction.
 *
 * Ported from /brand/round-7-wordmark.jsx (the single source of truth).
 * The wordmark glyph is LOCKED round 6 — DO NOT re-design it. Adjust only
 * `size` and `color`. Accent + echo are pinned to the Console mode pair
 * (front: signal cyan #6CE0D4, echo: amber #E8C56B).
 *
 * Mirrors Wordmark.tsx (Tech) and ArcadeWordmark.tsx — only colour constants differ.
 * Console is calm / instrument-grade: glow defaults to false.
 *
 * Usage:
 *   <JynaxxAppsLockup size={isDesktop ? 64 : 36} glow />   // hero
 *   <JynaxxWordmark size={18} glow={false} />               // footer
 *   <StackedMonogram size={56} />                           // favicon / corner
 */

import React from 'react';

// Console mode accents — signal cyan front, amber echo.
const CON_INK    = '#E8F0F5';
const CON_ACCENT = '#6CE0D4'; // signal cyan (front X)
const CON_ECHO   = '#E8C56B'; // amber       (echo X)

const GEIST = 'Geist, system-ui, sans-serif';
const MONO  = '"JetBrains Mono", ui-monospace, monospace';

// Console glow — cyan-dominant, subdued (instrument-grade).
const GLOW = '0 0 14px rgba(108,224,212,0.40), 0 0 22px rgba(108,224,212,0.20)';

const DIVIDER_OPACITY  = 0.34;
const SUBLABEL_OPACITY = 0.92;

// ---------- The xx glyph (echo + flourish) -----------------------------

interface EchoFlourishXXProps {
  height: number;
  accent?: string;
  echo?: string;
  extLen?: number;
  dx?: number;
  echoOpacity?: number;
  strokeRatio?: number;
  style?: React.CSSProperties;
}

export function EchoFlourishXX({
  height,
  accent = CON_ACCENT,
  echo = CON_ECHO,
  extLen = 0.5,
  dx = 0.55,
  echoOpacity = 0.30,
  strokeRatio = 0.16,
  style,
}: EchoFlourishXXProps) {
  const xW = height * 0.85;
  const sw = height * strokeRatio;
  const h = height;
  const echoOffset = xW * dx;

  const x1s = sw / 2;
  const y1s = sw / 2;
  const x2e = xW - sw / 2;
  const y2e = h - sw / 2;
  const dxDir = x2e - x1s;
  const dyDir = y2e - y1s;
  const tipX = x2e + dxDir * extLen;
  const tipY = y2e + dyDir * extLen;

  const totalW = Math.max(echoOffset + xW, tipX + sw / 2);
  const totalH = Math.max(h, tipY + sw / 2);

  return (
    <svg
      width={totalW}
      height={totalH}
      viewBox={`0 0 ${totalW} ${totalH}`}
      style={{ overflow: 'visible', display: 'inline-block', verticalAlign: 'baseline', ...style }}
    >
      {/* Echo X — faded, offset right. strokeLinecap="square" is REQUIRED. */}
      <g style={{ opacity: echoOpacity }}>
        <line x1={echoOffset + sw / 2}      y1={sw / 2}     x2={echoOffset + xW - sw / 2} y2={h - sw / 2}
              stroke={echo} strokeWidth={sw} strokeLinecap="square" />
        <line x1={echoOffset + xW - sw / 2} y1={sw / 2}     x2={echoOffset + sw / 2}      y2={h - sw / 2}
              stroke={echo} strokeWidth={sw} strokeLinecap="square" />
      </g>
      {/* Front X — / stroke normal */}
      <line x1={xW - sw / 2} y1={sw / 2} x2={sw / 2} y2={h - sw / 2}
            stroke={accent} strokeWidth={sw} strokeLinecap="square" />
      {/* Front X — \ stroke extended past the bottom-right corner (the flourish) */}
      <line x1={x1s} y1={y1s} x2={tipX} y2={tipY}
            stroke={accent} strokeWidth={sw} strokeLinecap="square" />
    </svg>
  );
}

// ---------- Full wordmark: "jyna" + xx glyph ---------------------------

interface JynaxxWordmarkProps {
  size?: number;
  color?: string;
  accent?: string;
  echo?: string;
  echoOpacity?: number;
  glow?: boolean;
}

export function JynaxxWordmark({
  size = 26,
  color = CON_INK,
  accent = CON_ACCENT,
  echo = CON_ECHO,
  echoOpacity = 0.30,
  glow = false,
}: JynaxxWordmarkProps) {
  const xxH = size * 0.88;
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'flex-end',
      gap: size * 0.04,
      lineHeight: 0.85,
      verticalAlign: 'baseline',
      textShadow: glow ? GLOW : undefined,
    }}>
      <span style={{
        fontFamily: GEIST,
        fontWeight: 800,
        fontSize: size,
        color,
        letterSpacing: '-0.025em',
        lineHeight: 0.85,
      }}>jyna</span>
      <div style={{
        position: 'relative',
        bottom: -size * 0.015,
        filter: glow ? 'drop-shadow(0 0 10px rgba(108,224,212,0.40))' : undefined,
      }}>
        <EchoFlourishXX
          height={xxH}
          accent={accent}
          echo={echo}
          extLen={0.5}
          echoOpacity={echoOpacity}
        />
      </div>
    </div>
  );
}

// ---------- JynaxxApps lockup — hero / masthead mark -------------------

interface JynaxxAppsLockupProps {
  size?: number;
  color?: string;
  glow?: boolean;
}

export function JynaxxAppsLockup({ size = 26, color = CON_INK, glow = false }: JynaxxAppsLockupProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.5 }}>
      <JynaxxWordmark size={size} color={color} glow={glow} />
      <span style={{
        width: 1,
        height: size * 0.82,
        background: CON_ACCENT,
        opacity: DIVIDER_OPACITY,
      }} />
      <span style={{
        fontFamily: MONO,
        fontWeight: 500,
        fontSize: size * 0.5,
        letterSpacing: '0.18em',
        textTransform: 'uppercase' as const,
        color: CON_ACCENT,
        opacity: SUBLABEL_OPACITY,
        textShadow: glow ? '0 0 6px rgba(108,224,212,0.40)' : undefined,
      }}>Apps</span>
    </div>
  );
}

// ---------- Stacked monogram — favicon / corner mark -------------------

interface MonogramProps {
  size?: number;
  accent?: string;
  echo?: string;
}

export function StackedMonogram({
  size = 56,
  accent = CON_ACCENT,
  echo = CON_ECHO,
}: MonogramProps) {
  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: size * 0.04,
      filter: 'drop-shadow(0 0 8px rgba(108,224,212,0.35))',
    }}>
      <EchoFlourishXX height={size} accent={accent} echo={echo} extLen={0} echoOpacity={0.30} />
      <EchoFlourishXX height={size} accent={accent} echo={echo} extLen={0} echoOpacity={0.30} />
    </div>
  );
}
