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
//  • The live strip consumes the `useLiveFeed` contract; Task #30 evolved the
//    feed to a capped rotating set (Decision 8.3 #3 reversed) — the widget
//    renders the current rotating entry; no structural change here.
//  • Named bio retained ("michael chartrand", maker voice — Decision 8.2).
//
// Motion: JS blink cues freeze via useBlink; SVG SMIL freezes via the
// `reduced` gate (#24 pattern). CSS transitions/animations are covered by the
// global tokens.css reduced-motion rule.

import { useState, Fragment } from 'react'
import { JX_PROJECTS, JX_MANIFESTO } from '../data/jxData'
import { useBlink } from './parts/useBlink'
import { useReducedMotion } from './parts/useReducedMotion'
import { useLiveFeed } from './parts/useLiveFeed'
import { useMediaQuery } from './parts/useMediaQuery'
import { ARC, CART_ACCENTS, accentAt, fmt } from './arcade/tokens'
import { Starfield } from './arcade/Starfield'
import { PlayerSprite } from './arcade/PlayerSprite'
import { Cartridge } from './arcade/Cartridge'
import { CartDossier } from './arcade/CartDossier'
import { DevKitRow, DevKitInline } from './arcade/DevKit'
import { PowerUp } from './arcade/PowerUp'
import { ArcadeLiveStrip, ArcadeScoreboard } from './arcade/ArcadeLiveStrip'
import { CoinGameOverlay } from './arcade/coingame/CoinGameOverlay'
import { ARCADE_GAMES } from './arcade/coingame/games'
import { JynaxxAppsLockup, JynaxxWordmark } from '../components/brand/ArcadeWordmark'

