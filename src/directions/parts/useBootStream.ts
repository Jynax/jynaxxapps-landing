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
 */
export function useBootStream(
  totalEntries: number,
  runKey: string | number = 0,
): number {
  const reducedMotion = useReducedMotion()

  const [visible, setVisible] = useState<number>(() =>
    reducedMotion ? totalEntries : 0,
  )

  useEffect(() => {
    if (reducedMotion) {
      setVisible(totalEntries)
      return
    }

    // Reset to 0 on each runKey / totalEntries change so the stream re-plays
    setVisible(0)

    const timers: ReturnType<typeof setTimeout>[] = []

    for (let i = 0; i < totalEntries; i++) {
      // First line: 200ms; subsequent lines: 200 + i * 80ms
      const delay = 200 + i * 80
      const t = setTimeout(() => {
        setVisible(i + 1)
      }, delay)
      timers.push(t)
    }

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [totalEntries, runKey, reducedMotion])

  return visible
}
