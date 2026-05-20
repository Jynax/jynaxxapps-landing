import { useState, useEffect } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Returns how many boot-log entries should currently be visible.
 *
 * Timing (per design-spec-terminal.md):
 *   - First entry appears after 200ms
 *   - Each subsequent entry appears every `interval`ms after the previous
 *   - Desktop: 80ms (default). Mobile: 70ms (§M.4).
 *
 * Reduced-motion: all entries are revealed immediately (no streaming).
 */
export function useBootStream(totalEntries: number, interval = 80): number {
  const reduced = useReducedMotion()

  const [visible, setVisible] = useState(0)

  useEffect(() => {
    if (reduced) return // early-return, no setState — lint-clean

    const timers: ReturnType<typeof setTimeout>[] = []

    for (let i = 0; i < totalEntries; i++) {
      // First line: 200ms; subsequent lines: 200 + i * interval
      const delay = 200 + i * interval
      const t = setTimeout(() => {
        setVisible(i + 1)
      }, delay)
      timers.push(t)
    }

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [totalEntries, interval, reduced])

  // Reduced-motion: all entries visible immediately, no state involved
  if (reduced) return totalEntries
  return visible
}
