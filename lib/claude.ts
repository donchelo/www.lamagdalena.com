import { generateText, Output } from 'ai'
import { z } from 'zod'

const AnalysisSchema = z.object({
  executiveSummary: z.string(),
  methodology: z.string(),
  volumeMetrics: z.object({
    totalPosts: z.number(),
    totalReach: z.number(),
    peakDay: z.string(),
    volumeByNetwork: z.record(z.string(), z.number()),
    timeSeries: z.array(z.object({ date: z.string(), count: z.number() })),
  }),
  engagementMetrics: z.object({
    avgEngagementRate: z.number(),
    totalLikes: z.number(),
    totalComments: z.number(),
    totalShares: z.number(),
    topPosts: z.array(z.object({
      url: z.string(),
      platform: z.string(),
      likes: z.number(),
      comments: z.number(),
      caption: z.string(),
    })).max(5),
  }),
  sentimentAnalysis: z.object({
    positivePercent: z.number().min(0).max(100),
    neutralPercent: z.number().min(0).max(100),
    negativePercent: z.number().min(0).max(100),
    dominantTopics: z.array(z.string()),
    sentimentDrivers: z.object({
      positive: z.array(z.string()),
      negative: z.array(z.string()),
    }),
  }),
  keyInsights: z.array(z.string()).max(6),
  recommendations: z.array(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
  })).max(5),
})

const QualitativeSchema = z.object({
  executiveSummary: z.string(),
  methodology: z.string(),
  sentimentAnalysis: z.object({
    positivePercent: z.number().min(0).max(100),
    neutralPercent: z.number().min(0).max(100),
    negativePercent: z.number().min(0).max(100),
    dominantTopics: z.array(z.string()),
    sentimentDrivers: z.object({
      positive: z.array(z.string()),
      negative: z.array(z.string()),
    }),
  }),
  keyInsights: z.array(z.string()).max(6),
  recommendations: z.array(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
  })).max(5),
})

export type Analysis = z.infer<typeof AnalysisSchema>

interface ReportContext {
  clientName: string
  dateFrom: string
  dateTo: string
  selectedNetworks: string[]
  keywords: string[]
  hashtags: string[]
}

interface ComputedMetrics {
  volumeMetrics: Analysis['volumeMetrics']
  engagementMetrics: Analysis['engagementMetrics']
}

function isVideo(item: any): boolean {
  return item.playCount !== undefined || item.videoMeta !== undefined || item.webVideoUrl !== undefined
}

function toDateStr(createTime: any): string | null {
  if (!createTime) return null
  try {
    const d = typeof createTime === 'number' ? new Date(createTime * 1000) : new Date(createTime)
    if (isNaN(d.getTime())) return null
    return d.toISOString().split('T')[0]
  } catch {
    return null
  }
}

