import { useEffect } from 'react'

/**
 * useFontFamilies — idempotently inject a Google Fonts CSS2 <link> on mount.
 *
 * Called by non-default directions to load their font families lazily.
 * Terminal (the default direction) and the shell chrome only need
 * JetBrains Mono + Geist, which stay in index.html.
 *
 * The injected links keep `display=swap` so text renders in a fallback
 * font first and swaps to the web font once loaded (FOUT on first visit is
 * acceptable per task spec — no spinners added).
 *
 * Module-level Set: injected URLs survive React unmounts so navigating away
 * and back to a direction does NOT inject duplicate links.
 */
const injected = new Set<string>()

export function useFontFamilies(url: string): void {
  useEffect(() => {
    if (injected.has(url)) return
    injected.add(url)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    document.head.appendChild(link)
  }, [url])
}
