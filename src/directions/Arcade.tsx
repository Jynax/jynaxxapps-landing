// Arcade direction — 8-bit cabinet / cartridge-library energy.
//
// Promoted from a parked stub to a full featured direction (Task #25, May-16
// round PR 3 of 4). Built from the canonical reference-impl arcade.jsx
// reconciled against the 2026-05-16 Claude Design revision (Michael's
// instruction: build from canonical ⊕ diff, not a delta against the stub),
// re-implemented in our React 19 + TS stack. Data is read from jxData only.
//
// Round decisions applied:
//  • Visitor reactions are NOT ported (Decision 8.3 #4 — stripped this round;
//    deferred Phase 2). The reference's reactions block is intentionally absent.
//  • The live strip is built against the `useLiveFeed` stub contract; Task #26
//    swaps only the data source (single current entry — Decision 8.3 #3).
//  • Named bio retained ("michael chartrand", maker voice — Decision 8.2).
//
// Motion: JS blink cues freeze via useBlink; SVG SMIL freezes via the
// `reduced` gate (#24 pattern). CSS transitions/animations are covered by the
// global tokens.css reduced-motion rule.

import { useState } from 'react'
import { JX_PROJECTS, JX_MANIFESTO } from '../data/jxData'
import { useBlink } from './parts/useBlink'
import { useReducedMotion } from './parts/useReducedMotion'
import { useLiveFeed } from './parts/useLiveFeed'
import { ARC, CART_ACCENTS, accentAt, fmt } from './arcade/tokens'
import { Starfield } from './arcade/Starfield'
import { PlayerSprite } from './arcade/PlayerSprite'
import { Cartridge } from './arcade/Cartridge'
import { CartDossier } from './arcade/CartDossier'
import { DevKitRow, DevKitInline } from './arcade/DevKit'
import { PowerUp } from './arcade/PowerUp'
import { ArcadeLiveStrip } from './arcade/ArcadeLiveStrip'
import { CoinGameOverlay } from './arcade/coingame/CoinGameOverlay'
import { ARCADE_GAMES } from './arcade/coingame/games'

const px = { fontFamily: 'var(--font-pixel)' }
const mono = { fontFamily: 'var(--font-vt)' }

const publicProjects = JX_PROJECTS.filter(p => p.group === 'public')
const workshopProjects = JX_PROJECTS.filter(p => p.group === 'workshop')

const panel = {
  border: `2px solid ${ARC.neon2}`,
  background: `${ARC.bg}AA`,
  boxShadow: `0 0 24px ${ARC.neon2}33`,
} as const

// Persistent personal-best for the Arcade easter-egg (Task #31). Per-browser
// (localStorage) so the achieved-on date is meaningful across reloads; before
// anyone beats the seeded baseline there is no real date to show.
const HI_KEY = 'jx_arcade_hiscore'
const HI_SEED = 1247

interface HiScore {
  score: number
  date: string | null // yyyy-mm-dd of when the best was set; null = seed
}

function readStoredHi(): HiScore {
  if (typeof window === 'undefined') return { score: HI_SEED, date: null }
  try {
    const raw = localStorage.getItem(HI_KEY)
    if (raw) {
      const p = JSON.parse(raw) as { score?: unknown; date?: unknown }
      if (typeof p.score === 'number' && p.score >= 0) {
        return { score: p.score, date: typeof p.date === 'string' ? p.date : null }
      }
    }
  } catch {
    /* corrupt / unavailable — fall back to seed */
  }
  return { score: HI_SEED, date: null }
}

function todayISO(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function fmtHiDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return m ? `${m[1].slice(2)}.${m[2]}.${m[3]}` : iso
}

