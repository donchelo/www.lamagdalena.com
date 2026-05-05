import { NextRequest, NextResponse } from 'next/server'
import { loadJob } from '@/lib/blob'
import { renderOnePagerPdf } from '@/lib/pdf/render'

interface Params {
  params: Promise<{ reportId: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { reportId } = await params
  
  try {
    const job = await loadJob(reportId)
    if (!job) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    // Cargar el análisis desde Vercel Blob
    const { list } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: `reports/${reportId}/analysis.json`, limit: 1 })
    
    if (blobs.length === 0) return NextResponse.json({ error: 'Analysis data not found' }, { status: 404 })

    const analysisRes = await fetch(blobs[0].url)
    const analysis = await analysisRes.json()

    const pdfBuffer = await renderOnePagerPdf({ job, analysis })

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="One-pager-LaMagdalena-${job.clientName.replace(/\s+/g, '-')}.pdf"`
      }
    })
  } catch (error) {
    console.error('One-pager generation error:', error)
    return NextResponse.json({ error: 'Error generating one-pager' }, { status: 500 })
  }
}