const px   = { fontFamily: 'var(--font-pixel)' }
const mono = { fontFamily: 'var(--font-mono)' }
const sans = { fontFamily: 'var(--font-sans)' }

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
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [selectedId, setSelectedId] = useState<string | null>('cyberdeck')
  const select = (id: string) => setSelectedId(prev => (prev === id ? null : id))
  const [coinOpen, setCoinOpen] = useState(false)
  const [insertActive, setInsertActive] = useState(false)
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
  // Accent colour of the currently-selected public cartridge tile (Task #38).
  // Passed to CartDossier so its border/glow matches the loaded cart exactly.
  const selectedPublicIdx = publicProjects.findIndex(p => p.id === selectedId)
  const cartAccent = selectedPublicIdx >= 0 ? accentAt(CART_ACCENTS, selectedPublicIdx) : undefined

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

      {/* Piece 1: content wrapper padding — mobile tightened, desktop unchanged */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: isDesktop
            ? '36px 56px 80px'
            : `24px 16px calc(96px + env(safe-area-inset-bottom))`,
        }}
      >
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

        {/* Piece 7: prop rename coin → coinBlink + new gameOpen prop */}
        {/* Live feed — collapsable row directly under the HUD */}
        <ArcadeLiveStrip feed={feed} blink={blink} coinBlink={coin} gameOpen={coinOpen} reduced={reduced} />

        {/* Piece 2: Big title — type sizes mobile-branched */}
        <div style={{ textAlign: 'center', marginTop: 28, position: 'relative' }}>
          {/* ★ PRESS START TO BUILD ★ — 18px on mobile (within 18–22px band), 11px on desktop */}
          <div
            style={{
              ...px,
              fontSize: isDesktop ? 11 : 18,
              letterSpacing: '0.4em',
              color: ARC.neon2,
              marginBottom: 12,
              textShadow: `0 0 8px ${ARC.neon2}99`,
              textWrap: 'balance',
            }}
          >
            ★ PRESS START TO BUILD ★
          </div>
          {/* Round-7 wordmark — replaces the Press Start 2P pixel slab (design-spec.md § 3) */}
          <h1 style={{ margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
            <JynaxxAppsLockup size={isDesktop ? 64 : 36} glow />
          </h1>
          {isDesktop ? (
            <div style={{ ...mono, fontSize: 22, marginTop: 12, color: ARC.ink, opacity: 0.9 }}>
              ━━━━━━ a workshop for digital machines ━━━━━━
            </div>
          ) : (
            <div style={{ ...mono, fontSize: 16, marginTop: 12, color: ARC.ink, opacity: 0.9, textAlign: 'center' }}>
              a workshop for digital machines
            </div>
          )}
          {/* Piece 3: INSERT COIN trigger — full-width 64px on mobile with yellow border */}
          <button
            type="button"
            data-arcade-insert-coin
            onClick={() => setCoinOpen(true)}
            onPointerDown={() => { if (!isDesktop) setInsertActive(true) }}
            onPointerUp={() => setInsertActive(false)}
            onPointerLeave={() => setInsertActive(false)}
            aria-label="Insert coin — play a hidden mini-game"
            style={{
              ...px,
              fontSize: isDesktop ? 9 : 18,
              color: ARC.neon3,
              marginTop: 16,
              opacity: isDesktop ? (coin ? 1 : 0.2) : 1,
              letterSpacing: '0.2em',
              background: !isDesktop && insertActive ? '#FFE63622' : 'transparent',
              border: isDesktop ? 'none' : `2px solid ${ARC.neon3}`,
              padding: isDesktop ? 4 : '14px 32px',
              cursor: 'pointer',
              width: isDesktop ? undefined : 'auto',
              minWidth: isDesktop ? undefined : 220,
              height: isDesktop ? undefined : 'auto',
              display: isDesktop ? undefined : 'inline-flex',
              alignItems: isDesktop ? undefined : 'center',
              justifyContent: isDesktop ? undefined : 'center',
            }}
          >
            ◇ INSERT COIN ◇
          </button>
        </div>

        {/* Piece 5: Mobile scoreboard mount-point — standalone between INSERT COIN and cart grid */}
        {/* TODO(#74): replace ArcadeScoreboard body with real implementation */}
        {!isDesktop && <ArcadeScoreboard />}

        {/* About strip — player profile */}
        <div style={{ marginTop: 64, padding: 28, ...panel }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
            <div style={{ ...px, fontSize: 13, color: ARC.neon3, letterSpacing: '0.16em', textShadow: `0 0 8px ${ARC.neon3}66` }}>▸ PLAYER PROFILE</div>
            <div style={{ ...px, fontSize: 9, color: ARC.dim, letterSpacing: '0.15em' }}>CLASS · MAKER · LV. 04</div>
          </div>
          {/* Piece 6: PlayerSprite section grid — single-column on mobile; drop borderLeft on stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? '90px 1fr 180px' : '1fr',
              gap: isDesktop ? 24 : 12,
              alignItems: 'center',
            }}
          >
            <PlayerSprite />
            <div>
              <p style={{ ...sans, fontSize: 18, lineHeight: 1.5, margin: 0, color: ARC.ink }}>
                JYNAXX is the curious, mischievous half of <span style={{ color: ARC.neon3 }}>michael chartrand</span>. likes building,
                breaking, and seeing what&apos;s possible. dislikes todo apps without opinions.
              </p>
            </div>
            <div
              style={{
                borderLeft: isDesktop ? `2px solid ${ARC.neon2}55` : undefined,
                borderTop: isDesktop ? undefined : `2px solid ${ARC.neon2}55`,
                paddingLeft: isDesktop ? 22 : undefined,
                paddingTop: isDesktop ? undefined : 12,
                ...px,
                fontSize: 9,
                color: ARC.dim,
                lineHeight: 2.1,
              }}
            >
              <div>HP &nbsp;<span style={{ color: ARC.neon4 }}>∞ COFFEE</span></div>
              <div>WPN &nbsp;<span style={{ color: ARC.neon1 }}>CURIOSITY</span></div>
              <div>BUDDY &nbsp;<span style={{ color: ARC.neon2 }}>CLAUDE</span></div>
            </div>
          </div>
        </div>

        {/* SELECT YOUR CARTRIDGE — screen above, carts below */}
        <div style={{ marginTop: 40 }}>
          {/* Desktop: always-visible "screen" above grid. Mobile: hidden — dossier renders inline below tapped cart (Task #82). */}
          {isDesktop && <CartDossier project={loadedPublic} accent={cartAccent} onClose={() => setSelectedId(null)} />}

          {/* Piece 2: section label — 14px desktop, 11px mobile */}
          <div
            style={{
              ...px,
              fontSize: isDesktop ? 14 : 11,
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
          {/* Piece 4: cart grid — repeat(6,1fr) on desktop, 1fr on mobile; gap 10→14 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? 'repeat(6, 1fr)' : '1fr',
              gap: isDesktop ? 10 : 14,
            }}
          >
            {publicProjects.map((p, i) => (
              <Fragment key={p.id}>
                <Cartridge
                  project={p}
                  accent={accentAt(CART_ACCENTS, i)}
                  selected={selectedId === p.id}
                  onSelect={() => select(p.id)}
                />
                {/* Mobile inline dossier — expands directly below tapped cart (Task #82) */}
                {!isDesktop && selectedId === p.id && (
                  <CartDossier
                    project={p}
                    accent={accentAt(CART_ACCENTS, i)}
                    onClose={() => setSelectedId(null)}
                  />
                )}
              </Fragment>
            ))}
          </div>
          {/* Piece 4: footer hint — 9px desktop, 10px mobile (pixel font) */}
          <div
            style={{
              ...px,
              fontSize: isDesktop ? 9 : 10,
              textAlign: 'center',
              marginTop: 14,
              color: ARC.dim,
              letterSpacing: '0.15em',
            }}
          >
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
          {/* Piece 6: DevKit grid — repeat(2,1fr) on desktop, 1fr on mobile */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
              gap: isDesktop ? 14 : 12,
            }}
          >
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
          {/* Piece 6: PowerUp grid — repeat(5,1fr) on desktop, 1fr on mobile */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? 'repeat(5, 1fr)' : '1fr',
              gap: isDesktop ? 16 : 12,
            }}
          >
            {JX_MANIFESTO.map((m, i) => (
              <PowerUp key={i} text={m} index={i} />
            ))}
          </div>
        </div>

        {/* Standard footer (design-spec.md § 7) */}
        <div
          style={{
            marginTop: 56,
            padding: '32px 0 16px',
            borderTop: `2px solid ${ARC.neon2}55`,
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <JynaxxWordmark size={18} glow={false} />
          </div>
          <div style={{ ...mono, fontSize: 13, color: ARC.dim, lineHeight: 2.2, marginBottom: 16 }}>
            <div>jynaxx@gmail.com</div>
            <div>github.com/Jynax</div>
            <div>@mrchartrand.bsky.social</div>
          </div>
          <div style={{ ...mono, fontSize: 12, color: ARC.dim, lineHeight: 2 }}>
            <div>{'© 2024–2026 jynaxx · all rights reversed'}</div>
            <div>{'built with claude · cursor · curiosity'}</div>
            <div>made in canada</div>
          </div>
          <div style={{ ...px, fontSize: 9, color: ARC.neon1, marginTop: 16, letterSpacing: '0.15em', opacity: blink ? 1 : 0.2 }}>
            GAME OVER? NEVER
          </div>
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
