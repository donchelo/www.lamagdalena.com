import { NextRequest, NextResponse, after } from 'next/server'
import { put } from '@vercel/blob'
import { loadJob, updateJobStatus, saveRawData, saveAnalysis, savePdf, getRawData } from '@/lib/blob'
import { fetchDatasetItems } from '@/lib/apify'
import { analyzeData } from '@/lib/claude'

interface Params {
  params: Promise<{ reportId: string }>
}

function getBaseUrl() {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
}

export async function POST(request: NextRequest, { params }: Params) {
  const { reportId } = await params

  // Fix 1: Verificar secret para evitar webhooks externos no autorizados
  const secret = request.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.APIFY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

  console.log(`[Webhook] Incoming: ${eventType} for report ${reportId} (Run: ${incomingRunId})`)

  // Fix 2: Idempotencia — ignorar si ya procesamos este run
  if (incomingRunId && job.processedRunIds?.includes(incomingRunId)) {
    console.log(`[Webhook] Run ${incomingRunId} already processed, skipping`)
    return NextResponse.json({ ok: true })
  }

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
    console.log(`[Webhook] Fetched ${items.length} items. Total for ${reportId}: ${combined.length}`)

    const apifyCompletedRuns = [
      ...(job.apifyCompletedRuns ?? []),
      ...(incomingRunId ? [incomingRunId] : []),
    ]
    const processedRunIds = [
      ...(job.processedRunIds ?? []),
      ...(incomingRunId ? [incomingRunId] : []),
    ]

    // Fix 3: Detectar Stage 2 por run ID exacto, no por status
    // Evita que cualquier webhook concurrente dispare Stage 2 incorrectamente
    const isTikTokPostsRun = !!incomingRunId && incomingRunId === job.apifyRunIds?.['tiktok']
    const isInstagramPostsRun = !!incomingRunId && incomingRunId === job.apifyRunIds?.['instagram']

    const webhookUrl = `${getBaseUrl()}/api/reports/${reportId}/apify-webhook?secret=${process.env.APIFY_WEBHOOK_SECRET}`

    if (isTikTokPostsRun && !job.apifyRunIds?.['tiktok_comments']) {
      console.log(`[Webhook] TikTok Stage 1 finished for ${reportId}. Starting Stage 2...`)

      const videoUrls = items
        .map((item: any) => item.url || item.videoUrl || item.webVideoUrl || item.link || item.postUrl || item.shareUrl)
        .filter(Boolean)
        .filter((url: string) => url.includes('tiktok.com'))
        .slice(0, 500)

      if (videoUrls.length > 0) {
        const { startTikTokCommentsRun } = await import('@/lib/apify')
        try {
          const commentRunId = await startTikTokCommentsRun(videoUrls, webhookUrl)
          const apifyRunIds = { ...job.apifyRunIds, tiktok_comments: commentRunId }
          await updateJobStatus(reportId, { status: 'scraping_comments', apifyRunIds, apifyCompletedRuns, processedRunIds })
          return NextResponse.json({ ok: true, message: 'TikTok Stage 2 started' })
        } catch (err) {
          console.error(`[Webhook] Error starting TikTok Stage 2:`, err)
        }
      }
    }

    if (isInstagramPostsRun && !job.apifyRunIds?.['instagram_comments'] && job.accounts && job.accounts.length > 0) {
      console.log(`[Webhook] Instagram Stage 1 finished for ${reportId}. Starting Stage 2...`)

      const postUrls = items
        .map((item: any) => item.url || item.directUrl || item.link || item.postUrl)
        .filter(Boolean)
        .filter((url: string) => url.includes('instagram.com/p/'))
        .slice(0, 200)

      if (postUrls.length > 0) {
        const { startInstagramCommentsRun } = await import('@/lib/apify')
        try {
          const commentRunId = await startInstagramCommentsRun(postUrls, webhookUrl)
          const apifyRunIds = { ...job.apifyRunIds, instagram_comments: commentRunId }
          await updateJobStatus(reportId, { status: 'scraping_comments', apifyRunIds, apifyCompletedRuns, processedRunIds })
          return NextResponse.json({ ok: true, message: 'Instagram Stage 2 started' })
        } catch (err) {
          console.error(`[Webhook] Error starting Instagram Stage 2:`, err)
        }
      }
    }

    // Fix 4: Recargar el job antes de verificar allDone para obtener apifyRunIds actualizados
    // (Stage 2 puede haber sido registrado por un webhook concurrente anterior)
    const freshJob = await updateJobStatus(reportId, { apifyCompletedRuns, processedRunIds })
    const allExpectedRuns = Object.values(freshJob.apifyRunIds ?? {})
    const allDone = allExpectedRuns.length > 0 &&
      allExpectedRuns.every(id => freshJob.apifyCompletedRuns?.includes(id))

    if (!allDone) {
      const remaining = allExpectedRuns.filter(id => !freshJob.apifyCompletedRuns?.includes(id))
      console.log(`[Webhook] Waiting for ${remaining.length} more runs: ${remaining.join(', ')}`)
      return NextResponse.json({ ok: true })
    }

    console.log(`[Webhook] All runs completed for ${reportId}. Starting analysis...`)

    const analyzingJob = await updateJobStatus(reportId, { status: 'analyzing' })
    const capturedData = combined as unknown[]

    after(async () => {
      try {
        const analysis = await analyzeData(capturedData, {
          clientName: analyzingJob.clientName,
          dateFrom: analyzingJob.dateFrom,
          dateTo: analyzingJob.dateTo,
          selectedNetworks: analyzingJob.selectedNetworks,
          keywords: analyzingJob.keywords,
          hashtags: analyzingJob.hashtags,
        })
        await saveAnalysis(reportId, analysis)
        await updateJobStatus(reportId, { status: 'generating_pdf' })

        const { renderReportPdf } = await import('@/lib/pdf/render')
        const pdfBuffer = await renderReportPdf({ job: analyzingJob, analysis })
        const pdfUrl = await savePdf(reportId, pdfBuffer)
        await updateJobStatus(reportId, { status: 'complete', pdfUrl, error: undefined })
      } catch (err: any) {
        await updateJobStatus(reportId, { status: 'error', error: err?.message ?? 'Pipeline error' })
      }
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Pipeline error'
    console.error(`[report ${reportId}] pipeline error:`, message)
    await updateJobStatus(reportId, { status: 'error', error: message })
  }

  return NextResponse.json({ ok: true })
}
