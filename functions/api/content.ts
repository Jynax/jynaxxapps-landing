import { timingSafeEqual, createHmac } from './_crypto'

interface Env {
  CONTENT: KVNamespace
  SESSION_SECRET: string
}

const CONTENT_KEY = 'site-content'

// 64 KB cap on PUT body (defense against oversized writes to KV).
const MAX_BODY_BYTES = 64 * 1024

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const stored = await context.env.CONTENT.get(CONTENT_KEY, 'text')

  if (!stored) {
    return new Response(JSON.stringify(null), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  }

  // Public GET 200: no Cache-Control was set previously; add no-store to avoid
  // admin content being cached in shared caches or CDN edge nodes.
  return new Response(stored, {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const authHeader = context.request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  }

  const token = authHeader.slice(7)
  const valid = await verifyToken(token, context.env.SESSION_SECRET)

  if (!valid) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  }

  // Check Content-Length header first (fast path).
  const contentLengthHeader = context.request.headers.get('Content-Length')
  if (contentLengthHeader !== null) {
    const declared = parseInt(contentLengthHeader, 10)
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
      return new Response(JSON.stringify({ error: 'Payload too large' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      })
    }
  }

  const body = await context.request.text()

  // Defense against missing or spoofed Content-Length: verify actual length.
  if (new TextEncoder().encode(body).length > MAX_BODY_BYTES) {
    return new Response(JSON.stringify({ error: 'Payload too large' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  }

  // Validate it's valid JSON
  try {
    JSON.parse(body)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  }

  await context.env.CONTENT.put(CONTENT_KEY, body)

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

async function verifyToken(token: string, secret: string): Promise<boolean> {
  // Token format: base64(timestamp:email:hmac)
  try {
    const decoded = atob(token)
    const parts = decoded.split(':')
    if (parts.length < 3) return false

    const signature = parts.pop()!
    const payload = parts.join(':') // timestamp:email
    const timestampStr = parts[0]
    const timestamp = parseInt(timestampStr, 10)

    // Tokens expire after 24 hours
    const now = Date.now()
    if (now - timestamp > 24 * 60 * 60 * 1000) return false

    const expected = await createHmac(payload, secret)
    return timingSafeEqual(signature, expected)
  } catch {
    return false
  }
}
