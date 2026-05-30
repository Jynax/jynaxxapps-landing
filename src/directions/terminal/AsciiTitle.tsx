import { JynaxxAppsLockup } from '../../components/brand/Wordmark'

interface AsciiTitleProps {
  isMobile?: boolean
}

/**
 * Block 2 — Masthead. Round-7 brand: <JynaxxAppsLockup> replaces the VT323 ASCII
 * slab. Phosphor amber, glowing. Subtitle stays verbatim.
 * Mobile: size=32 (fluid-ish; clamp(28px,9vw,44px) equivalent per design-spec § M.2).
 * Desktop: size=26 per § 3.1.
 */
export function AsciiTitle({ isMobile = false }: AsciiTitleProps) {
  return (
    <div>
      <h1 style={{ margin: 0, lineHeight: 1 }}>
        <JynaxxAppsLockup size={isMobile ? 32 : 26} glow />
      </h1>
      <p
        style={{
          margin: '10px 0 0',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          letterSpacing: '0.06em',
          color: 'var(--tech-fg-dim)',
          textShadow: 'var(--tech-glow)',
        }}
      >
        // a workshop for digital machines · MMXXVI
      </p>
    </div>
  )
}
