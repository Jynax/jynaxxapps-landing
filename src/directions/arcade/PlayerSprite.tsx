import { ARC } from './tokens'

// Chibi player sprite (reference `PlayerSprite`) — abstract pixel blocks only.
// The reference had stray `/* body */` / `/* legs */` tokens rendered as
// literal text nodes inside the SVG; ported as proper JSX comments (clearly an
// authoring artifact, not design intent).

function P({ x, y, w, h, c }: { x: number; y: number; w: number; h: number; c: string }) {
  return <rect x={x} y={y} width={w} height={h} fill={c} />
}

export function PlayerSprite() {
  return (
    <svg viewBox="0 0 16 18" width="78" height="86" shapeRendering="crispEdges" aria-hidden="true">
      {/* hair */}
      <P x={4} y={1} w={8} h={1} c={ARC.neon1} />
      <P x={3} y={2} w={10} h={1} c={ARC.neon1} />
      <P x={3} y={3} w={10} h={1} c={ARC.neon1} />
      {/* face */}
      <P x={4} y={4} w={8} h={4} c="#F4C9A0" />
      {/* eyes */}
      <P x={5} y={5} w={2} h={1} c="#000" />
      <P x={9} y={5} w={2} h={1} c="#000" />
      <P x={6} y={6} w={1} h={1} c={ARC.neon2} />
      <P x={10} y={6} w={1} h={1} c={ARC.neon2} />
      {/* smirk */}
      <P x={7} y={7} w={2} h={1} c="#A05030" />
      {/* body */}
      <P x={4} y={8} w={8} h={1} c={ARC.neon3} />
      <P x={3} y={9} w={10} h={4} c={ARC.neon3} />
      <P x={5} y={10} w={6} h={2} c={ARC.neon4} />
      {/* arms */}
      <P x={2} y={10} w={1} h={3} c="#F4C9A0" />
      <P x={13} y={10} w={1} h={3} c="#F4C9A0" />
      {/* legs */}
      <P x={5} y={13} w={2} h={4} c={ARC.neon1} />
      <P x={9} y={13} w={2} h={4} c={ARC.neon1} />
      <P x={4} y={17} w={3} h={1} c="#000" />
      <P x={9} y={17} w={3} h={1} c="#000" />
    </svg>
  )
}
