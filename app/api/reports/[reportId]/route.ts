import { NextRequest, NextResponse } from 'next/server'
import { loadJob } from '@/lib/blob'

interface Params {
  params: Promise<{ reportId: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { reportId } = await params
  const job = await loadJob(reportId)
  if (!job) return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  return NextResponse.json(job)
}
