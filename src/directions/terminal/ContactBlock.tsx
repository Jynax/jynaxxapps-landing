import { JX_CONTACT } from '../../data/jxData'
import { Prompt } from '../parts/Prompt'

// RECONCILE: confirm exact contact row layout vs directions/terminal.jsx if it
// becomes available. Hrefs come straight from JX_CONTACT (email→mailto:,
// github/bluesky→https://, rss→/feed.xml) per spec Interactions table.

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
