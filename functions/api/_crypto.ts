// Shared crypto helpers for functions/api/* handlers.
//
// Underscore prefix (_crypto.ts) prevents Cloudflare Pages from treating this
// file as a route. CF Pages maps files in functions/ to URL paths by filename;
// the underscore convention (documented at
// https://developers.cloudflare.com/pages/functions/routing/#functions-invocation-routes)
// means files whose names begin with _ are excluded from route generation.
// Only auth.ts, content.ts, live.ts, stats.ts, arcade-plays.ts become routes.
// liveStore.ts and statsStore.ts also have no `onRequest*` export and would
// not be invoked as routes anyway, but they lack the leading underscore.

/**
 * Timing-safe string comparison — prevents timing side-channel attacks.
 *
 * Length-leak fix: rather than early-returning false when lengths differ,
 * the loop runs over the longer array (indexing the shorter as 0 for
 * out-of-range positions) so the runtime does not reveal which candidate
 * is longer.  The final check requires *both* diff === 0 AND equal lengths,
 * so mismatched lengths still return false without short-circuiting.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const ab = enc.encode(a)
  const bb = enc.encode(b)
  const len = Math.max(ab.length, bb.length)
  let diff = 0
  for (let i = 0; i < len; i++) {
    diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0)
  }
  return diff === 0 && ab.length === bb.length
}

/**
 * HMAC-SHA-256 over `data` with `key`, returning lowercase hex (64 chars).
 */
export async function createHmac(data: string, key: string): Promise<string> {
  const encoder = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data))
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
