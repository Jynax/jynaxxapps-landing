import { JX_STATUS } from '../../data/jxData'
import type { Project } from '../../types/jx'
import { ARC, statusToNeon } from './tokens'
import { CartArt } from './CartArt'

const px = { fontFamily: 'var(--font-pixel)' }

// Game-cartridge tile (reference `Cartridge`, 2026-05-16 revision — compact
// 6-up grid variant). Faithful port; rendered as a <button> for keyboard
// access (the reference used a click-only <div>).
export function Cartridge({
  project: p,
  accent: c,
  selected,
  onSelect,
}: {
  project: Project
  accent: string
  selected: boolean
  onSelect: () => void
}) {
  const statusColor = statusToNeon(p.status)
  const statusLabel = (JX_STATUS[p.status] ?? JX_STATUS.sketch).label

  return (
    <button
      type="button"
      data-arcade-cart
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        position: 'relative',
        minHeight: 150,
        background: '#000',
        border: `2px solid ${c}`,
        padding: 0,
        textAlign: 'left',
        font: 'inherit',
        boxShadow: selected
          ? `0 0 20px ${c}DD, 0 0 36px ${c}66, 3px 3px 0 ${c}`
          : `0 0 10px ${c}44, 2px 2px 0 ${c}99`,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform .15s, box-shadow .2s',
        transform: selected ? 'translate(-2px, -2px)' : 'translate(0,0)',
      }}
      onMouseEnter={e => {
        if (!selected) e.currentTarget.style.transform = 'translate(-1px, -1px)'
      }}
      onMouseLeave={e => {
        if (!selected) e.currentTarget.style.transform = 'translate(0,0)'
      }}
    >
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: -9,
            right: 8,
            zIndex: 2,
            background: c,
            color: '#000',
            ...px,
            fontSize: 7,
            padding: '3px 6px',
            letterSpacing: '0.1em',
          }}
        >
          ★ LOADED
        </div>
      )}
      <div style={{ background: c, padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ ...px, fontSize: 7, color: '#000', letterSpacing: '0.1em' }}>{p.chapter}</span>
        <span style={{ ...px, fontSize: 7, color: '#000' }}>NTSC</span>
      </div>
      <div style={{ background: `linear-gradient(135deg, ${c}55 0%, #000 60%)`, padding: 6, position: 'relative', minHeight: 44 }}>
        <CartArt id={p.id} c={c} />
      </div>
      <div style={{ background: '#000', padding: '7px 9px', borderTop: `2px solid ${c}`, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ ...px, fontSize: 8, color: c, marginBottom: 4, textShadow: `0 0 6px ${c}88`, letterSpacing: '0.04em', lineHeight: 1.2 }}>
          {p.name.toUpperCase()}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...px, fontSize: 6, marginTop: 'auto' }}>
          <span style={{ color: statusColor }}>● {statusLabel.toUpperCase()}</span>
          <span style={{ color: ARC.dim }}>{p.touched.toUpperCase()}</span>
        </div>
      </div>
    </button>
  )
}
