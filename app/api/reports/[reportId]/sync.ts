import { updateJobStatus, saveRawData, saveAnalysis, savePdf, getRawData, JobData } from '@/lib/blob'
import { getRunInfo, fetchDatasetItems, startTikTokCommentsRun } from '@/lib/apify'
import { analyzeData } from '@/lib/claude'

export async function syncJobWithApify(reportId: string, job: JobData): Promise<JobData | null> {
  // Determinar cuál es el Run ID activo
  let activeRunId: string | undefined
  let currentStage: 'posts' | 'comments' = 'posts'

  if (job.status === 'scraping_comments') {
    activeRunId = job.apifyRunIds?.tiktok_comments
    currentStage = 'comments'
  } else {
    activeRunId = job.apifyRunIds?.tiktok || job.apifyRunIds?.tiktok_profiles
    currentStage = 'posts'
  }

  if (!activeRunId) return null

  try {
    const info = await getRunInfo(activeRunId)

    if (info.status === 'SUCCEEDED') {
      console.log(`[Sync] Run terminado (${activeRunId}). Sincronizando datos...`)

      const items = await fetchDatasetItems(info.defaultDatasetId)
      const existing = await getRawData(reportId)
      const combined = [...existing, ...items]
      await saveRawData(reportId, combined)

      if (currentStage === 'posts' && job.selectedNetworks.includes('tiktok')) {
        console.log(`[Sync] Transicionando de Posts a Comentarios...`)

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
          const commentRunId = await startTikTokCommentsRun(videoUrls, webhookUrl)
          const apifyRunIds = { ...job.apifyRunIds, tiktok_comments: commentRunId }
          const updated = await updateJobStatus(reportId, { status: 'scraping_comments', apifyRunIds })
          return updated
        }
      }

      console.log(`[Sync] Scraping completo. Iniciando análisis...`)
      await updateJobStatus(reportId, { status: 'analyzing' })
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
