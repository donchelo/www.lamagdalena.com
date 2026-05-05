import { updateJobStatus, saveRawData, saveAnalysis, savePdf, getRawData, JobData } from '@/lib/blob'
import { getRunInfo, fetchDatasetItems, startTikTokCommentsRun } from '@/lib/apify'
import { analyzeData } from '@/lib/claude'
import { getBaseUrl } from '@/lib/url'

function dedup(items: unknown[]): unknown[] {
  const seen = new Set<string>()
  return items.filter((item: any) => {
    const key = item.url || item.directUrl || item.postUrl || item.commentUrl || item.id
    if (!key) return true
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function syncJobWithApify(reportId: string, job: JobData): Promise<JobData | null> {
  let activeRunId: string | undefined
  let currentStage: 'posts' | 'comments' = 'posts'

  if (job.status === 'scraping_comments') {
    activeRunId = job.apifyRunIds?.tiktok_comments ?? job.apifyRunIds?.instagram_comments
    currentStage = 'comments'
  } else {
    activeRunId = job.apifyRunIds?.tiktok ?? job.apifyRunIds?.tiktok_profiles ?? job.apifyRunIds?.instagram
    currentStage = 'posts'
  }

  if (!activeRunId) return null

  // Skip if already processed (webhook already handled this run)
  if (job.processedRunIds?.includes(activeRunId)) return null

  try {
    const info = await getRunInfo(activeRunId)

    if (info.status === 'SUCCEEDED') {
      console.log(`[Sync] Run terminado (${activeRunId}). Marcando como procesado...`)

      // Lock first: mark as processed before fetching data.
      // This prevents concurrent polls from re-entering and duplicating raw data.
      const processedRunIds = [...(job.processedRunIds ?? []), activeRunId]
      const webhookUrl = `${getBaseUrl()}/api/reports/${reportId}/apify-webhook?secret=${process.env.APIFY_WEBHOOK_SECRET}`

      if (currentStage === 'posts' && job.selectedNetworks.includes('tiktok') && !job.apifyRunIds?.tiktok_comments) {
        // Reserve scraping_comments status before fetching so no other poll re-enters
        await updateJobStatus(reportId, { processedRunIds })
        console.log(`[Sync] TikTok Stage 1 done. Transicionando a Comentarios...`)

        const items = await fetchDatasetItems(info.defaultDatasetId)
        const existing = await getRawData(reportId)
        await saveRawData(reportId, dedup([...existing, ...items]))

        const videoUrls = items
          .map((item: any) => item.url || item.videoUrl || item.webVideoUrl || item.link || item.postUrl || item.shareUrl)
          .filter(Boolean)
          .filter((url: string) => url.includes('tiktok.com'))
          .slice(0, 500)

        if (videoUrls.length > 0) {
          const commentRunId = await startTikTokCommentsRun(videoUrls, webhookUrl)
          const apifyRunIds = { ...job.apifyRunIds, tiktok_comments: commentRunId }
          return await updateJobStatus(reportId, { status: 'scraping_comments', apifyRunIds, processedRunIds })
        }
      }

      if (currentStage === 'posts' && job.selectedNetworks.includes('instagram') && !job.apifyRunIds?.instagram_comments && job.accounts && job.accounts.length > 0) {
        await updateJobStatus(reportId, { processedRunIds })
        console.log(`[Sync] Instagram Stage 1 done. Transicionando a Comentarios...`)

        const items = await fetchDatasetItems(info.defaultDatasetId)
        const existing = await getRawData(reportId)
        await saveRawData(reportId, dedup([...existing, ...items]))

        const postUrls = items
          .map((item: any) => item.url || item.directUrl || item.link || item.postUrl)
          .filter(Boolean)
          .filter((url: string) => url.includes('instagram.com/p/'))
          .slice(0, 200)

        if (postUrls.length > 0) {
          const { startInstagramCommentsRun } = await import('@/lib/apify')
          const commentRunId = await startInstagramCommentsRun(postUrls, webhookUrl)
          const apifyRunIds = { ...job.apifyRunIds, instagram_comments: commentRunId }
          return await updateJobStatus(reportId, { status: 'scraping_comments', apifyRunIds, processedRunIds })
        }
      }

      // Final stage: lock with 'analyzing' status immediately so next poll skips sync
      await updateJobStatus(reportId, { status: 'analyzing', processedRunIds })
      console.log(`[Sync] Scraping completo. Procesando datos...`)

      const items = await fetchDatasetItems(info.defaultDatasetId)
      const existing = await getRawData(reportId)
      const combined = dedup([...existing, ...items])
      await saveRawData(reportId, combined)

      processAnalysis(reportId, combined, job)
      return { ...job, status: 'analyzing' as const, updatedAt: new Date().toISOString() }
    }
  } catch (error) {
    console.error(`[Sync] Error sincronizando con Apify:`, error)
  }

  return null
}

async function processAnalysis(reportId: string, data: unknown[], job: JobData) {
  try {
    const analysis = await analyzeData(data, {
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
    await updateJobStatus(reportId, { status: 'complete', pdfUrl, error: undefined })
  } catch (err: any) {
    await updateJobStatus(reportId, { status: 'error', error: err.message })
  }
}