export default function Arcade() {
  const reduced = useReducedMotion()
  const blink = useBlink(420)
  const coin = useBlink(900)
  const feed = useLiveFeed()
  const [selectedId, setSelectedId] = useState<string | null>('cyberdeck')
  const select = (id: string) => setSelectedId(prev => (prev === id ? null : id))
  const [coinOpen, setCoinOpen] = useState(false)
  const [gameIndex, setGameIndex] = useState(0)
  const [hi, setHi] = useState<HiScore>(readStoredHi)
  const recordScore = (s: number) => {
    if (s <= hi.score) return
    const next: HiScore = { score: s, date: todayISO() }
    setHi(next)
    try {
      localStorage.setItem(HI_KEY, JSON.stringify(next))
    } catch {
      /* private mode / quota — in-memory best still updates */
    }
  }

  const loadedPublic = publicProjects.find(p => p.id === selectedId) ?? null
  const loadedWorkshop = workshopProjects.find(p => p.id === selectedId) ?? null

  return (
    <section
      data-direction="arcade"
      style={{
        width: '100%',
        minHeight: '100%',
        background: `radial-gradient(ellipse at 30% 0%, ${ARC.bgLight} 0%, ${ARC.bg} 60%, #050620 100%)`,
        color: ARC.ink,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Starfield />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 3,
          background:
            'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 3px)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 2, padding: '36px 56px 80px' }}>
        {/* HUD top bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            ...px,
            fontSize: 10,
            color: ARC.dim,
            letterSpacing: '0.08em',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span style={{ color: ARC.neon3 }}>
            1UP &nbsp; <span style={{ color: ARC.ink }}>JYNAXX</span>
          </span>
          <span style={{ color: ARC.neon2 }}>
            HI-SCORE &nbsp; <span style={{ color: ARC.ink, opacity: blink ? 1 : 0.4 }}>{fmt(hi.score)}</span>
            {hi.date && (
              <span data-arcade-hiscore-date style={{ color: ARC.dim, marginLeft: 6 }}>
                · {fmtHiDate(hi.date)}
              </span>
            )}
          </span>
          <span style={{ color: ARC.neon1 }}>
            LEVEL 04 &nbsp; <span style={{ color: ARC.ink }}>WORKSHOP</span>
          </span>
        </div>

        {/* Live feed — collapsable row directly under the HUD */}
        <ArcadeLiveStrip feed={feed} blink={blink} coin={coin} reduced={reduced} />

        {/* Big title */}
        <div style={{ textAlign: 'center', marginTop: 28, position: 'relative' }}>
          <div style={{ ...px, fontSize: 11, letterSpacing: '0.4em', color: ARC.neon2, marginBottom: 12, textShadow: `0 0 8px ${ARC.neon2}99` }}>
            ★ PRESS START TO BUILD ★
          </div>
          <h1
            style={{
              ...px,
              fontSize: 56,
              lineHeight: 1.05,
              margin: 0,
              color: ARC.neon3,
              textShadow: `3px 0 0 ${ARC.neon1}, -3px 0 0 ${ARC.neon2}, 0 0 14px ${ARC.neon3}AA, 0 0 24px ${ARC.neon3}55`,
              letterSpacing: '0.06em',
            }}
          >
            JYNAXX
            <br />
            <span style={{ color: ARC.neon4, textShadow: `3px 0 0 ${ARC.neon1}, -3px 0 0 ${ARC.neon2}, 0 0 14px ${ARC.neon4}AA` }}>APPS</span>
          </h1>
          <div style={{ ...mono, fontSize: 22, marginTop: 12, color: ARC.ink, opacity: 0.9 }}>
            ━━━━━━ a workshop for digital machines ━━━━━━
          </div>
          <button
            type="button"
            data-arcade-insert-coin
            onClick={() => setCoinOpen(true)}
            aria-label="Insert coin — play a hidden mini-game"
            style={{
              ...px,
              fontSize: 9,
              color: ARC.neon3,
              marginTop: 16,
              opacity: coin ? 1 : 0.2,
              letterSpacing: '0.2em',
              background: 'transparent',
              border: 'none',
              padding: 4,
              cursor: 'pointer',
            }}
          >
            ◇ INSERT COIN ◇
          </button>
        </div>

        {/* About strip — player profile */}
        <div style={{ marginTop: 64, padding: 28, ...panel }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
            <div style={{ ...px, fontSize: 13, color: ARC.neon3, letterSpacing: '0.16em', textShadow: `0 0 8px ${ARC.neon3}66` }}>▸ PLAYER PROFILE</div>
            <div style={{ ...px, fontSize: 9, color: ARC.dim, letterSpacing: '0.15em' }}>CLASS · MAKER · LV. 04</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 180px', gap: 24, alignItems: 'center' }}>
            <PlayerSprite />
            <div>
              <p style={{ ...mono, fontSize: 22, lineHeight: 1.35, margin: 0, color: ARC.ink }}>
                JYNAXX is the curious, mischievous half of <span style={{ color: ARC.neon3 }}>michael chartrand</span>. likes building,
                breaking, and seeing what&apos;s possible. dislikes todo apps without opinions.
              </p>
            </div>
            <div style={{ borderLeft: `2px solid ${ARC.neon2}55`, paddingLeft: 22, ...px, fontSize: 9, color: ARC.dim, lineHeight: 2.1 }}>
              <div>HP &nbsp;<span style={{ color: ARC.neon4 }}>∞ COFFEE</span></div>
              <div>WPN &nbsp;<span style={{ color: ARC.neon1 }}>CURIOSITY</span></div>
              <div>BUDDY &nbsp;<span style={{ color: ARC.neon2 }}>CLAUDE</span></div>
            </div>
          </div>
        </div>

        {/* SELECT YOUR CARTRIDGE — screen above, carts below */}
        <div style={{ marginTop: 40 }}>
          <CartDossier project={loadedPublic} onClose={() => setSelectedId(null)} />

          <div
            style={{
              ...px,
              fontSize: 14,
              textAlign: 'center',
              color: ARC.neon1,
              letterSpacing: '0.2em',
              textShadow: `0 0 8px ${ARC.neon1}88`,
              marginTop: 32,
              marginBottom: 16,
            }}
          >
            — SELECT YOUR CARTRIDGE —
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
            {publicProjects.map((p, i) => (
              <Cartridge
                key={p.id}
                project={p}
                accent={accentAt(CART_ACCENTS, i)}
                selected={selectedId === p.id}
                onSelect={() => select(p.id)}
              />
            ))}
          </div>
          <div style={{ ...px, fontSize: 9, textAlign: 'center', marginTop: 14, color: ARC.dim, letterSpacing: '0.15em' }}>
            ◀ ▶ &nbsp; CLICK A CART TO LOAD &nbsp; ◆ &nbsp; CURRENTLY LOADED:
            <span style={{ color: ARC.neon3, marginLeft: 8 }}>{selectedId ? selectedId.toUpperCase() : 'NONE'}</span>
          </div>
        </div>

        {/* B-Sides — workshop catalog */}
        <div style={{ marginTop: 56, padding: 28, ...panel }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
            <div style={{ ...px, fontSize: 13, color: ARC.neon2, letterSpacing: '0.16em', textShadow: `0 0 8px ${ARC.neon2}66` }}>
              ⌬ B-SIDES — STILL IN THE WORKSHOP
            </div>
            <div style={{ ...px, fontSize: 9, color: ARC.dim, letterSpacing: '0.15em' }}>
              {workshopProjects.length} TRACKS · DEEP CATALOG
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {workshopProjects.map(p => (
              <DevKitRow key={p.id} project={p} selected={selectedId === p.id} onSelect={() => select(p.id)} />
            ))}
          </div>
          {loadedWorkshop && <DevKitInline project={loadedWorkshop} onClose={() => setSelectedId(null)} />}
        </div>

        {/* House power-ups */}
        <div style={{ marginTop: 64, padding: '28px 28px', ...panel }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
            <div style={{ ...px, fontSize: 13, color: ARC.neon3, letterSpacing: '0.16em', textShadow: `0 0 8px ${ARC.neon3}66` }}>★ HOUSE POWER-UPS ★</div>
            <div style={{ ...px, fontSize: 9, color: ARC.dim, letterSpacing: '0.15em' }}>5 RULES · PERMANENT</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {JX_MANIFESTO.map((m, i) => (
              <PowerUp key={i} text={m} index={i} />
            ))}
          </div>
        </div>

        {/* Footer credits */}
        <div
          style={{
            marginTop: 56,
            padding: '24px 0 0',
            borderTop: `2px solid ${ARC.neon2}55`,
            ...px,
            fontSize: 9,
            color: ARC.dim,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            letterSpacing: '0.15em',
          }}
        >
          <span>© 2024 — 2026 JYNAXX</span>
          <span style={{ color: ARC.neon3 }}>MADE IN CANADA</span>
          <span>
            GAME OVER? <span style={{ color: ARC.neon1, opacity: blink ? 1 : 0.2 }}>NEVER</span>
          </span>
        </div>
      </div>

      {coinOpen && (
        <CoinGameOverlay
          index={gameIndex}
          hiScore={hi.score}
          reduced={reduced}
          onAdvance={() => setGameIndex(i => (i + 1) % ARCADE_GAMES.length)}
          onScore={recordScore}
          onClose={() => setCoinOpen(false)}
        />
      )}
    </section>
  )
}
