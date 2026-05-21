import { useEffect, useRef, useState } from 'react'
import { JX_CONTACT } from '../../data/jxData'
import { Prompt } from '../parts/Prompt'
import { useIsMobile } from '../parts/useIsMobile'

// Reconciled against canonical terminal.jsx: same four contact rows in canonical
// order (email / github / bluesky / rss). Canonical's entries are display-only
// spans; per the spec Interactions table we wire real links from JX_CONTACT
// (email→mailto:, github/bluesky→https:// with safe rel, rss→/feed.xml) — a
// sanctioned functional upgrade, not a content deviation.
//
// Task #51: Mobile layout added. On mobile (<640px) each row stacks
// label-above-value (single column) with a ≥44px tap target and a 120ms
// pressed-state flash. The ≥640px layout is the original two-column grid.

interface ContactRowProps {
  label: string
  value: string
  href: string
}

function ContactRow({ label, value, href }: ContactRowProps) {
  const isMobile = useIsMobile()
  const [pressed, setPressed] = useState(false)
  const pressTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (pressTimer.current !== undefined) window.clearTimeout(pressTimer.current)
    }
  }, [])

  const flashPressed = () => {
    if (!isMobile) return
    setPressed(true)
    if (pressTimer.current !== undefined) window.clearTimeout(pressTimer.current)
    pressTimer.current = window.setTimeout(() => setPressed(false), 120)
  }

  const isExternal = href.startsWith('https://')
  const externalProps = isExternal
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {}

  if (!isMobile) {
    // ── Desktop layout: unchanged two-column grid ─────────────────────────
    return (
      <li
        style={{
          display: 'grid',
          gridTemplateColumns: '110px 1fr',
          gap: 16,
        }}
      >
        <span
          style={{
            color: 'var(--term-fg-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontSize: 12,
          }}
        >
          {label}
        </span>
        <a
          href={href}
          aria-label={label}
          {...externalProps}
          style={{
            color: 'var(--term-fg-bright)',
            textShadow: 'var(--term-glow)',
            textDecoration: 'none',
            borderBottom: '1px dotted var(--term-fg-bright)',
            justifySelf: 'start',
          }}
        >
          {value}
        </a>
      </li>
    )
  }

  // ── Mobile layout: label above value, full-row tappable link ─────────────
  // The entire row is wrapped in <a> so any tap on the 44px-tall row
  // navigates; label text color is overridden inside.
  return (
    <li
      style={{
        listStyle: 'none',
        borderBottom: '1px solid rgba(244,185,66,0.06)',
      }}
    >
      <a
        data-contact-row
        href={href}
        aria-label={label}
        {...externalProps}
        onPointerDown={flashPressed}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: 44,
          padding: '8px 0',
          textDecoration: 'none',
          background: pressed ? 'rgba(244,185,66,0.12)' : 'transparent',
          // Transition off intentionally — 120ms timer handles the flash
        }}
      >
        <span
          style={{
            display: 'block',
            color: 'var(--term-fg-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontSize: 11,
            lineHeight: 1.3,
            marginBottom: 2,
          }}
        >
          {label}
        </span>
        <span
          style={{
            display: 'inline-block',
            color: 'var(--term-fg-bright)',
            textShadow: 'var(--term-glow)',
            fontSize: 14,
            lineHeight: 1.4,
            borderBottom: '1px dotted var(--term-fg-bright)',
          }}
        >
          {value}
        </span>
      </a>
    </li>
  )
}

/**
 * Block 10 — `contact`: Prompt + the 4 JX_CONTACT entries, wired.
 */
export function ContactBlock() {
  const isMobile = useIsMobile()

  return (
    <section aria-label="contact">
      <Prompt command="contact" />
      <ul
        style={{
          listStyle: 'none',
          margin: '14px 0 0',
          padding: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          lineHeight: isMobile ? undefined : 1.9,
        }}
      >
        {JX_CONTACT.map(c => (
          <ContactRow
            key={c.kind}
            label={c.label}
            value={c.value}
            href={c.href}
          />
        ))}
      </ul>
    </section>
  )
}
