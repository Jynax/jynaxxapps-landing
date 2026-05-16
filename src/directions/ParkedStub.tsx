// Parked minimal stub — shared presentational component used by Journal.tsx and Arcade.tsx.
// Full designs (journal.jsx / arcade.jsx) intentionally deferred; product owner iterates with designer separately.

import {
  JX_PROJECTS,
  JX_STATUS,
  JX_MANIFESTO,
  JX_NOW,
  JX_CONTACT,
  JX_FOOTER,
} from '../data/jxData';

function isExternal(href: string): boolean {
  return href.startsWith('https://') || href.startsWith('http://')
}

interface ParkedStubProps {
  directionId: 'journal' | 'arcade';
  bg: string;
  fg: string;
  muted: string;
  accent: string;
  wordmarkFont: string;
  wordmarkStyle?: React.CSSProperties;
}

export function ParkedStub({
  directionId,
  bg,
  fg,
  muted,
  accent,
  wordmarkFont,
  wordmarkStyle,
}: ParkedStubProps) {
  return (
    <section
      data-direction={directionId}
      style={{
        minHeight: '100%',
        background: bg,
        color: fg,
        padding: '40px 32px',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {/* Wordmark */}
      <h1
        style={{
          fontFamily: wordmarkFont,
          color: accent,
          fontSize: directionId === 'arcade' ? 14 : 28,
          fontStyle: wordmarkStyle?.fontStyle ?? 'normal',
          marginBottom: 12,
          letterSpacing: directionId === 'arcade' ? '0.04em' : 'normal',
        }}
      >
        JynaxxApps
      </h1>

      {/* Parked banner */}
      <p
        data-parked-banner
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: `1px dashed ${muted}`,
          borderRadius: 4,
          padding: '10px 16px',
          marginBottom: 32,
          color: muted,
          fontSize: 12,
          letterSpacing: '0.04em',
        }}
      >
        this direction is parked — full design pending. reachable for preview only.
      </p>

      {/* Projects — all 12 */}
      <section aria-label="projects">
        <h2 style={{ color: accent, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          Projects
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: 32 }}>
          {JX_PROJECTS.map((p) => {
            const statusMeta = JX_STATUS[p.status];
            return (
              <li
                key={p.id}
                data-parked-project
                style={{
                  marginBottom: 10,
                  paddingBottom: 10,
                  borderBottom: `1px solid rgba(255,255,255,0.06)`,
                }}
              >
                <span style={{ color: muted, marginRight: 8, fontSize: 11 }}>{p.chapter}</span>
                <strong style={{ color: fg, marginRight: 8 }}>{p.name}</strong>
                <span style={{ color: muted, fontSize: 11, marginRight: 8 }}>{p.tag}</span>
                <span style={{ color: statusMeta.color, fontSize: 10, letterSpacing: '0.06em' }}>
                  [{statusMeta.label}]
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Manifesto */}
      <section aria-label="manifesto">
        <h2 style={{ color: accent, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          Manifesto
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: 32 }}>
          {JX_MANIFESTO.map((line) => (
            <li key={line} style={{ color: fg, marginBottom: 6, fontSize: 13 }}>
              {line}
            </li>
          ))}
        </ul>
      </section>

      {/* Now */}
      <section aria-label="now" style={{ marginBottom: 32 }}>
        <h2 style={{ color: accent, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          Now
        </h2>
        <p style={{ color: muted, fontSize: 12, margin: 0 }}>{JX_NOW.line}</p>
      </section>

      {/* Contact */}
      <section aria-label="contact" style={{ marginBottom: 32 }}>
        <h2 style={{ color: accent, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          Contact
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {JX_CONTACT.map((c) => (
            <li key={c.kind} style={{ marginBottom: 6 }}>
              <a
                href={c.href}
                aria-label={c.label}
                style={{ color: fg, fontSize: 12 }}
                {...(isExternal(c.href)
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                {c.value}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, paddingTop: 16 }}>
        <p style={{ color: muted, fontSize: 11, margin: '0 0 4px' }}>{JX_FOOTER.copyright}</p>
        <p style={{ color: muted, fontSize: 11, margin: '0 0 4px' }}>{JX_FOOTER.built}</p>
        <p style={{ color: muted, fontSize: 11, margin: 0 }}>{JX_FOOTER.made}</p>
      </footer>
    </section>
  );
}
