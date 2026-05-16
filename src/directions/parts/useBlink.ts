import { useEffect, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Toggling boolean on a fixed interval — drives the Arcade's retro blink/coin
 * cues (joystick wiggle, button pulse, "INSERT COIN", score flicker).
 *
 * Frozen under reduced motion: returns a stable `true` and runs no interval,
 * so every blink-driven element renders in its lit/on state and never moves.
 * (The global tokens.css reduced-motion rule only covers CSS animation/
 * transition; JS-interval state like this must opt out explicitly — same
 * contract as useTicker.)
 */
export function useBlink(period = 500): boolean {
  const reduced = useReducedMotion()
  const [on, setOn] = useState(true)

  useEffect(() => {
    if (reduced) return // no interval, no setState — lint-clean + frozen
    const id = setInterval(() => setOn(v => !v), period)
    return () => clearInterval(id)
  }, [reduced, period])

  return reduced ? true : on
}
