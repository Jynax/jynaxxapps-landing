// GET/POST/DELETE /api/live — the "what Jynaxx is doing right now" feed.
//
// Task #30: capped rotating set (Decision 8.3 #3 single-entry DELIBERATELY
// REVERSED — see decisions.md + live-feed-evolution-spec-2026-05-17). Stored
// KV value at `live-now` is `{ entries: LiveFeedEntry[] }`, newest-first,
// cap 3, 24h TTL. All rules live in ./liveStore (pure, unit-tested). Reuses
// the existing CONTENT KV binding (one namespace, distinct key).
//
// publicSafe is defense-in-depth (spec §2): the server forces it true on
// insert and rejects any client-sent non-true. Writes use a static service
// token (LIVE_FEED_TOKEN) via the CF environment — never committed, never a
// shell arg, never in settings (memory `feedback_no_secrets_in_shell_args`).
import type { LiveFeedEntry, LiveFeedEnvelope } from '../../src/types/jx'
import { CAP, buildEntry, pruneAndCap, validatePayload } from './liveStore'

interface Env {
  CONTENT: KVNamespace
  LIVE_FEED_TOKEN: string
}

const LIVE_KEY = 'live-now'

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  })

async function readEntries(env: Env): Promise<LiveFeedEntry[]> {
  const stored = await env.CONTENT.get(LIVE_KEY, 'text')
  if (!stored) return []
  try {
    const parsed = JSON.parse(stored) as Partial<LiveFeedEnvelope>
    return Array.isArray(parsed?.entries) ? (parsed.entries as LiveFeedEntry[]) : []
  } catch {
    return [] // legacy single-entry value or corrupt → treated as empty
  }
}

async function writeEntries(env: Env, entries: LiveFeedEntry[]): Promise<void> {
  await env.CONTENT.put(LIVE_KEY, JSON.stringify({ entries } satisfies LiveFeedEnvelope))
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const raw = await readEntries(context.env)
  const live = pruneAndCap(raw, Date.now())

  // Persist the pruned set so stale entries don't linger in KV across reads.
  if (live.length !== raw.length) await writeEntries(context.env, live)

  // Empty/all-expired → 404 + null (preserves the hook's graceful-fallback
  // contract: any non-OK / non-JSON keeps the static JX_NOW line).
  if (live.length === 0) {
    return json(null, 404, { 'Cache-Control': 'public, max-age=15' })
  }

  return json({ entries: live } satisfies LiveFeedEnvelope, 200, {
    'Cache-Control': 'public, max-age=15',
  })
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

  const result = validatePayload(payload)
  if (!result.ok) return json({ error: result.error }, 400)

  const now = Date.now()
  const entry = buildEntry(result.value, now)
  const current = await readEntries(context.env)
  const next = pruneAndCap([entry, ...current], now) // prepend newest, then cap/TTL
  await writeEntries(context.env, next)

  return json({ ok: true, entry, count: next.length, cap: CAP })
}

// DELETE clears ALL entries, or one by `?id=<id>` (spec §6).
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const denied = requireServiceToken(context.request, context.env.LIVE_FEED_TOKEN)
  if (denied) return denied

  const id = new URL(context.request.url).searchParams.get('id')
  if (!id) {
    await context.env.CONTENT.delete(LIVE_KEY)
    return json({ ok: true, cleared: 'all' })
  }

  const current = await readEntries(context.env)
  const next = current.filter(e => e.id !== id)
  if (next.length === 0) {
    await context.env.CONTENT.delete(LIVE_KEY)
  } else {
    await writeEntries(context.env, next)
  }
  return json({ ok: true, cleared: id, count: next.length })
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

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const ab = enc.encode(a)
  const bb = enc.encode(b)
  if (ab.length !== bb.length) return false
  let diff = 0
  for (let i = 0; i < ab.length; i++) {
    diff |= ab[i] ^ bb[i]
  }
  return diff === 0
}
