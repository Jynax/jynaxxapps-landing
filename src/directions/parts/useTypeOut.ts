import { useEffect, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Char-by-char reveal of `text` — drives the Terminal `tail -f` type-out.
 * Returns how many characters should currently be shown.
 *
 * State is only ever set from the async interval callback (never synchronously
 * in the effect body, never via a ref during render) — the repo's react-hooks
 * lint forbids both. To restart the type-out when the activity changes, the
 * consumer remounts via a `key` (see LiveNow), so `text` is stable for the
 * lifetime of any one mount — the same shape as useBootStream.
 *
 * Reduced-motion: the whole string is shown immediately, with no interval and
 * no setState — lint-clean + frozen, same contract as useBootStream/useBlink.
 */
export function useTypeOut(text: string, period = 70): number {
  const reduced = useReducedMotion()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (reduced || !text) return
    let i = 0
    const id = setInterval(() => {
      i += 1
      setCount(i)
      if (i >= text.length) clearInterval(id)
    }, period)
    return () => clearInterval(id)
  }, [text, period, reduced])

  return reduced ? text.length : count
}
