import { useEffect, useState } from 'react'
import { CON } from './accents'

// Section 6 — Directive (house-rule) card.
// Top-left: `⌘ rule_0N` mono 10px accent. Middle: rule text display 22px.
// Bottom-left: 24×1 accent line as a visual signature.

const mono = { fontFamily: 'var(--font-mono)' }
const display = { fontFamily: 'var(--font-display)', fontWeight: 700 }

function useMediaQuery(query: string, defaultValue = false) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return defaultValue
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  return matches
}

interface DirectiveCardProps {
  text: string
  index: number
  /** Resolved hex accent from DIRECTIVE_ACCENTS rotation. */
  accent: string
}

export function DirectiveCard({ text, index, accent: c }: DirectiveCardProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return (
    <div
      data-directive-card
      style={{
        background: `${CON.bgAlt}99`,
        border: `1px solid ${CON.line}`,
        padding: '20px 18px',
        minHeight: isDesktop ? 180 : 100,
        position: 'relative',
      }}
    >
      <div
        style={{
          ...mono,
          fontSize: 10,
          color: c,
          letterSpacing: '0.2em',
          marginBottom: 14,
          textTransform: 'uppercase',
        }}
      >
        ⌘ rule_0{index + 1}
      </div>
      <div
        style={{
          ...display,
          fontWeight: 600,
          fontSize: 22,
          lineHeight: 1.1,
          color: CON.ink,
          letterSpacing: '-0.01em',
          textWrap: 'pretty',
        }}
      >
        {text}
      </div>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 14,
          left: 18,
          width: isDesktop ? 24 : 32,
          height: 1,
          background: c,
        }}
      />
    </div>
  )
}
