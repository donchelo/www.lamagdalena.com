import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { computeSummary, listMonths } from '@/lib/proyeccion'

/**
 * Pulse financiero para Mission Control (tenant La Magdalena, sin SAP).
 *
 * Canal server-to-server: Mission Control llama con el header `x-mc-secret`
 * (= MISSION_CONTROL_SECRET, compartido). Devuelve el FinancialSummary de
 * computeSummary() + meta. No usa la cookie mc_session (este endpoint no lo
 * consume un navegador, sino el server de MC).
 *
 * El matcher de middleware.ts NO cubre /api/pulse-finance, así que la única
 * protección es el secreto validado aquí.
 */

export const dynamic = 'force-dynamic'

/** Comparación constant-time de strings (evita timing attacks sobre el secreto). */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

/** "1.ENERO 2026" → "ENERO 2026" (etiqueta legible de período). */
function cleanMonth(m: string): string {
  return m.replace(/^[\d.]+\s*/, '').trim()
}

export async function GET(req: NextRequest) {
  const secret = process.env.MISSION_CONTROL_SECRET
  const provided = req.headers.get('x-mc-secret') ?? ''

  if (!secret || !provided || !safeEqual(provided, secret)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Meses: por defecto todos los disponibles; ?months=A,B acota.
  const monthsParam = req.nextUrl.searchParams.get('months')
  const allMonths = listMonths().map((m) => m.name)
  const months = monthsParam
    ? monthsParam.split(',').map((s) => s.trim()).filter(Boolean)
    : allMonths

  const summary = computeSummary(months)

  const used = summary.months.length ? summary.months : months
  const periodFrom = used.length ? cleanMonth(used[0]) : ''
  const periodTo = used.length ? cleanMonth(used[used.length - 1]) : ''

  return NextResponse.json({
    ...summary,
    meta: {
      generatedAt: new Date().toISOString(),
      periodFrom,
      periodTo,
    },
  })
}
