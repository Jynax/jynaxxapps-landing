// Global "how many people found the easter egg" counter (Task #31).
//
// GET on mount to display the current total; POST once per browser (gated by a
// localStorage flag) the first time this visitor plays, so the number tracks
// ~unique discoverers. Pages Functions aren't served by `vite dev`, and a
// deployed miss returns the SPA HTML — both are treated as "unknown" (count
// stays null) so the UI simply hides the line rather than showing a broken 0.

import { useCallback, useEffect, useState } from 'react'

const PLAYED_FLAG = 'jx_arcade_played'
const API = '/api/arcade-plays'

const readCount = async (res: Response): Promise<number | null> => {
  const ct = res.headers.get('content-type') || ''
  if (!res.ok || !ct.includes('application/json')) return null
  try {
    const data = (await res.json()) as { count?: unknown }
    return typeof data.count === 'number' ? data.count : null
  } catch {
    return null
  }
}

export function useArcadePlays() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    fetch(API)
      .then(readCount)
      .then(c => {
        if (alive && c !== null) setCount(c)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const registerPlay = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      if (localStorage.getItem(PLAYED_FLAG)) return
    } catch {
      return
    }
    fetch(API, { method: 'POST' })
      .then(readCount)
      .then(c => {
        if (c === null) return
        setCount(c)
        try {
          localStorage.setItem(PLAYED_FLAG, '1')
        } catch {
          /* private mode / quota — fine, it may recount next visit */
        }
      })
      .catch(() => {})
  }, [])

  return { count, registerPlay }
}
