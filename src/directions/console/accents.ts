// Shared accent palette + rotations for the Console direction.
// Resolved hex (not var()) so SVG/`${c}NN` alpha-suffix concatenation works.

export const CON = {
  bg: '#0E1419',
  bgAlt: '#141C23',
  bgRaise: '#1A2530',
  line: '#2A3A45',
  lineGlow: '#3E5260',
  ink: '#E8F0F5',
  mid: '#8BA3B0',
  dim: '#4F6470',
  amber: '#E8C56B',
  cyan: '#6CE0D4',
  coral: '#E07C5A',
  lavender: '#A78BFA',
  sage: '#8BC890',
} as const

/** Project-card accent rotation (cyan, amber, coral, lavender, sage, cyan)
 *  per design-spec-console.md "Card accent rotation". */
export const CARD_ACCENTS = [
  CON.cyan,
  CON.amber,
  CON.coral,
  CON.lavender,
  CON.sage,
  CON.cyan,
] as const

/** Directive-card accent rotation (amber, cyan, coral, lavender, sage)
 *  per console.jsx DirectiveCard. */
export const DIRECTIVE_ACCENTS = [
  CON.amber,
  CON.cyan,
  CON.coral,
  CON.lavender,
  CON.sage,
] as const

/** Contact-card accent rotation (amber, cyan, coral, lavender)
 *  per console.jsx ContactCard. */
export const CONTACT_ACCENTS = [
  CON.amber,
  CON.cyan,
  CON.coral,
  CON.lavender,
] as const

export function accentAt(rotation: readonly string[], index: number): string {
  return rotation[index % rotation.length]
}
