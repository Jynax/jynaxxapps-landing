// GET/POST /api/arcade-plays — a vanity counter of how many people have
// discovered and played the hidden Arcade "insert coin" easter egg (Task #31,
// follow-on to #29).
//
// Deliberately PUBLIC and unauthenticated — like a page view-counter. There is
// no service token (unlike /api/live): the value carries zero sensitive
// information and the worst-case abuse is an inflated fun number. The frontend
// only POSTs once per browser (a localStorage gate) so the total approximates
// "unique people who found it", not raw play count. A determined actor could
// still inflate it; that trade-off is accepted for a playful easter-egg metric
// rather than over-engineering (no Durable Object / atomic counter needed).
//
// Reuses the existing CONTENT KV binding (one namespace, distinct key) — same
// pattern as functions/api/live.ts and functions/api/content.ts.

interface Env {
  CONTENT: KVNamespace
}

const PLAYS_KEY = 'arcade-plays'

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  })

function parseCount(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 0
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const count = parseCount(await context.env.CONTENT.get(PLAYS_KEY, 'text'))
  return json({ count }, 200, { 'Cache-Control': 'public, max-age=30' })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // Read-modify-write. KV has no atomic increment and is eventually
  // consistent, so concurrent posts can under-count slightly — acceptable for
  // a low-traffic vanity metric (see file header).
  const next = parseCount(await context.env.CONTENT.get(PLAYS_KEY, 'text')) + 1
  await context.env.CONTENT.put(PLAYS_KEY, String(next))
  return json({ count: next })
}
