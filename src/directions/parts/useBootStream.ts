import { useState, useEffect } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Returns how many boot-log entries should currently be visible.
 *
 * Timing (per design-spec-terminal.md):
 *   - First entry appears after 200ms
 *   - Each subsequent entry appears every 80ms after the previous
 *
 * Reduced-motion: all entries are revealed immediately (no streaming).
 *
 * Re-trigger: pass a new `runKey` value (e.g. direction switch counter)
 * to restart the animation from zero. The hook re-runs whenever `runKey`
 * or `totalEntries` changes.
 *
 * Implementation note: state carries the runKey alongside the visible count
 * so that render can immediately return 0 when runKey has changed but the
 * timers have not yet fired — no synchronous setState in the effect body.
 * Reduced-motion is derived at render time (return totalEntries directly),
 * so the effect always early-returns without writing state for that path.
 */
export function useBootStream(
  totalEntries: number,
  runKey: string | number = 0,
): number {
  const reduced = useReducedMotion()

  const [stream, setStream] = useState<{
    key: string | number
    visible: number
  }>({ key: runKey, visible: 0 })

  useEffect(() => {
    if (reduced) return // early-return, no setState — lint-clean

    const timers: ReturnType<typeof setTimeout>[] = []

    for (let i = 0; i < totalEntries; i++) {
      // First line: 200ms; subsequent lines: 200 + i * 80ms
      const delay = 200 + i * 80
      const t = setTimeout(() => {
        setStream({ key: runKey, visible: i + 1 })
      }, delay)
      timers.push(t)
    }

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [totalEntries, runKey, reduced])

  // Reduced-motion: all entries visible immediately, no state involved
  if (reduced) return totalEntries
  // When runKey has advanced but timers haven't fired yet, show 0
  return stream.key === runKey ? stream.visible : 0
}
