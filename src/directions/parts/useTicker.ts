import { useState, useEffect, useRef } from 'react'
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
 */
export function useTicker(seed: number, ratePerSec: number): number {
  const reducedMotion = useReducedMotion()

  // mountTime is captured inside the effect to avoid calling Date.now()
  // at render time (impure function rule).
  const mountTimeRef = useRef<number | null>(null)

  // Initial state: seed. The interval will update it after first tick (~600ms).
  const [value, setValue] = useState<number>(seed)

  useEffect(() => {
    if (reducedMotion) {
      // Frozen: schedule a microtask so the setState lands in a callback,
      // not synchronously in the effect body.
      const t = setTimeout(() => setValue(seed), 0)
      return () => clearTimeout(t)
    }

    mountTimeRef.current = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - (mountTimeRef.current ?? Date.now())
      setValue(seed + Math.floor((elapsed * ratePerSec) / 1000))
    }, 600)

    return () => clearInterval(interval)
  }, [seed, ratePerSec, reducedMotion])

  return value
}
