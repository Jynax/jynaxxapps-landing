/**
 * Wordmark.tsx — Tech-tinted Jynaxx wordmark for the jynaxxapps.com landing
 * (Tech / "Phosphor Tech" skin).
 *
 * Ported from /brand/round-7-wordmark.jsx (the single source of truth).
 * The wordmark glyph is LOCKED round 6 — DO NOT re-design it. Adjust only
 * `size` and `color`. Accent + echo are pinned to the Tech mode pair
 * (MODE_ACCENTS.tech).
 *
 * The landing is React + Vite + TypeScript, so this .tsx drops straight in
 * (likely src/components/brand/).
 *
 * ── THIS REPLACES THE ASCII SLAB ───────────────────────────────────────
 * The live Tech surface (directions/terminal.jsx) draws "JYNAXX" as a VT323
 * ASCII-art <pre> block and treats THAT as the wordmark. Round 7 supersedes
 * that: the canonical mark is "jyna" (Geist 800) + the echo-flourish xx, in
 * phosphor amber. The ASCII slab is no longer the wordmark — retire it, or
 * demote it to optional decorative boot art BELOW the real mark (see
 * design-spec.md § 3.1, flagged for sign-off). The ASCII block also overflows
 * on mobile; the component below scales fluidly instead.
 *
 * Usage:
 *   <JynaxxWordmark size={120} glow />        // hero, with phosphor glow
 *   <JynaxxAppsLockup size={26} />            // masthead — the apps-hub mark
 *   <JynaxxWordmark size={18} />              // footer
 *   <StackedMonogram size={56} />             // favicon / corner mark
 *
 * ── Sizing (brand-foundations § 2.3 minimums; BIP lesson: start small) ──
 *   • Hero wordmark:   size 96–140  (fluid clamp on mobile — § M below)
 *   • Masthead lockup: size 22–28   (start at 26)
 *   • Footer mark:     size 16–20   (min 14)
 *   • Favicon mono:    size 48–56   (rasterize to 32 / 180)
 */

import React from 'react';

// Tech mode accents — pinned. See brand/round-7-wordmark.jsx MODE_ACCENTS.tech.
const TECH_ACCENT = '#F4B942'; // phosphor amber (front X)
const TECH_ECHO    = '#9A7426'; // dim amber     (echo X)

const GEIST = 'Geist, system-ui, sans-serif';
const MONO  = '"JetBrains Mono", ui-monospace, monospace';

// Phosphor glow applied to the glyph when `glow` is set (matches --tech-glow-bright).
const GLOW = '0 0 12px rgba(244,185,66,0.60), 0 0 28px rgba(244,185,66,0.33)';

// Lockup opacities (locked here, not rediscovered per surface).
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
  accent = TECH_ACCENT,
  echo = TECH_ECHO,
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
      {/* Echo X — faded, offset right. strokeLinecap="square" is REQUIRED
          (it produces the chevron-cut endpoint on the 45° diagonal). */}
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
  color?: string;       // "jyna" letter color — phosphor amber on Tech
  accent?: string;
  echo?: string;
  echoOpacity?: number;
  glow?: boolean;       // apply phosphor glow (hero/masthead yes; footer optional)
}

export function JynaxxWordmark({
  size = 26,
  color = TECH_ACCENT,
  accent = TECH_ACCENT,
  echo = TECH_ECHO,
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
        filter: glow ? 'drop-shadow(0 0 10px rgba(244,185,66,0.55))' : undefined,
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

// ---------- JynaxxApps lockup — the apps-hub masthead mark -------------
// jynaxxapps.com is the APPS HUB, so its masthead wears the `JynaxxApps`
// sub-brand (modes.md → Wordmark hierarchy), not the bare personal `Jynaxx`.
//
// Construction: the locked Jynaxx wordmark + a thin phosphor divider + an
// "Apps" sub-label in JetBrains Mono (Tech's workhorse face). Mirrors the
// Console <MetaLockup> pattern (wordmark · divider · sub-label).
//
// ⚠ The EXACT geometry of the JynaxxApps lockup is not yet locked in the
// brand docs (only the two wordmark NAMES are). This divider+sub-label form
// is the recommendation; see design-spec.md § 11.1 — confirm with Michael
// before treating it as canonical. The whole lockup links to "/" (the hub).

interface JynaxxAppsLockupProps {
  size?: number;
  color?: string;
  glow?: boolean;
}

export function JynaxxAppsLockup({ size = 26, color = TECH_ACCENT, glow = true }: JynaxxAppsLockupProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.5 }}>
      <JynaxxWordmark size={size} color={color} glow={glow} />
      <span style={{
        width: 1,
        height: size * 0.82,
        background: 'currentColor',
        color,
        opacity: DIVIDER_OPACITY,
      }} />
      <span style={{
        fontFamily: MONO,
        fontWeight: 500,
        fontSize: size * 0.5,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color,
        opacity: SUBLABEL_OPACITY,
        textShadow: glow ? '0 0 6px rgba(244,185,66,0.40)' : undefined,
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
  accent = TECH_ACCENT,
  echo = TECH_ECHO,
}: MonogramProps) {
  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: size * 0.04,
      filter: 'drop-shadow(0 0 8px rgba(244,185,66,0.45))',
    }}>
      <EchoFlourishXX height={size} accent={accent} echo={echo} extLen={0} echoOpacity={0.30} />
      <EchoFlourishXX height={size} accent={accent} echo={echo} extLen={0} echoOpacity={0.30} />
    </div>
  );
}
