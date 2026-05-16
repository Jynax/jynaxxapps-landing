// GET/POST/DELETE /api/live — the "what Jynaxx is doing right now" feed.
//
// Single current entry (Decision 8.3 #3, S153) — the api-contracts.md open
// question was settled in favour of one entry, not a rotating queue, so the
// stored value is a bare { activity, project, since, updated } object with no
// entries[] wrapper. Reuses the existing CONTENT KV binding (one namespace,
// distinct key) — same pattern as functions/api/content.ts.
//
// Writes are NOT gated by the interactive Google OAuth used for /admin
// content edits: the only writer is Claude Code posting headlessly during the
// Stage-1 session-start ritual, so POST/DELETE use a static service token
// (LIVE_FEED_TOKEN) supplied via the CF environment. The token is sourced
// out-of-band from the credential store and is never committed, never placed
// in a shell argument, and never written to settings — see the session-start
// skill's Stage-1 step and memory `feedback_no_secrets_in_shell_args`.

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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const stored = await context.env.CONTENT.get(LIVE_KEY, 'text')

  // Mirror content.ts: absent → 404 + null. The frontend hook treats any
  // non-OK / non-JSON response as "keep the static JX_NOW fallback", so a
  // fresh deploy with no entry yet degrades gracefully.
  if (!stored) {
    return json(null, 404, { 'Cache-Control': 'public, max-age=15' })
  }

  return new Response(stored, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=15',
    },
  })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const denied = requireServiceToken(context.request, context.env.LIVE_FEED_TOKEN)
  if (denied) return denied

  let payload: { activity?: unknown; project?: unknown; since?: unknown }
  try {
    payload = (await context.request.json()) as typeof payload
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const activity = typeof payload.activity === 'string' ? payload.activity.trim() : ''
  if (!activity) {
    return json({ error: 'activity is required' }, 400)
  }

  const entry = {
    activity,
    project: typeof payload.project === 'string' && payload.project ? payload.project : null,
    since: typeof payload.since === 'string' && payload.since ? payload.since : 'today',
    updated: new Date().toISOString(), // server-stamped; client never sends this
  }

  await context.env.CONTENT.put(LIVE_KEY, JSON.stringify(entry))

  return json({ ok: true, entry })
}

// Minimal DELETE — single-entry model makes pruning largely moot (writes
// overwrite), but clearing the current activity is occasionally useful.
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const denied = requireServiceToken(context.request, context.env.LIVE_FEED_TOKEN)
  if (denied) return denied

  await context.env.CONTENT.delete(LIVE_KEY)
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

// Constant-time string comparison — avoids leaking the token length-by-length
// via response timing. Compares a fixed number of bytes regardless of input.
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
