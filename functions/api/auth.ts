interface Env {
  ADMIN_PASSWORD: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let password: string

  try {
    const body = (await context.request.json()) as { password?: string }
    password = body.password ?? ''
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!password || password !== context.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Invalid password' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Generate a token: base64(timestamp:hmac(timestamp, password))
  const timestamp = Date.now().toString()
  const signature = await createHmac(timestamp, context.env.ADMIN_PASSWORD)
  const token = btoa(`${timestamp}:${signature}`)

  return new Response(JSON.stringify({ token }), {
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
