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
 */
export function useBootStream(totalEntries: number): number {
  const reduced = useReducedMotion()

  const [visible, setVisible] = useState(0)

  useEffect(() => {
    if (reduced) return // early-return, no setState — lint-clean

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
  }, [totalEntries, reduced])

  // Reduced-motion: all entries visible immediately, no state involved
  if (reduced) return totalEntries
  return visible
}
