import { useState, useEffect } from 'react'

/**
 * Returns `true` when the user has requested reduced motion.
 * Subscribes to the media query so it updates dynamically if the OS preference
 * changes while the page is open. SSR-safe: guards on `typeof window`.
 */
export function useReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)'

  const getMatches = () =>
    typeof window !== 'undefined'
      ? window.matchMedia(query).matches
      : false

  const [reducedMotion, setReducedMotion] = useState<boolean>(getMatches)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia(query)

    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return reducedMotion
}
