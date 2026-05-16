// ProjectArt — bespoke per-project vector illustrations for the Console direction.
//
// Ported faithfully from the canonical reference design comp
// (handoff/reference-impl/.../directions/console.jsx, `ProjectArt` switch).
// The reference comp is the designated canonical visual artifact for Console;
// these shapes/paths/structure reproduce it (adapted JSX -> TSX, palette tokens).
//
// Canonical-ported art (shapes from console.jsx, mapped by our jxData ids):
//   cyberdeck      -> reference `cyberdeck`     (dual-display handheld schematic)
//   smart-machine  -> reference `smart-machine` (dispatcher signal-flow)
//   remnants       -> reference `remnants`      (extraction-shooter HUD)
//   item-b-gone    -> reference `ibg`           (inventory triage grid)
//   meta-tracker   -> reference `meta-tracker`  (node-and-edge graph)
//   buried-in-print-> reference `bip`           (book spines + trendline)
//   note-worthy    -> reference `noteworthy`    (musical staff + notes)
//   on-the-move    -> reference `on-the-move`   (radar sweep + "?")
//
// cyberdeck + smart-machine were spec-derived abstract until the 2026-05-16
// Claude Design revision added dedicated art for both in console.jsx; they are
// now faithfully ported (Task #24). smart-machine carries an SVG pulse on the
// active LM-Studio route, frozen under prefers-reduced-motion.
//
// Spec-derived abstract art (console.jsx still has NO art for these; they
// follow design-spec-console.md "Project art" rules: thin strokes 0.5–1.5,
// <=3 palette colors, ~50% negative space, abstract scenes, no logos/
// screenshots, viewBox 0 0 480 180). Each is RECONCILE-flagged below.
//   harness-brain, feedback-capture, fit-tracker, home-lab-consolidation

import { useReducedMotion } from './parts/useReducedMotion'

interface ProjectArtProps {
  id: string
  /** Card accent color (resolved hex from the accent rotation). */
  accent: string
}

const W = 480
const H = 180

// Palette tokens (hex, matching tokens.css --con-*). Used directly because SVG
// fill/stroke with var() works but rgba-suffix concat (e.g. `${c}AA`) needs hex.
const T = {
  bg: '#0E1419',
  line: '#2A3A45',
  ink: '#E8F0F5',
  mid: '#8BA3B0',
  dim: '#4F6470',
  amber: '#E8C56B',
  cyan: '#6CE0D4',
  coral: '#E07C5A',
  lavender: '#A78BFA',
  sage: '#8BC890',
}

const SVG_PROPS = {
  width: '100%',
  height: '100%',
  viewBox: `0 0 ${W} ${H}`,
  preserveAspectRatio: 'xMidYMid meet' as const,
  style: { display: 'block' as const },
}

/**
 * Renders the bespoke vector illustration for `id` inside a 480×180 SVG.
 * The wrapping element carries `data-project-art`.
 *
 * `meet` (not `slice`) — art fits without cropping; the card's bg gradient
 * fills any side gutter (per spec "Screen area" note).
 */
export function ProjectArt({ id, accent: c }: ProjectArtProps) {
  const reduced = useReducedMotion()
  return (
    <svg {...SVG_PROPS} data-project-art aria-hidden="true">
      {renderArt(id, c, reduced)}
    </svg>
  )
}

