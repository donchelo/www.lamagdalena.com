import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import type { SovEntity, SovAnalysis, SovEntityResult, SovTopPost } from './sov-supabase'

interface NormalizedPost {
  url: string
  platform: string
  likes: number
  comments: number
  shares: number
  date: string
  caption: string
  followersCount: number
}

function normalizePost(raw: unknown, platform: string): NormalizedPost | null {
  const r = raw as Record<string, unknown>
  if (!r) return null

  // Instagram
  if (platform === 'instagram') {
    return {
      url: (r.url ?? r.shortCode ? `https://instagram.com/p/${r.shortCode}` : '') as string,
      platform: 'instagram',
      likes: Number(r.likesCount ?? r.likes ?? 0),
      comments: Number(r.commentsCount ?? r.comments ?? 0),
      shares: 0,
      date: String(r.timestamp ?? r.takenAt ?? ''),
      caption: String(r.caption ?? r.alt ?? '').slice(0, 200),
      followersCount: Number(r.ownerFollowerCount ?? r.followersCount ?? 0),
    }
  }

  // TikTok
  if (platform === 'tiktok') {
    return {
      url: String(r.webVideoUrl ?? r.url ?? ''),
      platform: 'tiktok',
      likes: Number(r.diggCount ?? r.likeCount ?? r.likes ?? 0),
      comments: Number(r.commentCount ?? r.comments ?? 0),
      shares: Number(r.shareCount ?? r.shares ?? 0),
      date: String(r.createTimeISO ?? r.createTime ?? ''),
      caption: String(r.text ?? r.desc ?? '').slice(0, 200),
      followersCount: Number((r.authorMeta as Record<string, unknown>)?.fans ?? r.followers ?? 0),
    }
  }

  // Twitter
  if (platform === 'twitter') {
    return {
      url: String(r.url ?? r.tweetUrl ?? ''),
      platform: 'twitter',
      likes: Number(r.likeCount ?? r.favoriteCount ?? 0),
      comments: Number(r.replyCount ?? r.replies ?? 0),
      shares: Number(r.retweetCount ?? r.retweets ?? 0),
      date: String(r.createdAt ?? r.date ?? ''),
      caption: String(r.fullText ?? r.text ?? '').slice(0, 200),
      followersCount: Number((r.user as Record<string, unknown>)?.followers_count ?? 0),
    }
  }

  return {
    url: String(r.url ?? ''),
    platform,
    likes: Number(r.likesCount ?? r.likes ?? r.likeCount ?? 0),
    comments: Number(r.commentsCount ?? r.comments ?? r.commentCount ?? 0),
    shares: Number(r.sharesCount ?? r.shares ?? r.shareCount ?? 0),
    date: String(r.timestamp ?? r.createTime ?? r.date ?? ''),
    caption: String(r.caption ?? r.text ?? r.desc ?? '').slice(0, 200),
    followersCount: 0,
  }
}

