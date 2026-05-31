import { NextRequest, NextResponse } from 'next/server'

// Replicates mc-sso verifySession using Web Crypto API (Edge-compatible, no node: imports)
function b64urlToBytes(b64url: string): Uint8Array<ArrayBuffer> {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice(0, (4 - b64url.length % 4) % 4)
  return new Uint8Array(Array.from(atob(b64), c => c.charCodeAt(0)))
}

async function verifySession(token: string, secret: string): Promise<boolean> {
  if (!token || !secret) return false
  const dot = token.lastIndexOf('.')
  if (dot === -1) return false
  const payload = token.slice(0, dot)
  const sig     = token.slice(dot + 1)
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )
    const valid = await crypto.subtle.verify('HMAC', key, b64urlToBytes(sig), new TextEncoder().encode(payload))
    if (!valid) return false
    const data = JSON.parse(new TextDecoder().decode(b64urlToBytes(payload))) as { exp?: number }
    return typeof data.exp === 'number' && data.exp > Date.now()
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const token  = request.cookies.get('mc_session')?.value ?? ''
  const secret = process.env.MISSION_CONTROL_SECRET ?? ''

  if (!(await verifySession(token, secret))) {
    return new NextResponse(
      '<!doctype html><meta charset="utf-8"><p>Acceso denegado. Ingresa desde <a href="https://ai4u.com.co">Mission Control</a>.</p>',
      { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/social-listening/:path*',
    '/proyeccion-financiera/:path*',
    '/share-of-voice/:path*',
    '/advisor/:path*',
  ],
}