function renderArt(id: string, c: string, reduced: boolean) {
  switch (id) {
    // ── Canonical-ported (from console.jsx) ──────────────────────────────────
    case 'cyberdeck':
      return <CyberdeckArt c={c} />
    case 'smart-machine':
      return <SmartMachineArt c={c} reduced={reduced} />
    case 'remnants':
      return <RemnantsArt c={c} />
    case 'item-b-gone':
      return <InventoryArt c={c} />
    case 'meta-tracker':
      return <GraphArt c={c} />
    case 'buried-in-print':
      return <BooksArt c={c} />
    case 'note-worthy':
      return <StaffArt c={c} />
    case 'on-the-move':
      return <RadarArt c={c} />

    // ── Spec-derived abstract (no canonical art in console.jsx) ──────────────
    // RECONCILE: no canonical art for harness-brain in console.jsx — abstract per spec rules
    case 'harness-brain':
      return <EvalArt c={c} />
    // RECONCILE: no canonical art for feedback-capture in console.jsx — abstract per spec rules
    case 'feedback-capture':
      return <CaptureArt c={c} />
    // RECONCILE: no canonical art for fit-tracker in console.jsx — abstract per spec rules
    case 'fit-tracker':
      return <FitArt c={c} />
    // RECONCILE: no canonical art for home-lab-consolidation in console.jsx — abstract per spec rules
    case 'home-lab-consolidation':
      return <HomeLabArt c={c} />

    default:
      return <FallbackArt c={c} />
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Canonical-ported arts (faithful reproduction of console.jsx ProjectArt switch)
// ─────────────────────────────────────────────────────────────────────────────

/** Extraction-shooter HUD — ground line + terrain triangles + polygon figure
 *  + crosshair + HUD readouts. (console.jsx `kind === 'remnants'`) */
function RemnantsArt({ c }: { c: string }) {
  return (
    <>
      <line x1="0" y1="130" x2={W} y2="130" stroke={T.line} strokeWidth="1" strokeDasharray="2 4" />
      <polygon points="60,130 100,90 140,130" fill="none" stroke={c} strokeWidth="1" opacity="0.4" />
      <polygon points="160,130 220,80 280,130" fill="none" stroke={c} strokeWidth="1" opacity="0.5" />
      <polygon points="300,130 360,100 410,130" fill="none" stroke={c} strokeWidth="1" opacity="0.4" />
      <g transform={`translate(${W / 2 - 12}, 92)`}>
        <polygon points="12,0 20,8 18,28 6,28 4,8" fill={`${c}AA`} stroke={c} strokeWidth="1.5" />
        <line x1="12" y1="28" x2="8" y2="42" stroke={c} strokeWidth="1.5" />
        <line x1="12" y1="28" x2="16" y2="42" stroke={c} strokeWidth="1.5" />
      </g>
      <g transform={`translate(${W / 2}, 60)`} stroke={T.coral} strokeWidth="1.5">
        <circle r="14" fill="none" />
        <line x1="-20" y1="0" x2="-6" y2="0" />
        <line x1="6" y1="0" x2="20" y2="0" />
        <line x1="0" y1="-20" x2="0" y2="-6" />
        <line x1="0" y1="6" x2="0" y2="20" />
      </g>
      <g fontFamily='"JetBrains Mono", monospace' fontSize="10" fill={T.mid}>
        <text x="16" y="24">HP 84/100</text>
        <text x="16" y="40">EXTR 03:12</text>
        <text x={W - 72} y="24">AMMO 18/24</text>
        <text x={W - 72} y="40">PING 24</text>
      </g>
    </>
  )
}

/** Inventory grid with sorted/flagged items. (console.jsx `kind === 'ibg'`) */
function InventoryArt({ c }: { c: string }) {
  return (
    <g transform="translate(40, 22)">
      {Array.from({ length: 40 }).map((_, i) => {
        const x = (i % 10) * 38
        const y = Math.floor(i / 10) * 34
        const trash = (i * 13) % 7 < 2
        const keep = !trash && (i * 5) % 3 === 0
        const color = trash ? T.coral : keep ? T.sage : c
        return (
          <g key={i} transform={`translate(${x},${y})`}>
            <rect width="32" height="28" fill={`${color}15`} stroke={color} strokeWidth="1" />
            {trash && (
              <g stroke={T.coral} strokeWidth="1.5" strokeLinecap="round">
                <line x1="8" y1="8" x2="24" y2="20" />
                <line x1="24" y1="8" x2="8" y2="20" />
              </g>
            )}
            {keep && <circle cx="16" cy="14" r="4" fill={T.sage} />}
            {!trash && !keep && <rect x="11" y="9" width="10" height="10" fill={`${c}AA`} />}
          </g>
        )
      })}
    </g>
  )
}

/** Clean node-and-edge graph, one highlighted. (console.jsx `kind === 'meta-tracker'`) */
function GraphArt({ c }: { c: string }) {
  const nodes: [number, number][] = [
    [80, 50], [180, 90], [260, 40], [340, 120], [420, 60], [400, 140], [120, 130],
  ]
  const edges: [number, number][] = [
    [0, 1], [1, 2], [1, 3], [2, 4], [3, 5], [1, 6], [3, 4],
  ]
  return (
    <>
      {edges.map(([a, b], i) => (
        <line
          key={`e${i}`}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke={c}
          strokeWidth="1"
          opacity="0.5"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <g key={`n${i}`}>
          <circle
            cx={x}
            cy={y}
            r="12"
            fill={i === 1 ? T.amber : `${c}33`}
            stroke={i === 1 ? T.amber : c}
            strokeWidth="1.5"
          />
          <text
            x={x}
            y={y + 3}
            fontSize="9"
            textAnchor="middle"
            fontFamily='"JetBrains Mono", monospace'
            fill={i === 1 ? T.bg : c}
          >
            {i + 1}
          </text>
        </g>
      ))}
    </>
  )
}

/** Book spines + reading-trend polyline. (console.jsx `kind === 'bip'`) */
function BooksArt({ c }: { c: string }) {
  const heights = [120, 100, 130, 90, 110, 115]
  const colors = [c, T.amber, T.coral, T.lavender, T.sage, c]
  const trendX = [240, 280, 320, 360, 400, 430]
  const trendY = [90, 70, 80, 50, 60, 40]
  return (
    <>
      <g transform="translate(36, 30)">
        {[0, 1, 2, 3, 4, 5].map(i => {
          const x = i * 26
          const h = heights[i]
          const color = colors[i]
          return (
            <g key={i} transform={`translate(${x}, ${130 - h})`}>
              <rect width="22" height={h} fill={`${color}33`} stroke={color} strokeWidth="1" />
              <line x1="0" y1="12" x2="22" y2="12" stroke={color} strokeWidth="0.5" />
              <line x1="0" y1={h - 12} x2="22" y2={h - 12} stroke={color} strokeWidth="0.5" />
            </g>
          )
        })}
      </g>
      <polyline
        points="240,90 280,70 320,80 360,50 400,60 430,40"
        fill="none"
        stroke={T.amber}
        strokeWidth="2"
      />
      {trendX.map((x, i) => (
        <circle key={i} cx={x} cy={trendY[i]} r="3" fill={T.amber} />
      ))}
    </>
  )
}

/** Musical staff + treble-clef abstraction + 6 notes. (console.jsx `kind === 'noteworthy'`) */
function StaffArt({ c }: { c: string }) {
  const notes: [number, number][] = [
    [80, 18], [140, 36], [200, 0], [260, 54], [320, 18], [380, 36],
  ]
  return (
    <g transform="translate(40, 50)">
      {[0, 1, 2, 3, 4].map(i => (
        <line key={`s${i}`} x1="0" y1={i * 18} x2={W - 80} y2={i * 18} stroke={`${c}AA`} strokeWidth="0.8" />
      ))}
      <path
        d="M 12 0 Q 30 0 30 22 Q 30 50 12 50 Q 6 50 6 42 Q 6 36 16 36 Q 24 36 24 30 Q 24 16 12 16 Q 0 16 0 28 Q 0 60 28 72"
        fill="none"
        stroke={c}
        strokeWidth="2"
      />
      {notes.map(([x, y], i) => (
        <g key={`n${i}`}>
          <ellipse
            cx={x}
            cy={y + 18}
            rx="7"
            ry="5"
            fill={i % 2 === 0 ? T.amber : T.coral}
            transform={`rotate(-20 ${x} ${y + 18})`}
          />
          <line
            x1={x + 6}
            y1={y + 18}
            x2={x + 6}
            y2={y - 14}
            stroke={i % 2 === 0 ? T.amber : T.coral}
            strokeWidth="1.5"
          />
        </g>
      ))}
    </g>
  )
}

/** Radar sweep + faded "?" placeholder. (console.jsx `kind === 'on-the-move'`) */
function RadarArt({ c }: { c: string }) {
  return (
    <g transform={`translate(${W / 2}, ${H / 2})`}>
      <text
        x="0"
        y="20"
        textAnchor="middle"
        fontSize="80"
        fontFamily='"Space Grotesk", sans-serif'
        fontWeight="700"
        fill={c}
        opacity="0.4"
      >
        ?
      </text>
      {[30, 50, 70, 90].map(r => (
        <circle key={r} cx="0" cy="0" r={r} fill="none" stroke={c} strokeWidth="0.5" opacity="0.3" />
      ))}
      <line x1="0" y1="0" x2="64" y2="-64" stroke={c} strokeWidth="1.5" />
    </g>
  )
}

/** Dual-display handheld cyberdeck schematic — grid backdrop, open shell with a
 *  KOReader-ish upper page, lower touch panel + icon row, 12×3 keyboard grid,
 *  status LEDs, Pi-5 callout. (console.jsx `kind === 'cyberdeck'`, 2026-05-16
 *  Claude Design revision) */
function CyberdeckArt({ c }: { c: string }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <line
          key={`gx${i}`}
          x1={W * 0.1}
          y1={20 + i * 28}
          x2={W * 0.9}
          y2={20 + i * 28}
          stroke={T.line}
          strokeWidth="0.5"
        />
      ))}
      <g transform={`translate(${(W - 280) / 2}, 28)`}>
        <rect x="0" y="0" width="280" height="104" rx="6" fill="none" stroke={c} strokeWidth="1.6" />
        <line x1="0" y1="52" x2="280" y2="52" stroke={T.line} strokeWidth="0.6" />
        <rect x="14" y="8" width="252" height="36" fill={`${c}11`} stroke={c} strokeWidth="0.8" />
        {[14, 19, 24, 29, 34, 39].map((y, i) => (
          <line
            key={`tl${i}`}
            x1="22"
            y1={y}
            x2={252 - (i % 2 ? 20 : 0)}
            y2={y}
            stroke={T.mid}
            strokeWidth="0.5"
            opacity="0.7"
          />
        ))}
        <rect x="244" y="11" width="14" height="2" fill={T.amber} opacity="0.85" />
        <rect x="14" y="58" width="80" height="38" fill={`${c}11`} stroke={c} strokeWidth="0.8" />
        {Array.from({ length: 4 }).map((_, i) => (
          <rect
            key={`ti${i}`}
            x={22 + i * 18}
            y="68"
            width="10"
            height="10"
            fill="none"
            stroke={c}
            strokeWidth="0.6"
          />
        ))}
        <line x1="22" y1="86" x2="86" y2="86" stroke={c} strokeWidth="0.6" opacity="0.5" />
        {Array.from({ length: 36 }).map((_, i) => {
          const cols = 12
          const x = 104 + (i % cols) * 14
          const y = 60 + Math.floor(i / cols) * 12
          return (
            <rect
              key={`k${i}`}
              x={x}
              y={y}
              width="10"
              height="9"
              rx="1"
              fill="none"
              stroke={c}
              strokeWidth="0.6"
            />
          )
        })}
        <circle cx="20" cy="100" r="1.6" fill={T.sage} />
        <circle cx="28" cy="100" r="1.6" fill={T.amber} opacity="0.6" />
        <circle cx="260" cy="100" r="1.6" fill={T.coral} opacity="0.7" />
      </g>
      <g fontFamily='"JetBrains Mono", monospace' fontSize="9" fill={T.dim}>
        <text x="20" y="160">PI 5 · DUAL DISPLAY · KOREADER</text>
        <text x={W - 80} y="160">REV.01</text>
      </g>
    </>
  )
}