export function calculateSov(
  rawData: Record<string, unknown[]>,
  brand: SovEntity,
  competitors: SovEntity[]
): Omit<SovAnalysis, 'insights'> {
  const allEntities = [
    { ...brand, id: 'brand', isBrand: true },
    ...competitors.map((c, i) => ({ ...c, id: `comp_${i}`, isBrand: false })),
  ]

  const entityResults: Map<string, {
    posts: NormalizedPost[]
    byNetwork: Record<string, NormalizedPost[]>
  }> = new Map()

  for (const entity of allEntities) {
    entityResults.set(entity.id, { posts: [], byNetwork: {} })
  }

  // Parse raw data per entity×network run key
  for (const [runKey, items] of Object.entries(rawData)) {
    // runKey format: 'brand_instagram' | 'comp_0_tiktok' etc.
    const parts = runKey.split('_')
    const network = parts[parts.length - 1]
    // entity id is everything except the last part
    const entityId = parts.slice(0, -1).join('_')

    const entityData = entityResults.get(entityId)
    if (!entityData) continue

    const normalized = (items ?? [])
      .map(item => normalizePost(item, network))
      .filter((p): p is NormalizedPost => p !== null)

    entityData.posts.push(...normalized)
    entityData.byNetwork[network] = [
      ...(entityData.byNetwork[network] ?? []),
      ...normalized,
    ]
  }

  // Compute totals
  let totalPosts = 0
  let totalEngagement = 0

  for (const [, data] of entityResults) {
    totalPosts += data.posts.length
    totalEngagement += data.posts.reduce(
      (sum, p) => sum + p.likes + p.comments + p.shares,
      0
    )
  }

  // Build entity results
  const entities: SovEntityResult[] = allEntities.map(entity => {
    const data = entityResults.get(entity.id)!
    const postCount = data.posts.length
    const totalLikes = data.posts.reduce((s, p) => s + p.likes, 0)
    const totalComments = data.posts.reduce((s, p) => s + p.comments, 0)
    const totalShares = data.posts.reduce((s, p) => s + p.shares, 0)
    const engagement = totalLikes + totalComments + totalShares
    const estimatedReach = data.posts.reduce((s, p) => s + p.followersCount, 0)

    const byNetwork: Record<string, { postCount: number; engagement: number }> = {}
    for (const [net, posts] of Object.entries(data.byNetwork)) {
      byNetwork[net] = {
        postCount: posts.length,
        engagement: posts.reduce((s, p) => s + p.likes + p.comments + p.shares, 0),
      }
    }

    return {
      id: entity.id,
      name: entity.name,
      isBrand: entity.isBrand,
      postCount,
      totalEngagement: engagement,
      totalLikes,
      totalComments,
      estimatedReach,
      sovMentions: totalPosts > 0 ? Math.round((postCount / totalPosts) * 1000) / 10 : 0,
      sovEngagement: totalEngagement > 0 ? Math.round((engagement / totalEngagement) * 1000) / 10 : 0,
      byNetwork,
    }
  })

  // Build time series (aggregate posts per date per entity)
  const dateMap: Map<string, Record<string, number>> = new Map()

  for (const entity of allEntities) {
    const data = entityResults.get(entity.id)!
    for (const post of data.posts) {
      const date = post.date ? post.date.substring(0, 10) : null
      if (!date || date === 'undefined') continue
      if (!dateMap.has(date)) dateMap.set(date, {})
      const day = dateMap.get(date)!
      day[entity.id] = (day[entity.id] ?? 0) + 1
    }
  }

  const timeSeries = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, byEntity]) => ({ date, byEntity }))

  // Top posts (top 10 by engagement across all entities)
  const allPostsFlat: SovTopPost[] = []
  for (const entity of allEntities) {
    const data = entityResults.get(entity.id)!
    for (const post of data.posts) {
      allPostsFlat.push({
        entityId: entity.id,
        url: post.url,
        platform: post.platform,
        likes: post.likes,
        comments: post.comments,
        caption: post.caption,
      })
    }
  }

  const topPosts = allPostsFlat
    .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
    .slice(0, 10)

  return {
    entities,
    totals: { totalPosts, totalEngagement },
    timeSeries,
    topPosts,
  }
}

export async function generateSovInsights(
  analysis: Omit<SovAnalysis, 'insights'>,
  clientName: string
): Promise<string> {
  const brandEntity = analysis.entities.find(e => e.isBrand)
  const competitors = analysis.entities.filter(e => !e.isBrand)

  const entitySummary = analysis.entities
    .map(e => `- **${e.name}**: ${e.postCount} posts, SOV menciones: ${e.sovMentions}%, SOV engagement: ${e.sovEngagement}%, engagement total: ${e.totalEngagement.toLocaleString()}`)
    .join('\n')

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    prompt: `Eres un estratega de marketing digital experto en posicionamiento de marca para el mercado colombiano y latinoamericano. Analiza los siguientes datos de Share of Voice para el cliente ${clientName} y genera un análisis estratégico conciso en español.

**Datos de Share of Voice:**
${entitySummary}

**Total del mercado analizado:** ${analysis.totals.totalPosts} posts, ${analysis.totals.totalEngagement.toLocaleString()} interacciones totales

**Marca cliente:** ${brandEntity?.name ?? 'N/A'} con ${brandEntity?.sovMentions ?? 0}% de cuota de voz por menciones y ${brandEntity?.sovEngagement ?? 0}% por engagement

**Competidores analizados:** ${competitors.map(c => c.name).join(', ')}

Genera un análisis en 4 secciones breves (máximo 2 párrafos cada una):
1. **Posicionamiento actual**: ¿Cómo está la marca frente a la competencia?
2. **Fortalezas y oportunidades**: ¿Qué está haciendo bien y dónde puede crecer?
3. **Amenazas competitivas**: ¿Qué competidores representan mayor riesgo y por qué?
4. **Recomendaciones estratégicas**: 3 acciones concretas para mejorar el SOV en los próximos 30 días.

Sé directo, usa datos específicos del análisis y enfócate en insights accionables.`,
  })

  return text
}
