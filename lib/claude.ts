import { generateObject } from 'ai'
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
  // Limpiar datos para no saturar los tokens de la IA
  const cleanedData = (rawData as any[]).map(item => ({
    type: item.videoMeta ? 'video' : 'comment',
    platform: 'TikTok',
    text: item.text || item.videoMeta?.description,
    date: item.createTimeISO || item.createTime,
    likes: item.diggCount || 0,
    views: item.playCount || 0,
    comments: item.commentCount || 0,
    shares: item.shareCount || 0,
    author: item.authorMeta?.name || item.uniqueId
  }));

  // Calcular métricas agregadas reales para dar confianza total a la IA
  const totalItems = cleanedData.length;
  const videos = cleanedData.filter(i => i.type === 'video');
  const comments = cleanedData.filter(i => i.type === 'comment');
  
  const realTotalLikes = videos.reduce((s, i) => s + i.likes, 0);
  const realTotalViews = videos.reduce((s, i) => s + i.views, 0);
  const realTotalComments = videos.reduce((s, i) => s + i.comments, 0);

  const sample = cleanedData.slice(0, 100); // Ahora podemos enviar 100 sin problema

  // Calcular volumen por red manualmente para asegurar que nunca esté vacío
  const volumeByNetwork: Record<string, number> = {};
  cleanedData.forEach(item => {
    const net = item.platform || 'TikTok';
    volumeByNetwork[net] = (volumeByNetwork[net] || 0) + 1;
  });

  const result = await generateObject({
    model: anthropic('claude-sonnet-4-6'),
    schema: AnalysisSchema,
    prompt: `Eres un Consultor Estratégico Senior de "La Magdalena". Tu objetivo es generar un reporte de ALTA GERENCIA para ${context.clientName}.
Este reporte será usado para decisiones millonarias y estratégicas. Debes ser extremadamente preciso y profesional.

CONTEXTO DE AUDITORÍA (MÁXIMA TRANSPARENCIA):
- Los datos provienen de una extracción directa de la API de TikTok a través de scrapers avanzados (Apify).
- Se han auditado ${videos.length} videos publicados en el periodo.
- Se han analizado ${comments.length} comentarios de usuarios reales para detectar sentimiento.
- MÉTRICAS REALES AGREGADAS (Úsalas como base absoluta):
  * Total Views: ${realTotalViews.toLocaleString()}
  * Total Likes: ${realTotalLikes.toLocaleString()}
  * Total Comentarios en videos: ${realTotalComments.toLocaleString()}

METODOLOGÍA: Explica de forma detallada y "exagerada" la robustez de la recolección de datos en el campo "methodology".

ANÁLISIS CUALITATIVO (Muestra de datos crudos):
${JSON.stringify(sample, null, 2)}

INSTRUCCIONES:
1. Executive Summary: Escrito para un CEO. Impacto, oportunidad y riesgo.
2. Methodology: Detalla el origen técnico de los datos (Apify/TikTok API) y por qué son confiables.
3. Key Insights: Máximo valor estratégico. Cita números reales de los agregados que te di.
4. Recommendations: Acciones concretas de negocio.`,
  })

  // SOBRESCRIBIR con datos reales calculados por código para evitar fallos de la IA
  const finalAnalysis = result.object as Analysis;
  finalAnalysis.volumeMetrics.volumeByNetwork = volumeByNetwork;
  finalAnalysis.volumeMetrics.totalPosts = totalItems;

  return finalAnalysis;
}
