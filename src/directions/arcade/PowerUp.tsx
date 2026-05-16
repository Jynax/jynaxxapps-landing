import { ARC, POWERUP_ACCENTS, accentAt } from './tokens'

const px = { fontFamily: 'var(--font-pixel)' }
const mono = { fontFamily: 'var(--font-vt)' }

// Manifesto line as an arcade "power-up" card (reference `PowerUp`).
export function PowerUp({ text, index }: { text: string; index: number }) {
  const c = accentAt(POWERUP_ACCENTS, index)
  return (
    <div
      data-arcade-powerup
      style={{
        border: `2px solid ${c}`,
        padding: '14px 12px',
        minHeight: 140,
        position: 'relative',
        background: '#0006',
      }}
    >
      <div style={{ ...px, fontSize: 10, color: c, marginBottom: 12, textShadow: `0 0 6px ${c}88` }}>
        ★{(index + 1).toString().padStart(2, '0')}
      </div>
      <div style={{ ...mono, fontSize: 19, lineHeight: 1.15, color: ARC.ink }}>{text}</div>
    </div>
  )
}
