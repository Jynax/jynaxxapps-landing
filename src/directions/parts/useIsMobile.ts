import { useState, useEffect } from 'react'

/** Returns true when the viewport is < 640px (mobile breakpoint from mobile-foundations §1). */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia('(max-width: 639px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isMobile
}
