import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { loadJob } from '@/lib/supabase'
import { buildOnePagerFilename } from '@/lib/report-filename'
import { renderOnePagerPdf } from '@/lib/pdf/render'

interface Params {
  params: Promise<{ reportId: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { reportId } = await params
  
  try {
    const job = await loadJob(reportId)
    if (!job) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    // Cargar el análisis desde Supabase
    const { loadAnalysis } = await import('@/lib/supabase')
    const analysis = await loadAnalysis(reportId)
    
    if (!analysis) return NextResponse.json({ error: 'Analysis data not found' }, { status: 404 })

    const pdfBuffer = await renderOnePagerPdf({ job, analysis })

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${buildOnePagerFilename({ clientName: job.clientName, dateFrom: job.dateFrom, dateTo: job.dateTo, networks: job.selectedNetworks })}"`
      }
    })
  } catch (error) {
    console.error('One-pager generation error:', error)
    return NextResponse.json({ error: 'Error generating one-pager' }, { status: 500 })
  }
}
