import { useState } from 'react'
import type { ContactKind } from '../../data/jxData'
import { CON } from './accents'

// Section 7 — Contact card.
// Top: bespoke inline SVG icon (mail/code/broadcast/feed — NOT emoji) + label.
// Bottom: the value in mono 14px. Whole card wraps an <a> to the contact href;
// external https:// gets target/rel; mailto + /feed.xml get neither.

const mono = { fontFamily: 'var(--font-mono)' }

interface ContactCardProps {
  kind: ContactKind
  label: string
  value: string
  href: string
  /** Resolved hex accent from CONTACT_ACCENTS rotation. */
  accent: string
}

function ContactIcon({ kind, stroke }: { kind: ContactKind; stroke: string }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none' as const }
  if (kind === 'email') {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" stroke={stroke} strokeWidth="1.5" />
        <path d="M2 6 L12 13 L22 6" stroke={stroke} strokeWidth="1.5" fill="none" />
      </svg>
    )
  }
  if (kind === 'github') {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M8 7 L3 12 L8 17" stroke={stroke} strokeWidth="1.5" />
        <path d="M16 7 L21 12 L16 17" stroke={stroke} strokeWidth="1.5" />
        <line x1="14" y1="5" x2="10" y2="19" stroke={stroke} strokeWidth="1.5" />
      </svg>
    )
  }
  if (kind === 'bluesky') {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="12" cy="12" r="2" fill={stroke} />
        <path d="M7 7 Q12 12 7 17" stroke={stroke} strokeWidth="1.5" fill="none" />
        <path d="M17 7 Q12 12 17 17" stroke={stroke} strokeWidth="1.5" fill="none" />
        <path d="M3 4 Q12 12 3 20" stroke={stroke} strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M21 4 Q12 12 21 20" stroke={stroke} strokeWidth="1.5" fill="none" opacity="0.5" />
      </svg>
    )
  }
  // rss / feed
  return (
    <svg {...common} aria-hidden="true">
      <circle cx="6" cy="18" r="2.5" fill={stroke} />
      <path d="M4 11 Q11 11 11 18" stroke={stroke} strokeWidth="1.5" fill="none" />
      <path d="M4 5 Q18 5 18 18" stroke={stroke} strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function ContactCard({ kind, label, value, href, accent: c }: ContactCardProps) {
  const [hover, setHover] = useState(false)
  const isExternal = href.startsWith('https://')

  return (
    <a
      data-contact-card
      href={href}
      aria-label={label}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'block',
        background: `${CON.bgAlt}99`,
        border: `1px solid ${hover ? c : CON.line}`,
        padding: '20px 22px',
        cursor: 'pointer',
        transition: 'border-color .15s',
        textDecoration: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <ContactIcon kind={kind} stroke={c} />
        <span
          style={{
            ...mono,
            fontSize: 10,
            color: CON.dim,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ ...mono, fontSize: 14, color: CON.ink, letterSpacing: '0.02em' }}>{value}</div>
    </a>
  )
}
