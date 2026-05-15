import { useEffect, useState, useCallback } from 'react'

export type DirectionId = 'terminal' | 'console' | 'journal' | 'arcade'
const VALID: DirectionId[] = ['terminal', 'console', 'journal', 'arcade']
const STORAGE_KEY = 'jx-live-direction'
export const DEFAULT_DIRECTION: DirectionId = 'terminal'

function fromHash(): DirectionId | null {
  const h = window.location.hash.replace(/^#/, '')
  return (VALID as string[]).includes(h) ? (h as DirectionId) : null
}

export function useDirectionRoute() {
  const [direction, setDirectionState] = useState<DirectionId>(() => {
    const hash = fromHash()
    if (hash) return hash
    const saved = localStorage.getItem(STORAGE_KEY)
    return (VALID as string[]).includes(saved ?? '') ? (saved as DirectionId) : DEFAULT_DIRECTION
  })

  useEffect(() => {
    const onHash = () => { const h = fromHash(); if (h) setDirectionState(h) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const setDirection = useCallback((d: DirectionId) => {
    localStorage.setItem(STORAGE_KEY, d)
    history.replaceState(null, '', `#${d}`)
    setDirectionState(d)
  }, [])

  const fromUrlHash = fromHash()
  return { direction, setDirection, isHidden: direction === 'journal' || direction === 'arcade', cameFromHash: !!fromUrlHash }
}
