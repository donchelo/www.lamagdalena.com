import { NextRequest, NextResponse } from 'next/server'
import { getRawData } from '@/lib/supabase'

interface Params {
  params: Promise<{ reportId: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { reportId } = await params
  const data = await getRawData(reportId)
  return NextResponse.json(data)
}
