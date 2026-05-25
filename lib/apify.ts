import { ApifyClient } from 'apify-client'

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

// ---------------------------------------------------------------------------
// Actor registry
// ---------------------------------------------------------------------------
const ACTORS: Record<string, string> = {
  // Instagram
  instagram:          'apify/instagram-hashtag-scraper',
  instagram_posts:    'apify/instagram-post-scraper',
  instagram_comments: 'apify/instagram-comment-scraper',

  // TikTok
  tiktok_hashtags:    'apidojo/tiktok-scraper',
  tiktok_profiles:    'apidojo/tiktok-profile-scraper',
  tiktok_comments:    'clockworks/tiktok-comments-scraper',

  // Twitter/X
  twitter:            'apidojo/tweet-scraper',

  // Facebook
  facebook:           'apify/facebook-posts-scraper',
  facebook_ads:       'curious_coder/facebook-ads-library-scraper',

  // YouTube
  youtube:            'streamers/youtube-search-scraper',

  // LinkedIn — correct actor is data-slayer, apify slug returns 404
  linkedin:           'data-slayer/linkedin-company-posts-scraper',

  // Reddit
  reddit:             'trudax/reddit-scraper-lite',

  // Search & Discovery
  google_search:      'apify/google-search-scraper',
  google_maps:        'apify/google-maps-scraper',
}

export interface ApifyInput {
  hashtags?: string[]
  keywords?: string[]
  accounts?: string[]
  dateFrom?: string
  dateTo?: string
  maxResults?: number
}

// ---------------------------------------------------------------------------
// Public API (same surface as before — existing callers unchanged)
// ---------------------------------------------------------------------------

