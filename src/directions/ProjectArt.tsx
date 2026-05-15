// ProjectArt — bespoke per-project vector illustrations for the Console direction.
//
// Ported faithfully from the canonical reference design comp
// (handoff/reference-impl/.../directions/console.jsx, `ProjectArt` switch).
// The reference comp is the designated canonical visual artifact for Console;
// these shapes/paths/structure reproduce it (adapted JSX -> TSX, palette tokens).
//
// Canonical-ported art (shapes from console.jsx, mapped by our jxData ids):
//   remnants       -> reference `remnants`     (extraction-shooter HUD)
//   item-b-gone    -> reference `ibg`          (inventory triage grid)
//   meta-tracker   -> reference `meta-tracker` (node-and-edge graph)
//   buried-in-print-> reference `bip`          (book spines + trendline)
//   note-worthy    -> reference `noteworthy`   (musical staff + notes)
//   on-the-move    -> reference `on-the-move`  (radar sweep + "?")
//
// Spec-derived abstract art (console.jsx has NO art for these — the reference
// only ships the 6 public arts per design-spec-console.md "Project art" table;
// these follow the spec's design rules: thin strokes 0.5–1.5, <=3 palette
// colors, ~50% negative space, abstract scenes, no logos/screenshots,
// viewBox 0 0 480 180). Each is RECONCILE-flagged below.
//   cyberdeck, smart-machine, harness-brain,
//   feedback-capture, fit-tracker, home-lab-consolidation

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
  return (
    <svg {...SVG_PROPS} data-project-art aria-hidden="true">
      {renderArt(id, c)}
    </svg>
  )
}

function renderArt(id: string, c: string) {
  switch (id) {
    // ── Canonical-ported (from console.jsx) ──────────────────────────────────
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
    // RECONCILE: no canonical art for cyberdeck in console.jsx — abstract per spec rules
    case 'cyberdeck':
      return <CyberdeckArt c={c} />
    // RECONCILE: no canonical art for smart-machine in console.jsx — abstract per spec rules
    case 'smart-machine':
      return <RouterArt c={c} />
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

// ─────────────────────────────────────────────────────────────────────────────
// Spec-derived abstract arts (console.jsx has no art for these — see RECONCILE
// flags in renderArt). All follow design-spec-console.md "Project art" rules:
// 0.5–1.5 strokes, <=3 palette colors, ~50% negative space, abstract only.
// ─────────────────────────────────────────────────────────────────────────────

/** Cyberdeck — dual-display handheld silhouette + signal arc. */
function CyberdeckArt({ c }: { c: string }) {
  return (
    <g>
      <rect x="150" y="46" width="180" height="88" fill="none" stroke={c} strokeWidth="1.5" />
      <rect x="162" y="58" width="74" height="64" fill={`${c}15`} stroke={c} strokeWidth="1" />
      <rect x="244" y="58" width="74" height="64" fill="none" stroke={T.amber} strokeWidth="1" />
      <line x1="252" y1="74" x2="310" y2="74" stroke={T.amber} strokeWidth="0.8" />
      <line x1="252" y1="88" x2="300" y2="88" stroke={T.amber} strokeWidth="0.8" />
      <line x1="252" y1="102" x2="306" y2="102" stroke={T.amber} strokeWidth="0.8" />
      <g transform="translate(360, 60)" stroke={c} strokeWidth="1" fill="none">
        <path d="M0 30 Q 14 18 0 6" opacity="0.6" />
        <path d="M10 36 Q 30 18 10 0" opacity="0.4" />
      </g>
      <line x1="120" y1="90" x2="150" y2="90" stroke={T.line} strokeWidth="1" strokeDasharray="2 4" />
    </g>
  )
}

/** SMART Machine — task in, classifier diamond, fan-out to model targets. */
function RouterArt({ c }: { c: string }) {
  const targets: [number, number, string][] = [
    [380, 44, T.sage],
    [380, 90, c],
    [380, 136, T.amber],
  ]
  return (
    <g>
      <rect x="40" y="78" width="56" height="24" fill="none" stroke={T.mid} strokeWidth="1" />
      <line x1="96" y1="90" x2="180" y2="90" stroke={c} strokeWidth="1" opacity="0.6" />
      <polygon points="180,66 228,90 180,114 132,90" fill={`${c}15`} stroke={c} strokeWidth="1.5" />
      {targets.map(([x, y, col], i) => (
        <g key={i}>
          <line x1="228" y1="90" x2={x} y2={y} stroke={col} strokeWidth="1" opacity="0.5" />
          <rect x={x} y={y - 12} width="60" height="24" fill="none" stroke={col} strokeWidth="1" />
          <circle cx={x + 10} cy={y} r="3" fill={col} />
        </g>
      ))}
    </g>
  )
}

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
