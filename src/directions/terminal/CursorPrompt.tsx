import { useReducedMotion } from '../parts/useReducedMotion'

// Reconciled against canonical terminal.jsx: canonical's resting prompt blinks a
// single `█` on a 530ms period; we render `_█` blinking at the same 530ms. The
// blink is CSS-keyframe only (canonical uses a JS setInterval) so we honour the
// repo's no-setState-in-effect lint and reduced-motion — a sanctioned mechanism
// change, same visual. No outstanding content deviation.

/**
 * Block 11 — live blinking cursor prompt.
 *
 * Per design-spec-terminal.md #11 + Animations: a `_█` block that blinks on a
 * 530ms period, suggesting interactivity even after content ends.
 *
 * The blink is CSS-only (a keyframe animation) — NO JS timers in the component
 * (repo lint forbids setState-in-effect / impure render; the constraint also
 * says do not re-implement timers here). Under `useReducedMotion()` the block
 * is rendered STATIC (no animation applied) per spec accessibility notes.
 */
const BLINK_KEYFRAMES = `@keyframes jx-term-blink { 0%,49% { opacity: 1 } 50%,100% { opacity: 0 } }`

export function CursorPrompt() {
  const reduced = useReducedMotion()

  return (
    <div
      aria-hidden="true"
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        lineHeight: 1.5,
        userSelect: 'none',
      }}
    >
      <style>{BLINK_KEYFRAMES}</style>
      <span style={{ color: 'var(--term-accent)' }}>jynaxx</span>
      <span style={{ color: 'var(--term-fg-dim)' }}>@workshop</span>
      <span style={{ color: 'var(--term-fg-dim)' }}>:~$</span>{' '}
      <span
        style={{
          color: 'var(--term-fg-bright)',
          textShadow: 'var(--term-glow-strong)',
          animation: reduced ? 'none' : 'jx-term-blink 530ms steps(1, end) infinite',
        }}
      >
        _█
      </span>
    </div>
  )
}
