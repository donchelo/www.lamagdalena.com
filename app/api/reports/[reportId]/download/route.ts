import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { loadJob } from '@/lib/supabase'
import { buildReportFilename } from '@/lib/report-filename'

interface Params {
  params: Promise<{ reportId: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { reportId } = await params
  const job = await loadJob(reportId)

  if (!job || !job.pdfUrl) return NextResponse.json({ error: 'PDF file not found' }, { status: 404 })

  const response = await fetch(job.pdfUrl)

  const pdfBuffer = await response.arrayBuffer()

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${buildReportFilename({ clientName: job.clientName, dateFrom: job.dateFrom, dateTo: job.dateTo, networks: job.selectedNetworks })}"`
    }
  })
}
