import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Returns an ever-increasing integer based on elapsed time since mount.
 *
 * Formula (per design-spec-console.md "HUD ticker stats"):
 *   seed + Math.floor((Date.now() - mountTime) * ratePerSec / 1000)
 *
 * Updates on a ~600ms interval (HUD cadence per the spec).
 * Frozen (returns seed, no interval) when reduced-motion is active.
 *
 * "Feels alive on reload without lying" — the value is anchored to real
 * elapsed time, not a fabricated absolute counter.
 *
 * Implementation note: the visible value is computed inside the setInterval
 * callback (async — not synchronous in the effect body) and stored in state.
 * The react-hooks/purity rule forbids Date.now() at render time; the
 * react-hooks/set-state-in-effect rule forbids synchronous setState in the
 * effect body. Both are satisfied here: Date.now() runs only in the async
 * callback, and setState (setValue) is only called from that callback.
 */
export function useTicker(seed: number, ratePerSec: number): number {
  const reduced = useReducedMotion()
  const mountRef = useRef<number | null>(null)
  const [value, setValue] = useState<number>(seed)

  useEffect(() => {
    if (reduced) return // no interval, no setState — lint-clean
    mountRef.current = Date.now()
    const id = setInterval(() => {
      const elapsed = Date.now() - (mountRef.current ?? Date.now())
      setValue(seed + Math.floor((elapsed * ratePerSec) / 1000))
    }, 600)
    return () => clearInterval(id)
  }, [reduced, seed, ratePerSec])

  return reduced ? seed : value
}