function computeMetrics(rawData: any[], networks: string[], dateFrom?: string, dateTo?: string): ComputedMetrics {
  const allVideos = rawData.filter(isVideo)
  const videos = allVideos.filter(v => {
    if (!dateFrom && !dateTo) return true
    const d = toDateStr(v.createTimeISO || v.createTime)
    if (!d) return true
    if (dateFrom && d < dateFrom) return false
    if (dateTo && d > dateTo) return false
    return true
  })
  const platform = networks[0] ?? 'tiktok'

  const totalLikes = videos.reduce((s, v) => s + (v.diggCount || 0), 0)
  const totalViews = videos.reduce((s, v) => s + (v.playCount || 0), 0)
  const totalComments = videos.reduce((s, v) => s + (v.commentCount || 0), 0)
  const totalShares = videos.reduce((s, v) => s + (v.shareCount || 0), 0)
  const avgEngagementRate = totalViews > 0
    ? +((totalLikes + totalComments) / totalViews * 100).toFixed(2)
    : 0

  const dateCounts: Record<string, number> = {}
  videos.forEach(v => {
    const d = toDateStr(v.createTimeISO || v.createTime)
    if (d) dateCounts[d] = (dateCounts[d] || 0) + 1
  })
  const timeSeries = Object.entries(dateCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
  const peakDay = timeSeries.length > 0
    ? timeSeries.reduce((best, cur) => cur.count > best.count ? cur : best).date
    : 'N/A'

  const topPosts = [...videos]
    .sort((a, b) => ((b.diggCount || 0) + (b.commentCount || 0)) - ((a.diggCount || 0) + (a.commentCount || 0)))
    .slice(0, 5)
    .map(v => ({
      url: v.webVideoUrl || v.url || v.videoUrl || '',
      platform,
      likes: v.diggCount || 0,
      comments: v.commentCount || 0,
      caption: String(v.text || v.desc || v.description || '').slice(0, 250),
    }))

  return {
    volumeMetrics: {
      totalPosts: videos.length,
      totalReach: totalViews,
      peakDay,
      volumeByNetwork: { [platform]: videos.length },
      timeSeries,
    },
    engagementMetrics: {
      avgEngagementRate,
      totalLikes,
      totalComments,
      totalShares,
      topPosts,
    },
  }
}

export async function analyzeData(rawData: unknown[], context: ReportContext): Promise<Analysis> {
  const items = rawData as any[]
  const videos = items.filter(isVideo).filter(v => {
    const d = toDateStr(v.createTimeISO || v.createTime)
    if (!d) return true
    if (context.dateFrom && d < context.dateFrom) return false
    if (context.dateTo && d > context.dateTo) return false
    return true
  })
  const comments = items.filter(i => !isVideo(i) && i.text)
  const computed = computeMetrics(items, context.selectedNetworks, context.dateFrom, context.dateTo)

  const videoSample = videos.slice(0, 50).map(v => ({
    caption: String(v.text || v.desc || '').slice(0, 300),
    likes: v.diggCount || 0,
    views: v.playCount || 0,
    comments: v.commentCount || 0,
    date: toDateStr(v.createTimeISO || v.createTime),
  }))

  const commentTexts = comments.slice(0, 150).map((c: any) => c.text).filter(Boolean)

  const { output: qualitative } = await generateText({
    model: 'anthropic/claude-sonnet-4.6',
    output: Output.object({ schema: QualitativeSchema }),
    prompt: `Eres un Consultor Estratégico Senior de "La Magdalena". Genera un análisis para: ${context.clientName}.

MÉTRICAS REALES (calculadas desde los datos — úsalas en el resumen ejecutivo):
- Período: ${context.dateFrom} → ${context.dateTo}
- Videos publicados: ${computed.volumeMetrics.totalPosts}
- Reproducciones totales: ${computed.volumeMetrics.totalReach.toLocaleString('es-CO')}
- Likes totales: ${computed.engagementMetrics.totalLikes.toLocaleString('es-CO')}
- Comentarios totales: ${computed.engagementMetrics.totalComments.toLocaleString('es-CO')}
- Compartidos: ${computed.engagementMetrics.totalShares.toLocaleString('es-CO')}
- Engagement rate: ${computed.engagementMetrics.avgEngagementRate}%
- Día pico: ${computed.volumeMetrics.peakDay}
- Redes: ${context.selectedNetworks.join(', ')}

MUESTRA DE CONTENIDO (${videoSample.length} videos):
${JSON.stringify(videoSample, null, 2)}

COMENTARIOS DE USUARIOS (${commentTexts.length} — base para sentimiento):
${JSON.stringify(commentTexts.slice(0, 100), null, 2)}

INSTRUCCIONES:
1. executiveSummary: Para un CEO. Cita los números reales de arriba. Máximo 3 párrafos.
2. methodology: Explica el origen técnico (Apify/TikTok API) y la robustez del proceso.
3. sentimentAnalysis: Basado ÚNICAMENTE en los comentarios de arriba. Porcentajes deben sumar 100.
4. keyInsights: Máximo 6. Hallazgos concretos con números reales.
5. recommendations: Máximo 5 acciones de negocio concretas con prioridad.`,
  })

  return {
    ...qualitative!,
    volumeMetrics: computed.volumeMetrics,
    engagementMetrics: computed.engagementMetrics,
  }
}
