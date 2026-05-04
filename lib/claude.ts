import { generateText, Output, gateway } from 'ai'
import { z } from 'zod'

const AnalysisSchema = z.object({
  executiveSummary: z.string(),
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
    positivePercent: z.number(),
    neutralPercent: z.number(),
    negativePercent: z.number(),
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

export async function analyzeData(rawData: unknown[], context: ReportContext): Promise<Analysis> {
  const sample = rawData.slice(0, 50)

  const result = await generateText({
    model: gateway('anthropic/claude-sonnet-4.6'),
    output: Output.object({ schema: AnalysisSchema }),
    prompt: `Eres un experto en análisis de redes sociales. Analiza los siguientes datos de social listening para ${context.clientName} y genera un análisis completo en español.

Período: ${context.dateFrom} a ${context.dateTo}
Redes monitoreadas: ${context.selectedNetworks.join(', ')}
Keywords: ${context.keywords.join(', ')}
Hashtags: ${context.hashtags.join(', ')}

Datos recopilados (muestra de ${sample.length} publicaciones de ${rawData.length} totales):
${JSON.stringify(sample, null, 2)}

Genera un análisis ejecutivo completo con métricas de volumen, engagement, sentimiento, insights clave y recomendaciones accionables.`,
  })

  return result.output as Analysis
}
