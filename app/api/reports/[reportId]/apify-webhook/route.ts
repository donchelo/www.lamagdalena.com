import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { loadJob, updateJobStatus, saveRawData, saveAnalysis, savePdf, getRawData } from '@/lib/blob'
import { fetchDatasetItems } from '@/lib/apify'
import { analyzeData } from '@/lib/claude'

interface Params {
  params: Promise<{ reportId: string }>
}

export async function POST(request: NextRequest, { params }: Params) {
  const { reportId } = await params

  let body: { eventType?: string; resource?: { id?: string; defaultDatasetId?: string }; eventData?: { status?: string } }
  try {
    body = await request.json()
    await put(`reports/${reportId}/webhook-last-log.json`, JSON.stringify({
      timestamp: new Date().toISOString(),
      body,
      headers: Object.fromEntries(request.headers.entries())
    }), { access: 'public', addRandomSuffix: false, contentType: 'application/json' })
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const job = await loadJob(reportId)
  if (!job) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  const datasetId = body.resource?.defaultDatasetId
  const incomingRunId = body.resource?.id
  const eventType = body.eventType ?? ''

  if (eventType.includes('FAILED') || body.eventData?.status === 'FAILED') {
    await updateJobStatus(reportId, { status: 'error', error: 'Apify actor run failed' })
    return NextResponse.json({ ok: true })
  }

  if (!datasetId) return NextResponse.json({ ok: true })

  try {
    const items = await fetchDatasetItems(datasetId)
    const existing = await getRawData(reportId)
    const combined = [...existing, ...items]
    await saveRawData(reportId, combined)

    // Registrar este run como completado
    const apifyCompletedRuns = [
      ...(job.apifyCompletedRuns ?? []),
      ...(incomingRunId ? [incomingRunId] : []),
    ]

    const isTikTok = job.selectedNetworks.includes('tiktok')
    const hasComments = !!job.apifyRunIds?.['tiktok_comments']
    const isStage1 = job.status === 'scraping_posts' || job.status === 'scraping'

    // TikTok Stage 1: posts terminaron, lanzar comentarios
    if (isTikTok && isStage1 && !hasComments) {
      console.log(`[Webhook] TikTok Stage 1 finished for ${reportId}. Starting Stage 2...`)

      const videoUrls = items
        .map((item: any) => item.url || item.videoUrl || item.webVideoUrl || item.link || item.postUrl || item.shareUrl)
        .filter(Boolean)
        .filter((url: string) => url.includes('tiktok.com'))
        .slice(0, 500)

      if (videoUrls.length > 0) {
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

        const webhookUrl = `${baseUrl}/api/reports/${reportId}/apify-webhook`
        const { startTikTokCommentsRun } = await import('@/lib/apify')

        try {
          const commentRunId = await startTikTokCommentsRun(videoUrls, webhookUrl)
          const apifyRunIds = { ...job.apifyRunIds, tiktok_comments: commentRunId }
          await updateJobStatus(reportId, { status: 'scraping_comments', apifyRunIds, apifyCompletedRuns })
          return NextResponse.json({ ok: true, message: 'Stage 2 started' })
        } catch (err) {
          console.error(`[Webhook] Error starting Stage 2:`, err)
          // Fall through to analysis without comments
        }
      } else {
        console.warn(`[Webhook] No TikTok video URLs found for ${reportId}. Proceeding to analysis.`)
      }
    }

    // Verificar si todos los runs registrados han completado
    const allExpectedRuns = Object.values(job.apifyRunIds ?? {})
    const allDone = allExpectedRuns.length > 0 &&
      allExpectedRuns.every(id => apifyCompletedRuns.includes(id))

    if (!allDone) {
      await updateJobStatus(reportId, { apifyCompletedRuns })
      return NextResponse.json({ ok: true })
    }

    // Todos los datos recolectados — analizar
    await updateJobStatus(reportId, { status: 'analyzing', apifyCompletedRuns })

    const analysis = await analyzeData(combined as unknown[], {
      clientName: job.clientName,
      dateFrom: job.dateFrom,
      dateTo: job.dateTo,
      selectedNetworks: job.selectedNetworks,
      keywords: job.keywords,
      hashtags: job.hashtags,
    })

    await saveAnalysis(reportId, analysis)
    await updateJobStatus(reportId, { status: 'generating_pdf' })

    const { renderReportPdf } = await import('@/lib/pdf/render')
    const pdfBuffer = await renderReportPdf({ job, analysis })
    const pdfUrl = await savePdf(reportId, pdfBuffer)

    await updateJobStatus(reportId, { status: 'complete', pdfUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Pipeline error'
    console.error(`[report ${reportId}] pipeline error:`, message)
    await updateJobStatus(reportId, { status: 'error', error: message })
  }

  return NextResponse.json({ ok: true })
}
