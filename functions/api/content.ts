interface Env {
  CONTENT: KVNamespace
  SESSION_SECRET: string
}

const CONTENT_KEY = 'site-content'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const stored = await context.env.CONTENT.get(CONTENT_KEY, 'text')

  if (!stored) {
    return new Response(JSON.stringify(null), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(stored, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const authHeader = context.request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const token = authHeader.slice(7)
  const valid = await verifyToken(token, context.env.SESSION_SECRET)

  if (!valid) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await context.request.text()

  // Validate it's valid JSON
  try {
    JSON.parse(body)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  await context.env.CONTENT.put(CONTENT_KEY, body)

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
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

async function createHmac(data: string, key: string): Promise<string> {
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
