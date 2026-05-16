import { ARC } from './tokens'

// Pixel "screenshot" per cartridge — abstract shapes only (reference
// `CartArt`, 2026-05-16 revision). Mapped by our jxData ids:
//   cyberdeck/smart-machine/remnants → same; item-b-gone←`ibg`;
//   buried-in-print←`bip`; meta-tracker→same. Only the 6 public ids reach
//   this (Cartridge is public-only); anything else hits the default grid.

const svgProps = {
  viewBox: '0 0 60 50',
  width: '100%',
  shapeRendering: 'crispEdges' as const,
  style: { display: 'block' as const },
} as const

export function CartArt({ id, c }: { id: string; c: string }) {
  if (id === 'cyberdeck') {
    return (
      <svg {...svgProps} aria-hidden="true">
        <rect x="4" y="6" width="52" height="38" fill={`${c}22`} stroke={c} strokeWidth="0.6" />
        <rect x="8" y="9" width="44" height="10" fill={ARC.neon3} opacity="0.85" />
        <rect x="10" y="11" width="8" height="1" fill="#000" />
        <rect x="10" y="14" width="14" height="1" fill="#000" />
        <rect x="10" y="16" width="10" height="1" fill="#000" />
        <rect x="8" y="21" width="44" height="6" fill={ARC.neon2} opacity="0.75" />
        {Array.from({ length: 28 }).map((_, i) => {
          const cols = 14
          const x = 8 + (i % cols) * 3.15
          const y = 30 + Math.floor(i / cols) * 5
          return <rect key={i} x={x} y={y} width="2.2" height="2.2" fill={c} />
        })}
        <rect x="6" y="42" width="1.4" height="1.4" fill={ARC.neon4} />
        <rect x="9" y="42" width="1.4" height="1.4" fill={ARC.neon1} />
      </svg>
    )
  }
  if (id === 'smart-machine') {
    return (
      <svg {...svgProps} aria-hidden="true">
        <g stroke={ARC.neon2} strokeWidth="0.7" fill="none">
          <line x1="30" y1="25" x2="12" y2="12" />
          <line x1="30" y1="25" x2="48" y2="12" />
          <line x1="30" y1="25" x2="12" y2="38" />
          <line x1="30" y1="25" x2="48" y2="38" />
        </g>
        <rect x="24" y="19" width="12" height="12" fill={ARC.neon3} />
        <rect x="27" y="22" width="6" height="6" fill="#000" />
        <rect x="29" y="24" width="2" height="2" fill={ARC.neon3} />
        <rect x="6" y="8" width="10" height="8" fill={c} />
        <rect x="44" y="7" width="10" height="10" fill={c} />
        <rect x="6" y="34" width="12" height="8" fill={c} />
        <rect x="46" y="34" width="8" height="8" fill={c} />
        <rect x="8" y="10" width="2" height="1" fill="#000" />
        <rect x="46" y="9" width="3" height="1" fill="#000" />
        <rect x="8" y="36" width="4" height="1" fill="#000" />
        <rect x="48" y="36" width="2" height="1" fill="#000" />
      </svg>
    )
  }
  if (id === 'remnants') {
    return (
      <svg {...svgProps} aria-hidden="true">
        {Array.from({ length: 60 }).map((_, i) => {
          const x = (i % 10) * 6 + 2
          const y = Math.floor(i / 10) * 7 + 4
          const filled = (i * 7) % 11 < 5
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width="4"
              height="4"
              fill={filled ? `${c}AA` : 'transparent'}
              stroke={filled ? c : 'transparent'}
              strokeWidth="0.3"
            />
          )
        })}
        <rect x="26" y="22" width="4" height="4" fill={ARC.neon3} />
        <rect x="44" y="36" width="2" height="2" fill={ARC.neon1} />
      </svg>
    )
  }
  if (id === 'item-b-gone') {
    return (
      <svg {...svgProps} aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => {
          const x = (i % 6) * 9 + 4
          const y = Math.floor(i / 6) * 11 + 4
          const trash = (i * 13) % 7 < 3
          return (
            <g key={i}>
              <rect x={x} y={y} width="7" height="8" fill={`${c}33`} stroke={c} strokeWidth="0.4" />
              {trash && (
                <g stroke={ARC.neon1} strokeWidth="0.6">
                  <line x1={x + 1} y1={y + 1} x2={x + 6} y2={y + 7} />
                  <line x1={x + 6} y1={y + 1} x2={x + 1} y2={y + 7} />
                </g>
              )}
            </g>
          )
        })}
      </svg>
    )
  }
  if (id === 'meta-tracker') {
    const nodes: [number, number][] = [
      [10, 12], [30, 22], [48, 14], [22, 36], [44, 36], [52, 32],
    ]
    return (
      <svg {...svgProps} aria-hidden="true">
        <g stroke={ARC.neon2} strokeWidth="0.6" fill="none">
          <line x1="10" y1="12" x2="30" y2="22" />
          <line x1="30" y1="22" x2="48" y2="14" />
          <line x1="30" y1="22" x2="22" y2="36" />
          <line x1="30" y1="22" x2="44" y2="36" />
          <line x1="48" y1="14" x2="52" y2="32" />
        </g>
        {nodes.map(([x, y], i) => (
          <rect key={i} x={x - 2} y={y - 2} width="4" height="4" fill={i === 1 ? ARC.neon3 : c} />
        ))}
      </svg>
    )
  }
  if (id === 'buried-in-print') {
    const books = [
      { w: 4, h: 20, color: c },
      { w: 5, h: 26, color: ARC.neon3 },
      { w: 3, h: 14, color: ARC.neon1 },
      { w: 6, h: 30, color: ARC.neon4 },
      { w: 4, h: 22, color: c },
      { w: 5, h: 32, color: ARC.neon3 },
      { w: 3, h: 16, color: c },
      { w: 6, h: 24, color: ARC.neon1 },
    ]
    let cursor = 6
    const placed = books.map(b => {
      const x = cursor
      cursor += b.w + 1
      return { ...b, x }
    })
    return (
      <svg {...svgProps} aria-hidden="true">
        {placed.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={42 - b.h} width={b.w} height={b.h} fill={b.color} />
            <rect x={b.x} y={42 - b.h + 2} width={b.w} height="1" fill="#000" opacity="0.55" />
            <rect x={b.x} y={38} width={b.w} height="1" fill="#000" opacity="0.55" />
          </g>
        ))}
        <rect x="4" y="42" width="52" height="1.2" fill={ARC.dim} />
        <rect x="22" y="6" width="16" height="2.5" fill={ARC.neon3} />
        <rect x="22" y="6" width="2" height="2.5" fill="#000" opacity="0.4" />
        <rect x="24" y="9" width="14" height="2.5" fill={ARC.neon1} />
        <rect x="24" y="9" width="2" height="2.5" fill="#000" opacity="0.4" />
      </svg>
    )
  }
  // default — sparse pixel grid (reference default branch)
  return (
    <svg {...svgProps} aria-hidden="true">
      {Array.from({ length: 40 }).map((_, i) => {
        const x = (i % 8) * 7 + 2
        const y = Math.floor(i / 8) * 9 + 4
        return <rect key={i} x={x} y={y} width="3" height="3" fill={(i * 3) % 5 === 0 ? c : 'transparent'} />
      })}
    </svg>
  )
}
