const APIFY_TOKEN = process.env.APIFY_API_TOKEN

const ACTORS: Record<string, string> = {
  instagram: 'apify/instagram-hashtag-scraper',
  tiktok_hashtags: 'clockworks/tiktok-hashtag-scraper',
  tiktok_profiles: 'clockworks/tiktok-profile-scraper',
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

export async function startActorRun(network: string, input: ApifyInput, webhookUrl: string): Promise<string> {
  const isProfileSearch = network === 'tiktok' && input.accounts && input.accounts.length > 0
  const actorId = isProfileSearch ? ACTORS.tiktok_profiles : ACTORS[network] || ACTORS[`${network}_hashtags`]
  
  if (!actorId) throw new Error(`Unknown network: ${network}`)

  const res = await fetch(
    `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs?token=${APIFY_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...buildActorInput(network, input),
        webhooks: [
          {
            eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
            requestUrl: webhookUrl,
          },
        ],
      }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Apify error starting ${network}: ${body}`)
  }

  const data = await res.json()
  return data.data.id as string
}

function buildActorInput(network: string, input: ApifyInput) {
  const tags = [...(input.hashtags ?? []), ...(input.keywords ?? [])].slice(0, 10)
  const limit = Math.min(input.maxResults ?? 100, 200)

  if (network === 'tiktok' && input.accounts && input.accounts.length > 0) {
    return {
      profiles: input.accounts,
      resultsPerPage: limit,
      oldestPostDateUnified: input.dateFrom,
      excludePinnedPosts: false,
      profileSorting: 'latest',
      shouldDownloadVideos: false,
      shouldDownloadAvatars: false,
      shouldDownloadCovers: false,
    }
  }

  switch (network) {
    case 'instagram':
      return { hashtags: tags, resultsLimit: limit }
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

export async function fetchDatasetItems(datasetId: string, limit = 200): Promise<unknown[]> {
  const res = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&limit=${limit}&format=json`
  )
  if (!res.ok) throw new Error(`Failed to fetch dataset ${datasetId}`)
  return res.json()
}

export async function getRunInfo(runId: string): Promise<{ status: string; defaultDatasetId: string }> {
  const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`)
  if (!res.ok) throw new Error(`Failed to get run info for ${runId}`)
  const data = await res.json()
  return data.data
}
