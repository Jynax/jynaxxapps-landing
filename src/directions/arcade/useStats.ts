import { useEffect, useState } from 'react'
import type { StatsEnvelope } from '../../types/jx'

// Static fallback shown when /api/stats is unavailable (vite dev, fresh deploy,
// network error). Values are the last-known reasonable real numbers; clearly
// marked so reviewers know this is intentional graceful degradation.
const FALLBACK: StatsEnvelope = {
  generatedAt: '2026-05-19T00:00:00.000Z', // fallback — not a real snapshot
  since: 'FEB 2026',
  projects: 12,
  prsMerged: 400,
}

export function useStats(): StatsEnvelope {
  const [stats, setStats] = useState<StatsEnvelope | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/stats', { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) return // 404 (unset) / non-OK → keep fallback
        const data = (await res.json()) as Partial<StatsEnvelope>
        if (
          typeof data?.since === 'string' &&
          typeof data?.projects === 'number' &&
          typeof data?.prsMerged === 'number' &&
          typeof data?.generatedAt === 'string'
        ) {
          setStats(data as StatsEnvelope)
        }
      })
      .catch(() => {
        // Aborted / network error / HTML (vite dev) — keep static fallback.
      })
    return () => controller.abort()
  }, [])

  return stats ?? FALLBACK
}
