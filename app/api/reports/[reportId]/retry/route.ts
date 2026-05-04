import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { loadJob, loadRawData, updateJobStatus, saveAnalysis, savePdf } from '@/lib/blob'
import { analyzeData } from '@/lib/claude'

interface Params {
  params: Promise<{ reportId: string }>
}

export async function POST(_request: NextRequest, { params }: Params) {
  const { reportId } = await params

  const job = await loadJob(reportId)
  if (!job) return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  if (job.status !== 'error') {
    return NextResponse.json({ error: 'Only jobs in error state can be retried' }, { status: 400 })
  }

  let rawData: unknown[]
  try {
    rawData = await loadRawData(reportId)
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return NextResponse.json({ error: 'No data available to retry — rescraping required' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'No data available to retry — rescraping required' }, { status: 400 })
  }

  const retryJob = await updateJobStatus(reportId, { status: 'analyzing', error: undefined })
  const capturedData = rawData

  after(async () => {
    try {
      const analysis = await analyzeData(capturedData, {
        clientName: retryJob.clientName,
        dateFrom: retryJob.dateFrom,
        dateTo: retryJob.dateTo,
        selectedNetworks: retryJob.selectedNetworks,
        keywords: retryJob.keywords,
        hashtags: retryJob.hashtags,
      })
      await saveAnalysis(reportId, analysis)
      await updateJobStatus(reportId, { status: 'generating_pdf' })

      const { renderReportPdf } = await import('@/lib/pdf/render')
      const pdfBuffer = await renderReportPdf({ job: retryJob, analysis })
      const pdfUrl = await savePdf(reportId, pdfBuffer)
      await updateJobStatus(reportId, { status: 'complete', pdfUrl })
    } catch (err: any) {
      await updateJobStatus(reportId, { status: 'error', error: err.message })
    }
  })

  return NextResponse.json({ ok: true })
}
