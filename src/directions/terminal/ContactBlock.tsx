import { JX_CONTACT } from '../../data/jxData'
import { Prompt } from '../parts/Prompt'

// Reconciled against canonical terminal.jsx: same four contact rows in canonical
// order (email / github / bluesky / rss). Canonical's entries are display-only
// spans; per the spec Interactions table we wire real links from JX_CONTACT
// (email→mailto:, github/bluesky→https:// with safe rel, rss→/feed.xml) — a
// sanctioned functional upgrade, not a content deviation.

/**
 * Block 10 — `contact`: Prompt + the 4 JX_CONTACT entries, wired.
 */
export function ContactBlock() {
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
          lineHeight: 1.9,
        }}
      >
        {JX_CONTACT.map(c => (
          <li
            key={c.kind}
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
              {c.label}
            </span>
            <a
              href={c.href}
              aria-label={c.label}
              {...(c.href.startsWith('https://')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              style={{
                color: 'var(--term-fg-bright)',
                textShadow: 'var(--term-glow)',
                textDecoration: 'none',
                borderBottom: '1px dotted var(--term-fg-bright)',
                justifySelf: 'start',
              }}
            >
              {c.value}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
