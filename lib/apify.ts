import { ApifyClient } from 'apify-client'

// Two clients for token rotation — fallback if primary hits rate limit or quota
function makeClients(): ApifyClient[] {
  const tokens = [
    process.env.APIFY_API_TOKEN,
    process.env.APIFY_API_TOKEN_FALLBACK,
  ].filter(Boolean) as string[]

  if (tokens.length === 0) throw new Error('No Apify tokens configured')
  return tokens.map(token => new ApifyClient({ token }))
}

async function withFallback<T>(fn: (client: ApifyClient) => Promise<T>): Promise<T> {
  const clients = makeClients()
  let lastError: Error | null = null

  for (const client of clients) {
    try {
      return await fn(client)
    } catch (err) {
      const e = err as { statusCode?: number; message?: string }
      if (e.statusCode === 401 || e.statusCode === 403 || e.statusCode === 402 || e.statusCode === 429) {
        lastError = err instanceof Error ? err : new Error(String(err))
        continue
      }
      throw err
    }
  }

  throw lastError ?? new Error('All Apify tokens failed')
}

const ACTORS: Record<string, string> = {
  instagram: 'apify/instagram-hashtag-scraper',
  instagram_posts: 'apify/instagram-post-scraper',
  instagram_comments: 'apify/instagram-comment-scraper',
  tiktok_hashtags: 'clockworks/tiktok-scraper',
  tiktok_profiles: 'clockworks/tiktok-profile-scraper',
  tiktok_comments: 'clockworks/tiktok-comments-scraper',
  twitter: 'apidojo/tweet-scraper',
  facebook: 'apify/facebook-posts-scraper',
  youtube: 'streamers/youtube-search-scraper',
}

interface ApifyInput {
  hashtags?: string[]
  keywords?: string[]
  accounts?: string[]
  dateFrom?: string
  dateTo?: string
  maxResults?: number
}

export async function startInstagramCommentsRun(postUrls: string[], webhookUrl: string): Promise<string> {
  return withFallback(async client => {
    const run = await client.actor(ACTORS.instagram_comments).start(
      {
        directUrls: postUrls,
        resultsLimit: 200,
        includeNestedComments: false,
        isNewestComments: false,
      },
      {
        webhooks: [{ eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'], requestUrl: webhookUrl }],
      }
    )
    return run.id
  })
}

export async function startTikTokCommentsRun(videoUrls: string[], webhookUrl: string): Promise<string> {
  return withFallback(async client => {
    const run = await client.actor(ACTORS.tiktok_comments).start(
      {
        postURLs: videoUrls,
        commentsPerPost: 10000,
        maxRepliesPerComment: 0,
        excludePinnedPosts: false,
        resultsPerPage: 1000,
      },
      {
        webhooks: [{ eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'], requestUrl: webhookUrl }],
      }
    )
    return run.id
  })
}

export async function startActorRun(network: string, input: ApifyInput, webhookUrl: string): Promise<string> {
  const isProfileSearch = (network === 'tiktok' || network === 'instagram') && input.accounts && input.accounts.length > 0
  const actorId = isProfileSearch
    ? (network === 'tiktok' ? ACTORS.tiktok_profiles : ACTORS.instagram_posts)
    : ACTORS[network] ?? ACTORS[`${network}_hashtags`]

  if (!actorId) throw new Error(`Unknown network: ${network}`)

  return withFallback(async client => {
    const run = await client.actor(actorId).start(
      buildActorInput(network, input),
      {
        webhooks: [{ eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'], requestUrl: webhookUrl }],
      }
    )
    return run.id
  })
}

function buildActorInput(network: string, input: ApifyInput): Record<string, unknown> {
  const tags = [...(input.hashtags ?? []), ...(input.keywords ?? [])].slice(0, 50)
  const limit = input.maxResults ?? 10000

  if (network === 'tiktok' && input.accounts && input.accounts.length > 0) {
    const formattedProfiles = input.accounts.map(acc =>
      acc.startsWith('http') ? acc : `https://www.tiktok.com/@${acc.replace('@', '')}`
    )
    return {
      profiles: formattedProfiles,
      resultsPerPage: limit,
      oldestPostDateUnified: input.dateFrom,
      excludePinnedPosts: false,
      profileSorting: 'latest',
      shouldDownloadVideos: false,
      shouldDownloadAvatars: false,
      shouldDownloadCovers: false,
      shouldDownloadSlideshowImages: false,
      scrapeRelatedVideos: false,
      proxyCountryCode: 'None',
    }
  }

  switch (network) {
    case 'instagram':
      if (input.accounts && input.accounts.length > 0) {
        return {
          username: input.accounts,
          resultsLimit: limit,
          onlyPostsNewerThan: input.dateFrom,
          skipPinnedPosts: false,
        }
      }
      return { hashtags: tags, resultsLimit: limit, sort: 'RECENT' }
    case 'tiktok':
      return { hashtags: tags, maxItems: limit }
    case 'twitter':
      return { searchTerms: tags, maxItems: limit, dateFrom: input.dateFrom, dateTo: input.dateTo }
    case 'facebook':
      return { queries: tags, maxItems: limit }
    case 'youtube':
      return { searchTerms: tags, maxResults: limit }
    default:
      return { hashtags: tags, maxItems: limit }
  }
}

export async function fetchDatasetItems(datasetId: string, limit = 1000): Promise<unknown[]> {
  if (datasetId === 'simulated-dataset-id') {
    return [
      { url: 'https://www.tiktok.com/@test/video/1', title: 'Video Test 1' },
      { url: 'https://www.tiktok.com/@test/video/2', title: 'Video Test 2' },
    ]
  }

  return withFallback(async client => {
    const { items } = await client.dataset(datasetId).listItems({ limit })
    return items as unknown[]
  })
}

export async function getRunInfo(runId: string): Promise<{ status: string; defaultDatasetId: string; stats?: { usageUsd?: number } }> {
  return withFallback(async client => {
    const run = await client.run(runId).get()
    if (!run) throw new Error(`Run ${runId} not found`)
    return {
      status: run.status,
      defaultDatasetId: run.defaultDatasetId,
      stats: { usageUsd: run.stats?.computeUnits },
    }
  })
}

export async function getRunCostUsd(runId: string): Promise<number> {
  try {
    const info = await getRunInfo(runId)
    return info.stats?.usageUsd ?? 0
  } catch {
    return 0
  }
}