/** SMART Machine dispatcher signal-flow — task-in arrow → two-stage box
 *  (INTRP | DISP) → four outbound routes (SLM / LM Studio / Anthropic /
 *  Escape). The LM-Studio route is the active one (amber, pulsing dot); the
 *  rest are dim. The pulse freezes under prefers-reduced-motion.
 *  (console.jsx `kind === 'smart-machine'`, 2026-05-16 Claude Design revision) */
function SmartMachineArt({ c, reduced }: { c: string; reduced: boolean }) {
  return (
    <>
      <line x1="20" y1="90" x2={W - 20} y2="90" stroke={T.line} strokeWidth="0.5" strokeDasharray="3 5" />
      {/* incoming signal */}
      <g>
        <line x1="20" y1="90" x2="120" y2="90" stroke={T.sage} strokeWidth="1.6" />
        <polygon points="118,87 124,90 118,93" fill={T.sage} />
        <text x="22" y="82" fontFamily='"JetBrains Mono", monospace' fontSize="9" fill={T.dim}>
          TASK IN
        </text>
      </g>
      {/* central dispatcher — interpreter | dispatcher */}
      <g transform="translate(124, 60)">
        <rect x="0" y="0" width="86" height="60" fill="none" stroke={c} strokeWidth="1.6" />
        <line x1="43" y1="0" x2="43" y2="60" stroke={c} strokeWidth="0.6" strokeDasharray="2 2" />
        <text x="21.5" y="36" textAnchor="middle" fontFamily='"JetBrains Mono", monospace' fontSize="8" fill={T.mid}>
          INTRP
        </text>
        <text x="64.5" y="36" textAnchor="middle" fontFamily='"JetBrains Mono", monospace' fontSize="8" fill={T.mid}>
          DISP
        </text>
        <circle cx="21.5" cy="20" r="2" fill={c} />
        <circle cx="64.5" cy="20" r="2" fill={c} />
        <line x1="23" y1="20" x2="63" y2="20" stroke={c} strokeWidth="0.5" opacity="0.6" />
      </g>
      {/* destination 1 — local SLM (dim) */}
      <g>
        <line x1="210" y1="68" x2="332" y2="36" stroke={T.line} strokeWidth="1" />
        <rect x="332" y="26" width="64" height="20" fill="none" stroke={T.mid} strokeWidth="0.8" />
        <text x="364" y="40" textAnchor="middle" fontFamily='"JetBrains Mono", monospace' fontSize="9" fill={T.mid}>
          SLM
        </text>
      </g>
      {/* destination 2 — LM Studio (active route) */}
      <g>
        <line x1="210" y1="82" x2="332" y2="78" stroke={T.amber} strokeWidth="1.6" />
        <polygon points="330,75 336,78 330,81" fill={T.amber} />
        <rect x="332" y="68" width="64" height="20" fill={`${T.amber}22`} stroke={T.amber} strokeWidth="1.2" />
        <text x="364" y="82" textAnchor="middle" fontFamily='"JetBrains Mono", monospace' fontSize="9" fill={T.amber}>
          LM STUDIO
        </text>
        <circle cx="364" cy="92" r="1.8" fill={T.amber}>
          {!reduced && (
            <animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite" />
          )}
        </circle>
      </g>
      {/* destination 3 — Anthropic API (dim) */}
      <g>
        <line x1="210" y1="96" x2="332" y2="120" stroke={T.line} strokeWidth="1" />
        <rect x="332" y="110" width="64" height="20" fill="none" stroke={T.mid} strokeWidth="0.8" />
        <text x="364" y="124" textAnchor="middle" fontFamily='"JetBrains Mono", monospace' fontSize="9" fill={T.mid}>
          ANTHROPIC
        </text>
      </g>
      {/* destination 4 — escape hatch (dim, dashed) */}
      <g>
        <line x1="210" y1="110" x2="332" y2="152" stroke={T.line} strokeWidth="1" strokeDasharray="2 3" />
        <rect x="332" y="142" width="64" height="20" fill="none" stroke={T.coral} strokeWidth="0.6" strokeDasharray="2 2" />
        <text x="364" y="156" textAnchor="middle" fontFamily='"JetBrains Mono", monospace' fontSize="9" fill={T.coral} opacity="0.7">
          ESCAPE
        </text>
      </g>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Spec-derived abstract arts (console.jsx has no art for these — see RECONCILE
// flags in renderArt). All follow design-spec-console.md "Project art" rules:
// 0.5–1.5 strokes, <=3 palette colors, ~50% negative space, abstract only.
// ─────────────────────────────────────────────────────────────────────────────

/** Harness Brain — candidate bars against an 80% viability threshold line. */
function EvalArt({ c }: { c: string }) {
  const bars = [52, 88, 70, 96, 64]
  return (
    <g transform="translate(70, 24)">
      <line x1="-10" y1="92" x2="350" y2="92" stroke={T.line} strokeWidth="1" />
      <line x1="-10" y1="34" x2="350" y2="34" stroke={T.amber} strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
      <text x="356" y="38" fontSize="9" fontFamily='"JetBrains Mono", monospace' fill={T.amber}>
        80%
      </text>
      {bars.map((v, i) => {
        const x = i * 64
        const pass = v >= 80
        const col = pass ? T.sage : c
        return (
          <rect
            key={i}
            x={x}
            y={92 - v}
            width="34"
            height={v}
            fill={`${col}1F`}
            stroke={col}
            strokeWidth="1.5"
          />
        )
      })}
    </g>
  )
}

/** Feedback Capture — viewport with a drawn region box + arrow + note tag. */
function CaptureArt({ c }: { c: string }) {
  return (
    <g>
      <rect x="60" y="34" width="360" height="112" fill="none" stroke={T.line} strokeWidth="1" />
      <rect x="150" y="62" width="120" height="62" fill={`${T.coral}12`} stroke={T.coral} strokeWidth="1.5" />
      <g stroke={c} strokeWidth="1.5" fill="none">
        <line x1="330" y1="58" x2="276" y2="86" />
        <polyline points="282,76 276,86 288,90" />
      </g>
      <rect x="318" y="44" width="86" height="22" fill="none" stroke={c} strokeWidth="1" />
      <line x1="326" y1="55" x2="396" y2="55" stroke={c} strokeWidth="0.8" />
    </g>
  )
}

/** FIT Tracker — undecided stack: ring with question mark + scattered candidate dots. */
function FitArt({ c }: { c: string }) {
  return (
    <g transform={`translate(${W / 2}, ${H / 2})`}>
      <circle cx="0" cy="0" r="44" fill="none" stroke={c} strokeWidth="1.5" strokeDasharray="6 6" />
      <text
        x="0"
        y="10"
        textAnchor="middle"
        fontSize="40"
        fontFamily='"Space Grotesk", sans-serif'
        fontWeight="700"
        fill={c}
        opacity="0.5"
      >
        ?
      </text>
      {[
        [-130, -40],
        [120, -52],
        [150, 44],
        [-150, 36],
      ].map(([x, y], i) => (
        <g key={i}>
          <line x1="0" y1="0" x2={x} y2={y} stroke={T.line} strokeWidth="0.8" strokeDasharray="2 4" />
          <circle cx={x} cy={y} r="6" fill="none" stroke={T.mid} strokeWidth="1" />
        </g>
      ))}
    </g>
  )
}

/** Home Lab Consolidation — scattered sources converging on one owned server. */
function HomeLabArt({ c }: { c: string }) {
  const sources: [number, number][] = [
    [56, 40],
    [56, 90],
    [56, 140],
    [120, 30],
    [120, 150],
  ]
  return (
    <g>
      {sources.map(([x, y], i) => (
        <g key={i}>
          <line x1={x + 18} y1={y} x2="320" y2="90" stroke={c} strokeWidth="0.8" opacity="0.4" />
          <rect x={x} y={y - 10} width="20" height="20" fill="none" stroke={T.mid} strokeWidth="1" />
        </g>
      ))}
      <rect x="320" y="58" width="96" height="64" fill={`${c}12`} stroke={c} strokeWidth="1.5" />
      {[70, 84, 98, 112].map(yy => (
        <line key={yy} x1="334" y1={yy} x2="402" y2={yy} stroke={c} strokeWidth="0.8" />
      ))}
      <circle cx="368" cy="46" r="4" fill={T.sage} />
    </g>
  )
}

/** Default fallback — abstract scattered dots (console.jsx default branch). */
function FallbackArt({ c }: { c: string }) {
  return (
    <>
      {Array.from({ length: 30 }).map((_, i) => {
        const x = (i * 137.5) % W
        const y = ((i * 73.3) % (H - 20)) + 10
        return <circle key={i} cx={x} cy={y} r={(i % 4) + 1} fill={c} opacity={0.3 + (i % 5) * 0.1} />
      })}
    </>
  )
}
