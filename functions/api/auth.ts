import { createHmac } from './_crypto'

interface Env {
  GOOGLE_CLIENT_ID: string
  ADMIN_EMAILS: string
  SESSION_SECRET: string
}

interface GoogleTokenInfo {
  email: string
  email_verified: string
  aud: string
  sub: string
  iss: string
  exp: string
  error_description?: string
}

// All auth responses must not be cached (tokens, errors alike).
const NO_STORE = { 'Cache-Control': 'no-store' }

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...NO_STORE, ...extra },
  })

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let credential: string

  try {
    const body = (await context.request.json()) as { credential?: string }
    credential = body.credential ?? ''
  } catch {
    return json({ error: 'Invalid request body' }, 400)
  }

  if (!credential) {
    return json({ error: 'Missing credential' }, 400)
  }

  // Verify the Google ID token via Google's tokeninfo endpoint
  const verifyRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  )

  if (!verifyRes.ok) {
    return json({ error: 'Invalid Google token' }, 401)
  }

  const tokenInfo = (await verifyRes.json()) as GoogleTokenInfo

  // Verify audience matches our client ID
  if (tokenInfo.aud !== context.env.GOOGLE_CLIENT_ID) {
    return json({ error: 'Token audience mismatch' }, 401)
  }

  // Verify issuer is accounts.google.com (short or full URL form)
  const validIssuers = ['accounts.google.com', 'https://accounts.google.com']
  if (!validIssuers.includes(tokenInfo.iss)) {
    return json({ error: 'Invalid token issuer' }, 401)
  }

  // Verify email is verified and in the allowed list
  const allowedEmails = context.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
  const email = tokenInfo.email?.toLowerCase()

  if (tokenInfo.email_verified !== 'true' || !allowedEmails.includes(email)) {
    return json({ error: 'Unauthorized account' }, 403)
  }

  // Issue a session token: base64(timestamp:email:hmac(timestamp:email, secret))
  const timestamp = Date.now().toString()
  const payload = `${timestamp}:${email}`
  const signature = await createHmac(payload, context.env.SESSION_SECRET)
  const token = btoa(`${payload}:${signature}`)

  return json({ token, email })
}
