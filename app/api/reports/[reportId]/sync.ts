import { loadJob, updateJobStatus, saveRawData, saveAnalysis, savePdf, JobData } from '@/lib/blob'
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
    
    // Si el proceso ya terminó en Apify pero nosotros seguimos esperando
    if (info.status === 'SUCCEEDED') {
      console.log(`[Sync] Detectado proceso terminado (${activeRunId}). Sincronizando datos...`)
      
      const items = await fetchDatasetItems(info.defaultDatasetId)
      
      // Guardar datos
      const { list } = await import('@vercel/blob')
      let existing: any[] = []
      try {
        const res = await fetch(job.reportId.includes('http') ? job.reportId : `https://${process.env.VERCEL_URL}/api/reports/${reportId}/data`)
        if (res.ok) existing = await res.json()
      } catch {
        // Ignorar si no hay datos previos
      }
      
      const combined = [...existing, ...items]
      await saveRawData(reportId, combined)

      // Lógica de transición
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
          const updated = { ...job, status: 'scraping_comments' as const, apifyRunIds, updatedAt: new Date().toISOString() }
          await updateJobStatus(reportId, updated)
          return updated
        }
      }

      // Si llegamos aquí es que ya terminamos todo el scraping
      console.log(`[Sync] Scraping completo. Iniciando análisis con Claude...`)
      await updateJobStatus(reportId, { status: 'analyzing' })
      
      // Lanzar análisis (en background para no bloquear el GET)
      processAnalysis(reportId, combined)
      
      return { ...job, status: 'analyzing', updatedAt: new Date().toISOString() }
    }
  } catch (error) {
    console.error(`[Sync] Error sincronizando con Apify:`, error)
  }

  return null
}

async function processAnalysis(reportId: string, data: any[]) {
  try {
    const analysis = await analyzeData(data)
    await saveAnalysis(reportId, analysis)
    
    await updateJobStatus(reportId, { status: 'generating_pdf' })
    
    const job = await loadJob(reportId)
    if (job) {
      console.log(`[Sync] Generando PDF para el cliente: ${job.clientName}`)
      const { renderReportPdf } = await import('@/lib/pdf/render')
      const pdfBuffer = await renderReportPdf({ job, analysis })
      await savePdf(reportId, pdfBuffer)
      await updateJobStatus(reportId, { status: 'complete' })
    }
  } catch (err: any) {
    await updateJobStatus(reportId, { status: 'error', error: err.message })
  }
}
