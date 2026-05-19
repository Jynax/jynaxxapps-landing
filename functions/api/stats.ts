// GET/POST/DELETE /api/stats — real scoreboard numbers for the Arcade panel.
//
// Task #36 WS2: replaces the fabricated SESSIONS/LINES/COMMITS panel with
// honestly-sourced data (SINCE / PROJECTS / PRS MERGED). Stored at KV key
// `stats-now`; populated by scripts/post-stats.mjs via the EOD routine.
//
// Faithful clone of functions/api/live.ts — same empty contract (404+null),
// same cache header, same token guard, same timingSafeEqual helper. Reuses the
// CONTENT KV binding and the existing LIVE_FEED_TOKEN env var.
import type { StatsEnvelope } from '../../src/types/jx'
import { validatePayload, buildEnvelope } from './statsStore'

interface Env {
  CONTENT: KVNamespace
  LIVE_FEED_TOKEN: string
}

const STATS_KEY = 'stats-now'

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  })

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const stored = await context.env.CONTENT.get(STATS_KEY, 'text')

  if (!stored) {
    return json(null, 404, { 'Cache-Control': 'public, max-age=15' })
  }

  let envelope: StatsEnvelope | null = null
  try {
    envelope = JSON.parse(stored) as StatsEnvelope
  } catch {
    // Corrupt value — treat as empty
    return json(null, 404, { 'Cache-Control': 'public, max-age=15' })
  }

  return json(envelope, 200, { 'Cache-Control': 'public, max-age=15' })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const denied = requireServiceToken(context.request, context.env.LIVE_FEED_TOKEN)
  if (denied) return denied

  let payload: unknown
  try {
    payload = await context.request.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  if (!validatePayload(payload)) {
    return json({ error: 'Invalid payload' }, 400)
  }

  const envelope = buildEnvelope(payload)
  await context.env.CONTENT.put(STATS_KEY, JSON.stringify(envelope))

  return json({ ok: true })
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const denied = requireServiceToken(context.request, context.env.LIVE_FEED_TOKEN)
  if (denied) return denied

  await context.env.CONTENT.delete(STATS_KEY)
  return json({ ok: true })
}

function requireServiceToken(request: Request, expected: string): Response | null {
  const header = request.headers.get('Authorization')
  if (!header || !header.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized' }, 401)
  }
  const presented = header.slice(7)
  if (!expected || !timingSafeEqual(presented, expected)) {
    return json({ error: 'Invalid token' }, 403)
  }
  return null
}

// Constant-time string comparison — mirrors live.ts exactly.
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const ab = enc.encode(a)
  const bb = enc.encode(b)
  let diff = ab.length ^ bb.length
  for (let i = 0; i < ab.length; i++) {
    diff |= ab[i] ^ (bb[i] ?? 0)
  }
  return diff === 0
}
