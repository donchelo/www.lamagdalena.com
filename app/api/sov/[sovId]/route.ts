import { NextRequest, NextResponse } from 'next/server'
import { getSovJob } from '@/lib/sov-supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sovId: string }> }
) {
  try {
    const { sovId } = await params
    const job = await getSovJob(sovId)
    if (!job) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
