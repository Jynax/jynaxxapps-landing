import { ARC } from '../tokens'

// Pixel-art "Pot of Gold" collector sprite. Dark cauldron with a cyan rim and
// gold spilling over the top. Same crisp-edges <rect> style as PlayerSprite.
// Smaller than the 78×86 chibi by design — exported constants are the hitbox.

export const WIDTH = 60
export const HEIGHT = 68

function P({ x, y, w, h, c }: { x: number; y: number; w: number; h: number; c: string }) {
  return <rect x={x} y={y} width={w} height={h} fill={c} />
}

const BODY = '#121640'
const RIM  = ARC.neon2   // cyan
const GOLD = ARC.neon3   // sun yellow
const BASE = '#000000'
const SHIN = '#FFFFFF'   // sparkle

export function PotOfGold() {
  return (
    <svg
      data-pot-of-gold
      viewBox="0 0 15 17"
      width={WIDTH}
      height={HEIGHT}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* gold overflow */}
      <P x={5} y={0} w={5} h={1} c={GOLD} />
      <P x={4} y={1} w={7} h={1} c={GOLD} />
      <P x={3} y={2} w={9} h={1} c={GOLD} />
      {/* sparkle highlight on gold */}
      <P x={6} y={0} w={1} h={1} c={SHIN} />
      {/* cyan rim top edge */}
      <P x={1} y={3} w={13} h={1} c={RIM} />
      {/* rim side handles */}
      <P x={0} y={3} w={1} h={2} c={RIM} />
      <P x={14} y={3} w={1} h={2} c={RIM} />
      {/* rim lower edge */}
      <P x={1} y={4} w={13} h={1} c={RIM} />
      {/* cauldron body — trapezoid narrowing toward base */}
      <P x={1} y={5}  w={13} h={1} c={BODY} />
      <P x={1} y={6}  w={13} h={3} c={BODY} />
      <P x={2} y={9}  w={11} h={2} c={BODY} />
      <P x={3} y={11} w={9}  h={2} c={BODY} />
      <P x={4} y={13} w={7}  h={1} c={BODY} />
      {/* feet / base */}
      <P x={3} y={14} w={4} h={1} c={BASE} />
      <P x={8} y={14} w={4} h={1} c={BASE} />
    </svg>
  )
}
