import { NextRequest, NextResponse } from 'next/server'
import { verifyMcToken, createSession } from '@ai4u/mc-sso'

const SESSION_TTL_MS = 8 * 60 * 60 * 1000

const SERVICE_REDIRECTS: Record<string, string> = {
  'magdalena-proyeccion': '/proyeccion-financiera',
  'magdalena-advisor':    '/advisor',
  'magdalena':            '/dashboard', // legacy fallback
}

export async function POST(req: NextRequest) {
  const form   = await req.formData()
  const token  = String(form.get('token') ?? '')
  const secret = process.env.MISSION_CONTROL_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Configuración de servidor incompleta' }, { status: 500 })
  }

  let data = null
  let matchedServiceId: string | null = null

  for (const serviceId of Object.keys(SERVICE_REDIRECTS)) {
    const result = verifyMcToken(token, serviceId, secret)
    if (result) {
      data = result
      matchedServiceId = serviceId
      break
    }
  }

  if (!data || !matchedServiceId) {
    return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 })
  }

  const sessionToken = createSession(data.tenantId, secret, SESSION_TTL_MS)
  const destination  = SERVICE_REDIRECTS[matchedServiceId]
  const res = NextResponse.redirect(new URL(destination, req.url), 303)
  res.cookies.set('mc_session', sessionToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   8 * 60 * 60,
    path:     '/',
  })
  return res
}
