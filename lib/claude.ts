import { generateText, Output } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
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

function isPost(item: any): boolean {
  // TikTok posts have video-specific fields
  if (item.playCount !== undefined || item.videoMeta !== undefined || item.webVideoUrl !== undefined) return true
  // Instagram posts have shortCode or displayUrl — comments have neither (they have postUrl/commentUrl)
  if (item.shortCode !== undefined || item.displayUrl !== undefined) return true
  return false
}

function getLikes(item: any): number {
  return item.likesCount ?? item.diggCount ?? item.likeCount ?? 0
}

function getComments(item: any): number {
  return item.commentsCount ?? item.commentCount ?? 0
}

function getShares(item: any): number {
  return item.shareCount ?? item.sharesCount ?? 0
}

function getViews(item: any): number {
  return item.playCount ?? item.videoPlayCount ?? item.videoViewCount ?? item.viewCount ?? 0
}

function getCaption(item: any): string {
  return String(item.caption || item.text || item.desc || item.description || '').slice(0, 300)
}

function getUrl(item: any): string {
  return item.url || item.webVideoUrl || item.videoUrl || item.directUrl || ''
}

function toDateStr(item: any): string | null {
  // Intentar todos los campos de fecha conocidos
  const raw = item.timestamp || item.createTimeISO || item.createTime || item.postedAt || item.takenAtTimestamp
  if (!raw) return null
  try {
    const d = typeof raw === 'number' ? new Date(raw * 1000) : new Date(raw)
    if (isNaN(d.getTime())) return null
    return d.toISOString().split('T')[0]
  } catch {
    return null
  }
}

function computeMetrics(rawData: any[], networks: string[], dateFrom?: string, dateTo?: string): ComputedMetrics {
  const allPosts = rawData.filter(isPost)
  const posts = allPosts.filter(v => {
    if (!dateFrom && !dateTo) return true
    const d = toDateStr(v)
    if (!d) return true
    if (dateFrom && d < dateFrom) return false
    if (dateTo && d > dateTo) return false
    return true
  })
  const platform = networks[0] ?? 'instagram'

  const totalLikes = posts.reduce((s, v) => s + getLikes(v), 0)
  const totalViews = posts.reduce((s, v) => s + getViews(v), 0)
  const totalComments = posts.reduce((s, v) => s + getComments(v), 0)
  const totalShares = posts.reduce((s, v) => s + getShares(v), 0)
  // Para Instagram sin views, usar likes como base del engagement
  const engBase = totalViews > 0 ? totalViews : (totalLikes + totalComments) * 10
  const avgEngagementRate = engBase > 0
    ? +((totalLikes + totalComments) / engBase * 100).toFixed(2)
    : 0

  const dateCounts: Record<string, number> = {}
  posts.forEach(v => {
    const d = toDateStr(v)
    if (d) dateCounts[d] = (dateCounts[d] || 0) + 1
  })
  const timeSeries = Object.entries(dateCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
  const peakDay = timeSeries.length > 0
    ? timeSeries.reduce((best, cur) => cur.count > best.count ? cur : best).date
    : 'N/A'

  const topPosts = [...posts]
    .sort((a, b) => (getLikes(b) + getComments(b)) - (getLikes(a) + getComments(a)))
    .slice(0, 5)
    .map(v => ({
      url: getUrl(v),
      platform,
      likes: getLikes(v),
      comments: getComments(v),
      caption: getCaption(v),
    }))

  return {
    volumeMetrics: {
      totalPosts: posts.length,
      totalReach: totalViews,
      peakDay,
      volumeByNetwork: { [platform]: posts.length },
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
  const allPosts = items.filter(isPost)

  if (allPosts.length === 0) {
    throw new Error('No se encontraron publicaciones con los términos proporcionados.')
  }

  const filtered = allPosts.filter(v => {
    const d = toDateStr(v)
    if (!d) return true
    if (context.dateFrom && d < context.dateFrom) return false
    if (context.dateTo && d > context.dateTo) return false
    return true
  })

  // If date filter removes everything, fall back to all posts and note it in context
  const posts = filtered.length > 0 ? filtered : allPosts
  const dateWarning = filtered.length === 0
    ? `\n⚠️ NOTA: No se encontraron publicaciones en el rango ${context.dateFrom}–${context.dateTo}. El análisis usa los ${allPosts.length} posts disponibles fuera de ese rango.`
    : ''

  const comments = items.filter(i => !isPost(i) && i.text)
  const computed = computeMetrics(items, context.selectedNetworks, context.dateFrom, context.dateTo)

  const videoSample = posts.slice(0, 50).map(v => ({
    caption: getCaption(v),
    likes: getLikes(v),
    views: getViews(v),
    comments: getComments(v),
    date: toDateStr(v),
    url: getUrl(v),
  }))

  const commentTexts = comments.slice(0, 150).map((c: any) => c.text).filter(Boolean)

  const { output: qualitative } = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    output: Output.object({ schema: QualitativeSchema }),
    prompt: `Eres un Consultor Estratégico Senior de "La Magdalena". Genera un análisis para: ${context.clientName}.${dateWarning}

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
