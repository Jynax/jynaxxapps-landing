import type { CSSProperties, ReactNode } from 'react'

interface CornerFrameProps {
  children: ReactNode
}

/** Shared style for all four corner brackets. */
const BRACKET_BASE: CSSProperties = {
  position: 'absolute',
  width: 16,
  height: 16,
  borderColor: 'var(--con-cyan)',
  borderStyle: 'solid',
  borderWidth: 0,
  pointerEvents: 'none',
}

/**
 * Wrapper that renders its children inside a box framed by four
 * engineering-drawing-style L-brackets (per design-spec-console.md "CornerFrame").
 *
 * Brackets:  16x16px, 1.5px borders, in --con-cyan.
 * Used sparingly — only for the Console hero block.
 */
export function CornerFrame({ children }: CornerFrameProps) {
  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      {/* Top-left */}
      <span
        aria-hidden="true"
        style={{
          ...BRACKET_BASE,
          top: 0,
          left: 0,
          borderTopWidth: 1.5,
          borderLeftWidth: 1.5,
        }}
      />

      {/* Top-right */}
      <span
        aria-hidden="true"
        style={{
          ...BRACKET_BASE,
          top: 0,
          right: 0,
          borderTopWidth: 1.5,
          borderRightWidth: 1.5,
        }}
      />

      {/* Bottom-left */}
      <span
        aria-hidden="true"
        style={{
          ...BRACKET_BASE,
          bottom: 0,
          left: 0,
          borderBottomWidth: 1.5,
          borderLeftWidth: 1.5,
        }}
      />

      {/* Bottom-right */}
      <span
        aria-hidden="true"
        style={{
          ...BRACKET_BASE,
          bottom: 0,
          right: 0,
          borderBottomWidth: 1.5,
          borderRightWidth: 1.5,
        }}
      />

      {children}
    </div>
  )
}
