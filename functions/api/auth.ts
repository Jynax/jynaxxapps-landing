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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let credential: string

  try {
    const body = (await context.request.json()) as { credential?: string }
    credential = body.credential ?? ''
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!credential) {
    return new Response(JSON.stringify({ error: 'Missing credential' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Verify the Google ID token via Google's tokeninfo endpoint
  const verifyRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  )

  if (!verifyRes.ok) {
    return new Response(JSON.stringify({ error: 'Invalid Google token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const tokenInfo = (await verifyRes.json()) as GoogleTokenInfo

  // Verify audience matches our client ID
  if (tokenInfo.aud !== context.env.GOOGLE_CLIENT_ID) {
    return new Response(JSON.stringify({ error: 'Token audience mismatch' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Verify email is verified and in the allowed list
  const allowedEmails = context.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
  const email = tokenInfo.email?.toLowerCase()

  if (tokenInfo.email_verified !== 'true' || !allowedEmails.includes(email)) {
    return new Response(JSON.stringify({ error: 'Unauthorized account' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Issue a session token: base64(timestamp:email:hmac(timestamp:email, secret))
  const timestamp = Date.now().toString()
  const payload = `${timestamp}:${email}`
  const signature = await createHmac(payload, context.env.SESSION_SECRET)
  const token = btoa(`${payload}:${signature}`)

  return new Response(JSON.stringify({ token, email }), {
    headers: { 'Content-Type': 'application/json' },
  })
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