export async function startInstagramCommentsRun(postUrls: string[], webhookUrl: string): Promise<string> {
  return withFallback(async client => {
    const run = await client.actor(ACTORS.instagram_comments).start(
      { directUrls: postUrls, resultsLimit: 200, includeNestedComments: false },
      { webhooks: [{ eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'], requestUrl: webhookUrl }] }
    )
    return run.id
  })
}

export async function startTikTokCommentsRun(videoUrls: string[], webhookUrl: string): Promise<string> {
  return withFallback(async client => {
    const run = await client.actor(ACTORS.tiktok_comments).start(
      { postURLs: videoUrls, commentsPerPost: 10000, maxRepliesPerComment: 0, excludePinnedPosts: false, resultsPerPage: 1000 },
      { webhooks: [{ eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'], requestUrl: webhookUrl }] }
    )
    return run.id
  })
}

export async function startActorRun(network: string, input: ApifyInput, webhookUrl: string): Promise<string> {
  const actorId = resolveActorId(network, input)
  if (!actorId) throw new Error(`Unknown network: ${network}`)

  return withFallback(async client => {
    const run = await client.actor(actorId).start(
      buildActorInput(network, input),
      { webhooks: [{ eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'], requestUrl: webhookUrl }] }
    )
    return run.id
  })
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
    return { status: run.status, defaultDatasetId: run.defaultDatasetId, stats: { usageUsd: run.stats?.usageUsd } }
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

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function resolveActorId(network: string, input: ApifyInput): string | undefined {
  const isProfileSearch = (network === 'tiktok' || network === 'instagram') &&
    input.accounts && input.accounts.length > 0

  if (isProfileSearch) {
    return network === 'tiktok' ? ACTORS.tiktok_profiles : ACTORS.instagram_posts
  }
  return ACTORS[network] ?? ACTORS[`${network}_hashtags`]
}

function slugify(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
}

function buildActorInput(network: string, input: ApifyInput): Record<string, unknown> {
  const tags = [...(input.hashtags ?? []), ...(input.keywords ?? [])].slice(0, 50)
  const limit = input.maxResults ?? 500
  const mainQuery = tags[0] ?? input.accounts?.[0] ?? ''

  // ── Instagram ────────────────────────────────────────────────────────────
  if (network === 'instagram') {
    if (input.accounts && input.accounts.length > 0) {
      // apify/instagram-post-scraper
      return { username: input.accounts, resultsLimit: limit, onlyPostsNewerThan: input.dateFrom, skipPinnedPosts: false }
    }
    // apify/instagram-hashtag-scraper — no `sort` field in schema
    return { hashtags: tags, resultsLimit: limit }
  }

  // ── TikTok ───────────────────────────────────────────────────────────────
  if (network === 'tiktok') {
    if (input.accounts && input.accounts.length > 0) {
      // apidojo/tiktok-profile-scraper — uses startUrls or usernames + maxItems
      const startUrls = input.accounts.map(acc =>
        acc.startsWith('http') ? acc : `https://www.tiktok.com/@${acc.replace(/^@/, '')}`
      )
      return {
        startUrls,
        maxItems: limit,
        ...(input.dateFrom ? { since: input.dateFrom } : {}),
        ...(input.dateTo ? { until: input.dateTo } : {}),
      }
    }
    // apidojo/tiktok-scraper — uses `keywords`, not `hashtags`
    return { keywords: tags, maxItems: limit, sortType: 'DATE_POSTED' }
  }

  // ── Twitter / X ──────────────────────────────────────────────────────────
  // apidojo/tweet-scraper: tweetLanguage (not lang), start/end (not since/until)
  if (network === 'twitter') {
    return {
      searchTerms: tags,
      maxItems: limit,
      tweetLanguage: 'es',
      ...(input.dateFrom ? { start: input.dateFrom } : {}),
      ...(input.dateTo ? { end: input.dateTo } : {}),
    }
  }

  // ── Facebook (organic posts) ─────────────────────────────────────────────
  // apify/facebook-posts-scraper: requires page URLs in `startUrls`, not keyword queries
  if (network === 'facebook') {
    const pageUrls = input.accounts?.length
      ? input.accounts.map(a => ({ url: a.startsWith('http') ? a : `https://www.facebook.com/${a.replace(/^@/, '')}/` }))
      : tags.map(t => ({ url: `https://www.facebook.com/search/posts/?q=${encodeURIComponent(t)}` }))
    return {
      startUrls: pageUrls,
      resultsLimit: limit,
      ...(input.dateFrom ? { onlyPostsNewerThan: input.dateFrom } : {}),
    }
  }

  // ── Facebook Ads Library ─────────────────────────────────────────────────
  if (network === 'facebook_ads') {
    return {
      searchQueries: input.accounts?.length ? input.accounts : [mainQuery],
      country: 'CO',
      adType: 'all',
      maxResults: limit,
    }
  }

  // ── YouTube ──────────────────────────────────────────────────────────────
  if (network === 'youtube') {
    return { searchTerms: tags, maxResults: limit }
  }

  // ── LinkedIn ─────────────────────────────────────────────────────────────
  // data-slayer/linkedin-company-posts-scraper: single `linkedin_url` string, `maxPages` (1-5)
  if (network === 'linkedin') {
    const companyUrl = input.accounts?.length
      ? (input.accounts[0].startsWith('http') ? input.accounts[0] : `https://www.linkedin.com/company/${slugify(input.accounts[0])}/`)
      : `https://www.linkedin.com/company/${slugify(mainQuery)}/`
    return { linkedin_url: companyUrl, maxPages: Math.min(5, Math.ceil(limit / 10)) }
  }

  // ── Reddit ───────────────────────────────────────────────────────────────
  // trudax/reddit-scraper-lite: `proxy` is required
  if (network === 'reddit') {
    return {
      searches: tags.length ? tags : [mainQuery],
      maxItems: Math.min(limit, 200),
      proxy: { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'] },
      searchPosts: true,
      searchComments: false,
      sort: 'new',
    }
  }

  // ── Google Search ────────────────────────────────────────────────────────
  // apify/google-search-scraper: no `resultsPerPage` field; countryCode is uppercase
  if (network === 'google_search') {
    const queries = tags.length ? tags : [mainQuery]
    return {
      queries: queries.join('\n'),
      countryCode: 'CO',
      languageCode: 'es',
      maxPagesPerQuery: 2,
    }
  }

  // ── Google Maps ──────────────────────────────────────────────────────────
  // apify/google-maps-scraper: correct field is `maxCrawledPlacesPerSearch` (not maxCrawledPlaces)
  if (network === 'google_maps') {
    const searches = tags.length ? tags.map(t => `${t} Colombia`) : [`${mainQuery} Colombia`]
    return {
      searchStringsArray: searches,
      maxCrawledPlacesPerSearch: Math.min(limit, 50),
      language: 'es',
      countryCode: 'CO',
    }
  }

  // Fallback
  return { hashtags: tags, maxItems: limit }
}
