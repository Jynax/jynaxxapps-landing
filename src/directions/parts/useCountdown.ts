import { useState, useEffect } from 'react'

/** Returns a HH:MM:SS countdown string to midnight (next puzzle reset). */
export function useCountdown(): string {
  const compute = () => {
    const now = new Date()
    const mn  = new Date(now); mn.setHours(24, 0, 0, 0)
    const ms  = Math.max(0, mn.getTime() - now.getTime())
    const h   = Math.floor(ms / 3600000)
    const m   = Math.floor((ms % 3600000) / 60000)
    const s   = Math.floor((ms % 60000) / 1000)
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }
  const [cd, setCd] = useState(compute)
  useEffect(() => {
    const id = setInterval(() => setCd(compute()), 1000)
    return () => clearInterval(id)
  }, [])
  return cd
}
