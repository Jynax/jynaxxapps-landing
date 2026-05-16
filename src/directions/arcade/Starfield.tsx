import { useMemo } from 'react'
import { useReducedMotion } from '../parts/useReducedMotion'

// Deterministic starfield backdrop (reference `Starfield`). Each star twinkles
// via an SVG SMIL <animate>; SMIL ignores prefers-reduced-motion, so under
// reduced motion we render the stars static (no <animate> child = frozen at
// full opacity) — same gate pattern as the Console SMART pulse (#24).

interface Star {
  x: number
  y: number
  size: number
  twinkle: number
}

export function Starfield() {
  const reduced = useReducedMotion()
  const stars = useMemo<Star[]>(() => {
    const s: Star[] = []
    for (let i = 0; i < 80; i++) {
      s.push({
        x: (i * 137.5) % 100,
        y: (i * 73.3) % 100,
        size: i % 4 === 0 ? 2 : 1,
        twinkle: (i * 11) % 800,
      })
    }
    return s
  }, [])

  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {stars.map((s, i) => (
        <rect
          key={i}
          x={s.x}
          y={s.y}
          width={s.size * 0.18}
          height={s.size * 0.18}
          fill="#fff"
          opacity={reduced ? 0.7 : undefined}
        >
          {!reduced && (
            <animate
              attributeName="opacity"
              values="0.2;1;0.2"
              dur={`${2 + s.twinkle / 300}s`}
              repeatCount="indefinite"
            />
          )}
        </rect>
      ))}
    </svg>
  )
}
