// Shared palette + helpers for the Arcade direction.
// Resolved hex (not var()) so SVG / `${c}NN` alpha-suffix concatenation works
// — same rationale as console/accents.ts `CON`. Values match the canonical
// reference-impl reconciled against the 2026-05-16 Claude Design revision
// (handoff .../directions/arcade.jsx → `t`).

import type { ProjectStatus } from '../../types/jx'

export const ARC = {
  bg: '#0B0D2E', // deep midnight
  bgLight: '#1A1F4C',
  panel: '#221266',
  neon1: '#FF3D7F', // hot pink
  neon2: '#3DEAFF', // cyan
  neon3: '#FFD93D', // sun
  neon4: '#7BFF7B', // green
  ink: '#FFFFFF',
  dim: '#7B85C4',
} as const

// Extra cart/power-up accents beyond the four neons (reference Cartridge /
// PowerUp rotations).
export const ACCENT_ORANGE = '#FF7B3D'
export const ACCENT_VIOLET = '#B66DFF'

/** Cartridge accent rotation (reference `Cartridge`/`PowerUp` colors). */
export const CART_ACCENTS = [
  ARC.neon1,
  ARC.neon2,
  ARC.neon3,
  ARC.neon4,
  ACCENT_ORANGE,
  ACCENT_VIOLET,
] as const

/** Power-up accent rotation (reference `PowerUp`). */
export const POWERUP_ACCENTS = [
  ARC.neon1,
  ARC.neon2,
  ARC.neon3,
  ARC.neon4,
  ACCENT_ORANGE,
] as const

export function accentAt(rotation: readonly string[], index: number): string {
  return rotation[index % rotation.length]
}

/** Project status → neon accent (reference `statusToNeon`). */
export function statusToNeon(status: ProjectStatus): string {
  const map: Partial<Record<ProjectStatus, string>> = {
    active: ARC.neon4,
    building: ARC.neon4,
    frozen: ARC.neon2,
    maintained: ARC.neon4,
    'winding-down': ACCENT_ORANGE,
    'shipped-private': ARC.neon2,
    research: ARC.neon3,
    sketch: ARC.neon3,
    soon: ARC.dim,
  }
  return map[status] ?? ARC.dim
}

/** Thousands-separated integer (reference `fmt`; matches HudBar's fmt). */
export function fmt(n: number): string {
  return n.toLocaleString('en-US')
}
