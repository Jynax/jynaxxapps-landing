// Reconciled against canonical directions/console.jsx (provided in handoff). The reference
// renders `// subtitle  ····  meta` as a single pre-formatted mono string. Here a CSS
// flex row with space-between achieves the same visual result while remaining responsive —
// intentional divergence reviewed against canonical and accepted.

interface SectionHeaderProps {
  /** Zero-padded section number, e.g. "01", "02" */
  id: string
  /** Display-font title, e.g. "Manifest" */
  title: string
  /** Subtitle shown after `//`, e.g. "Active Channel" */
  subtitle: string
  /** Right-aligned metadata string */
  meta: string
}

/**
 * Console section header (per design-spec-console.md "Section header").
 *
 * Layout: `§ NN  title // subtitle  ····  right-meta`
 *   - § NN: mono 12px in --con-cyan, 0.18em tracking
 *   - title: display font 36px
 *   - subtitle: mono dim, shown after `//`
 *   - meta: right-aligned, mono dim
 *   - hairline border underneath in --con-line
 */
export function SectionHeader({ id, title, subtitle, meta }: SectionHeaderProps) {
  return (
    <div
      style={{
        borderBottom: '1px solid var(--con-line)',
        paddingBottom: 12,
        marginBottom: 32,
      }}
    >
      {/* Top row: id + title left, meta right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Left: § NN + title + // subtitle */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5em', flexWrap: 'wrap' }}>
          {/* § NN — mono 12px cyan */}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--con-cyan)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            § {id}
          </span>

          {/* title — display 36px, UPPERCASE per canonical console.jsx:503
              (audit #15 — shipped had dropped textTransform) */}
          <span
            data-section-title
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 36,
              fontWeight: 700,
              color: 'var(--con-ink)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </span>

          {/* // subtitle */}
          {subtitle && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--con-dim)',
                letterSpacing: '0.12em',
              }}
            >
              // {subtitle}
            </span>
          )}
        </div>

        {/* Right: meta */}
        {meta && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--con-dim)',
              letterSpacing: '0.12em',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {meta}
          </span>
        )}
      </div>
    </div>
  )
}
