import { ARC } from './tokens'

// Standup arcade cabinet (tall) with Michael standing in front, back view —
// faithful port of reference `ArcadePlayerScene` (2026-05-16 revision).
// Marquee, CRT screen with an abstract game, slanted control deck, coin slot,
// base; the back-view faceless figure is consistent with the S153 naming
// decision (identity-as-Jynaxx is fine; partner never depicted).
//
// Motion: the joystick/buttons follow `blink` (already frozen via useBlink
// under reduced motion). The on-screen enemy flicker + projectile use SVG
// SMIL <animate>, which ignores prefers-reduced-motion — gated on `reduced`
// (omitted = element frozen at its static attributes), same pattern as #24.
export function ArcadePlayerScene({ blink, reduced }: { blink: boolean; reduced: boolean }) {
  return (
    <svg
      viewBox="0 0 130 200"
      width="160"
      height="240"
      data-arcade-cabinet
      shapeRendering="crispEdges"
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Cabinet (back layer) ── */}
      <polygon points="14,4 22,8 22,182 14,188" fill={ARC.neon1} opacity="0.4" />
      <polygon points="116,4 108,8 108,182 116,188" fill={ARC.neon1} opacity="0.4" />
      <rect x="20" y="4" width="90" height="14" fill={ARC.neon1} />
      <rect x="22" y="6" width="86" height="1.4" fill="#000" opacity="0.4" />
      <text x="65" y="14" textAnchor="middle" fontFamily="var(--font-pixel)" fontSize="4.4" fill="#1a0d2a" letterSpacing="1">
        JYNAXX
      </text>
      <rect x="20" y="18" width="90" height="2" fill={ARC.bg} stroke={ARC.neon2} strokeWidth="0.4" />
      <rect x="20" y="20" width="90" height="50" fill="#0a0b22" stroke={ARC.neon2} strokeWidth="0.6" />
      <rect x="25" y="25" width="80" height="40" fill="#000" stroke={`${ARC.neon3}88`} strokeWidth="0.3" />
      {/* Game on screen — abstract */}
      <g>
        {Array.from({ length: 24 }).map((_, i) => {
          const x = 28 + (i % 12) * 6
          const y = 30 + Math.floor(i / 12) * 4
          return (
            <rect key={`d${i}`} x={x} y={y} width="1.4" height="1.4" fill={ARC.neon3} opacity={(i * 7) % 5 === 0 ? 0.85 : 0.22} />
          )
        })}
        <rect x="90" y="32" width="3.4" height="3.4" fill={ARC.neon1}>
          {!reduced && <animate attributeName="opacity" values="1;0.3;1" dur="0.7s" repeatCount="indefinite" />}
        </rect>
        <rect x="40" y="50" width="3.4" height="3.4" fill={ARC.neon4} />
        <rect x="48" y="51.5" width="2.2" height="1.2" fill={ARC.neon3}>
          {!reduced && <animate attributeName="x" values="48;88;48" dur="1.4s" repeatCount="indefinite" />}
        </rect>
        <rect x="27" y="27" width="1.4" height="1.4" fill={ARC.neon4} />
        <rect x="100" y="27" width="2.6" height="1.4" fill={ARC.neon3} />
      </g>
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={`s${i}`} x="25" y={25 + i * 3} width="80" height="0.3" fill="#000" opacity="0.4" />
      ))}
      <rect x="25" y="25" width="80" height="40" fill={ARC.neon3} opacity="0.06" />

      <rect x="20" y="70" width="90" height="5" fill={ARC.bg} stroke={ARC.neon2} strokeWidth="0.4" />
      <text x="65" y="74" textAnchor="middle" fontFamily="var(--font-pixel)" fontSize="2.4" fill={ARC.dim}>
        1P · 2P · CONTINUE?
      </text>

      {/* Control deck (slanted) */}
      <polygon points="20,75 110,75 114,93 16,93" fill="#1a0d3a" stroke={ARC.neon2} strokeWidth="0.6" />
      <circle cx="38" cy="86" r="3" fill={ARC.neon2} opacity="0.85" />
      <line x1="38" y1="86" x2={blink ? 41 : 35} y2={blink ? 80 : 81} stroke={ARC.neon2} strokeWidth="1.8" />
      <circle cx={blink ? 41 : 35} cy={blink ? 80 : 81} r="2" fill={ARC.neon3} />
      <circle cx="65" cy="87" r="2.6" fill={blink ? ARC.neon1 : `${ARC.neon1}66`} />
      <circle cx="74" cy="85" r="2.6" fill={!blink ? ARC.neon3 : `${ARC.neon3}66`} />
      <circle cx="83" cy="87" r="2.6" fill={ARC.neon4} opacity="0.65" />
      <circle cx="92" cy="85" r="2.6" fill={ARC.neon2} opacity="0.65" />

      {/* Coin slot panel */}
      <rect x="20" y="93" width="90" height="10" fill="#0c0826" stroke={`${ARC.neon2}77`} strokeWidth="0.4" />
      <rect x="40" y="96" width="7" height="4" fill={ARC.neon2} opacity="0.4" />
      <rect x="40" y="97" width="7" height="0.5" fill={ARC.ink} opacity="0.8" />
      <rect x="83" y="96" width="7" height="4" fill={ARC.neon2} opacity="0.4" />
      <rect x="83" y="97" width="7" height="0.5" fill={ARC.ink} opacity="0.8" />
      <text x="65" y="100" textAnchor="middle" fontFamily="var(--font-pixel)" fontSize="2.8" fill={ARC.neon3} opacity="0.75">
        INSERT COIN
      </text>

      {/* Cabinet body (lower) */}
      <rect x="20" y="103" width="90" height="75" fill="#1a0d3a" stroke={ARC.neon2} strokeWidth="0.6" />
      <rect x="24" y="108" width="3" height="68" fill={ARC.neon1} opacity="0.45" />
      <rect x="103" y="108" width="3" height="68" fill={ARC.neon1} opacity="0.45" />
      <rect x="48" y="138" width="34" height="22" fill="#000" opacity="0.55" stroke={`${ARC.neon3}55`} strokeWidth="0.4" />
      <text x="65" y="151" textAnchor="middle" fontFamily="var(--font-pixel)" fontSize="3.2" fill={ARC.neon3} opacity="0.9">
        JYNAXX
      </text>
      <text x="65" y="157" textAnchor="middle" fontFamily="var(--font-pixel)" fontSize="2" fill={ARC.neon4} opacity="0.7">
        APPS
      </text>

      <rect x="16" y="178" width="98" height="6" fill={ARC.neon2} opacity="0.6" />

      {/* ── Michael standing in front (foreground, back view) ── */}
      <rect x="50" y="74" width="30" height="3" fill="#2a1a14" />
      <rect x="48" y="77" width="34" height="4" fill="#2a1a14" />
      <rect x="46" y="81" width="38" height="3" fill="#2a1a14" />
      <rect x="54" y="76" width="8" height="1" fill="#5a3a2a" />
      <rect x="52" y="84" width="26" height="6" fill="#9a7050" />
      <rect x="52" y="84" width="26" height="1" fill="#000" opacity="0.25" />
      <rect x="50" y="85" width="2" height="3" fill="#9a7050" />
      <rect x="78" y="85" width="2" height="3" fill="#9a7050" />

      <rect x="40" y="90" width="50" height="6" fill={ARC.neon4} />
      <rect x="34" y="92" width="6" height="22" fill={ARC.neon4} opacity="0.95" />
      <rect x="90" y="92" width="6" height="22" fill={ARC.neon4} opacity="0.95" />
      <rect x="36" y="85" width="4" height="8" fill={ARC.neon4} opacity="0.95" />
      <rect x="90" y="85" width="4" height="8" fill={ARC.neon4} opacity="0.95" />
      <rect x="34" y="80" width="6" height="6" fill="#9a7050" />
      <rect x="90" y="80" width="6" height="6" fill="#9a7050" />

      <rect x="40" y="96" width="50" height="46" fill={ARC.neon4} />
      <rect x="64" y="96" width="2" height="46" fill="#000" opacity="0.35" />
      <rect x="46" y="120" width="38" height="2" fill="#000" opacity="0.3" />
      <rect x="48" y="90" width="34" height="3" fill="#000" opacity="0.3" />

      <rect x="46" y="142" width="16" height="44" fill="#1f2840" />
      <rect x="68" y="142" width="16" height="44" fill="#1f2840" />
      <rect x="46" y="160" width="16" height="1" fill="#000" opacity="0.2" />
      <rect x="68" y="160" width="16" height="1" fill="#000" opacity="0.2" />

      <rect x="44" y="186" width="20" height="6" fill="#0a0a0a" />
      <rect x="66" y="186" width="20" height="6" fill="#0a0a0a" />
      <rect x="44" y="190" width="20" height="2" fill={ARC.ink} opacity="0.25" />
      <rect x="66" y="190" width="20" height="2" fill={ARC.ink} opacity="0.25" />

      <ellipse cx="65" cy="195" rx="32" ry="2" fill="#000" opacity="0.45" />
    </svg>
  )
}
