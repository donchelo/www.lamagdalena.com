import { NextResponse } from 'next/server'
import { listMonths } from '@/lib/proyeccion'

export const dynamic = 'force-dynamic'

export async function GET() {
  const months = listMonths()
  return NextResponse.json(months)
}
