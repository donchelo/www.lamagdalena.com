import { NextRequest, NextResponse } from 'next/server'
import { loadJob, updateJobStatus, saveRawData, saveAnalysis, savePdf } from '@/lib/blob'
import { fetchDatasetItems } from '@/lib/apify'
import { analyzeData } from '@/lib/claude'

interface Params {
  params: Promise<{ reportId: string }>
}

export async function POST(request: NextRequest, { params }: Params) {
  const { reportId } = await params

  let body: { eventType?: string; resource?: { defaultDatasetId?: string }; eventData?: { status?: string } }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const job = await loadJob(reportId)
  if (!job) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  const datasetId = body.resource?.defaultDatasetId
  const eventType = body.eventType ?? ''

  if (eventType.includes('FAILED') || body.eventData?.status === 'FAILED') {
    await updateJobStatus(reportId, { status: 'error', error: 'Apify actor run failed' })
    return NextResponse.json({ ok: true })
  }

  if (!datasetId) return NextResponse.json({ ok: true })

  // Check if all expected networks have completed — collect data and proceed
  try {
    const items = await fetchDatasetItems(datasetId)
    const existing = (job as { rawData?: unknown[] }).rawData ?? []
    const combined = [...existing, ...items]
    await saveRawData(reportId, combined)

    // LÓGICA DE ETAPAS PARA TIKTOK (Identificación por ID de Proceso)
    const tiktokProfileRunId = job.apifyRunIds?.['tiktok'] || job.apifyRunIds?.['tiktok_profiles']
    const incomingRunId = body.resource?.id
    
    const isTikTokStage1Finished = job.selectedNetworks.includes('tiktok') && 
                                   (incomingRunId === tiktokProfileRunId || incomingRunId === 'simulated-run-id') &&
                                   !job.apifyRunIds?.['tiktok_comments']

    if (isTikTokStage1Finished) {
      console.log(`[Webhook] TikTok Stage 1 (Profile) finished. Extracting videos for Stage 2...`)
      
      // Intentar extraer URLs de cualquier campo posible
      const videoUrls = items
        .map((item: any) => item.url || item.videoUrl || item.webVideoUrl || item.link || item.postUrl)
        .filter(Boolean)
        .filter((url: string) => url.includes('tiktok.com'))

      if (videoUrls.length > 0) {
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
        
        const webhookUrl = `${baseUrl}/api/reports/${reportId}/apify-webhook`
        const { startTikTokCommentsRun } = await import('@/lib/apify')
        
        try {
          const commentRunId = await startTikTokCommentsRun(videoUrls, webhookUrl)
          const apifyRunIds = { ...job.apifyRunIds, tiktok_comments: commentRunId }
          await updateJobStatus(reportId, { status: 'scraping_comments', apifyRunIds })
          return NextResponse.json({ ok: true })
        } catch (err) {
          console.error(`[Webhook] Error starting Stage 2:`, err)
          // Si falla iniciar comentarios, al menos intentamos seguir con lo que tenemos
        }
      }
    }

    // Si llegamos aquí, o no es TikTok o ya terminaron todas las etapas
    const completedNetworks = Object.keys(job.apifyRunIds ?? {}).length
    const networksNeeded = job.selectedNetworks.length
    
    // Si es TikTok, necesitamos que hayan terminado ambas etapas (posts y comentarios)
    const isTikTokComplete = job.selectedNetworks.includes('tiktok') && combined.some((item: any) => item.commentText)
    const isOtherComplete = !job.selectedNetworks.includes('tiktok') && completedNetworks >= networksNeeded

    if (!isTikTokComplete && !isOtherComplete) {
      await updateJobStatus(reportId, { status: 'scraping' })
      return NextResponse.json({ ok: true })
    }

    // All data collected — analyze
    await updateJobStatus(reportId, { status: 'analyzing' })

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

    // Generate PDF
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
