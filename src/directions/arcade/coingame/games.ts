// Arcade easter-egg game registry (Task #29). The "insert coin" overlay
// rotates through this list — each press advances to the next entry. Adding a
// game later is a one-line registration here plus its component; the rotation
// shell (CoinGameOverlay) needs no changes.

import type { ComponentType } from 'react'
import { CoinCatch } from './CoinCatch'

export interface ArcadeGameProps {
  reduced: boolean
  onGameOver: (score: number) => void
}

export interface ArcadeGame {
  id: string
  label: string
  /** One-line how-to shown on the attract screen. */
  blurb: string
  Component: ComponentType<ArcadeGameProps>
}

export const ARCADE_GAMES: ArcadeGame[] = [
  {
    id: 'coin-catch',
    label: 'COIN CATCH',
    blurb: '◀ ▶ or A / D to move · catch the coins · 15 seconds on the clock',
    Component: CoinCatch,
  },
]
