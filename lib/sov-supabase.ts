import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

function getSupabase() {
  if (supabaseInstance) return supabaseInstance
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  supabaseInstance = createClient(url!, key!)
  return supabaseInstance
}

export type SovStatus = 'queued' | 'scraping' | 'analyzing' | 'complete' | 'error'

export interface SovEntity {
  id: string
  name: string
  accounts: string[]
  hashtags: string[]
  keywords: string[]
}

export interface SovEntityResult {
  id: string
  name: string
  isBrand: boolean
  postCount: number
  totalEngagement: number
  totalLikes: number
  totalComments: number
  estimatedReach: number
  sovMentions: number
  sovEngagement: number
  byNetwork: Record<string, { postCount: number; engagement: number }>
}

export interface SovTopPost {
  entityId: string
  url: string
  platform: string
  likes: number
  comments: number
  caption: string
}

export interface SovAnalysis {
  entities: SovEntityResult[]
  totals: { totalPosts: number; totalEngagement: number }
  timeSeries: Array<{ date: string; byEntity: Record<string, number> }>
  insights: string
  topPosts: SovTopPost[]
}

export interface SovJobData {
  sovId: string
  status: SovStatus
  clientName: string
  dateFrom: string
  dateTo: string
  selectedNetworks: string[]
  brand: SovEntity
  competitors: SovEntity[]
  apifyRunIds: Record<string, string>
  apifyCompletedRuns: string[]
  totalExpectedRuns: number
  rawData: Record<string, unknown[]>
  analysis?: SovAnalysis
  generationCostUsd?: number
  error?: string
  createdAt: string
  updatedAt: string
}

export async function saveSovJob(job: SovJobData): Promise<void> {
  const { error } = await getSupabase().from('sov_reports').upsert({
    id: job.sovId,
    status: job.status,
    client_name: job.clientName,
    date_from: job.dateFrom,
    date_to: job.dateTo,
    selected_networks: job.selectedNetworks,
    brand: job.brand,
    competitors: job.competitors,
    apify_run_ids: job.apifyRunIds,
    apify_completed_runs: job.apifyCompletedRuns,
    total_expected_runs: job.totalExpectedRuns,
    raw_data: job.rawData,
    analysis: job.analysis ?? null,
    generation_cost_usd: job.generationCostUsd ?? null,
    error: job.error ?? null,
    updated_at: new Date().toISOString(),
    ...(job.createdAt ? { created_at: job.createdAt } : { created_at: new Date().toISOString() }),
  })
  if (error) throw error
}

export async function getSovJob(sovId: string): Promise<SovJobData | null> {
  const { data, error } = await getSupabase()
    .from('sov_reports')
    .select('*')
    .eq('id', sovId)
    .single()

  if (error || !data) return null
  return rowToJob(data)
}

export async function listSovJobs(): Promise<SovJobData[]> {
  const { data, error } = await getSupabase()
    .from('sov_reports')
    .select('id, status, client_name, date_from, date_to, selected_networks, brand, competitors, apify_run_ids, apify_completed_runs, total_expected_runs, analysis, generation_cost_usd, error, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error || !data) return []
  return data.map(rowToJob)
}

export async function updateSovJob(sovId: string, patch: Partial<SovJobData>): Promise<void> {
  const existing = await getSovJob(sovId)
  if (!existing) throw new Error(`SOV job ${sovId} not found`)
  await saveSovJob({ ...existing, ...patch, updatedAt: new Date().toISOString() })
}

export async function appendSovRawData(
  sovId: string,
  runKey: string,
  items: unknown[],
  completedRunKey: string
): Promise<{ completedRuns: string[]; totalExpected: number }> {
  const job = await getSovJob(sovId)
  if (!job) throw new Error(`SOV job ${sovId} not found`)

  const updatedRawData = { ...job.rawData, [runKey]: items }
  const updatedCompleted = [...new Set([...job.apifyCompletedRuns, completedRunKey])]

  await getSupabase()
    .from('sov_reports')
    .update({
      raw_data: updatedRawData,
      apify_completed_runs: updatedCompleted,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sovId)

  return { completedRuns: updatedCompleted, totalExpected: job.totalExpectedRuns }
}

function rowToJob(row: Record<string, unknown>): SovJobData {
  return {
    sovId: row.id as string,
    status: row.status as SovStatus,
    clientName: row.client_name as string,
    dateFrom: row.date_from as string,
    dateTo: row.date_to as string,
    selectedNetworks: (row.selected_networks as string[]) ?? [],
    brand: row.brand as SovEntity,
    competitors: (row.competitors as SovEntity[]) ?? [],
    apifyRunIds: (row.apify_run_ids as Record<string, string>) ?? {},
    apifyCompletedRuns: (row.apify_completed_runs as string[]) ?? [],
    totalExpectedRuns: (row.total_expected_runs as number) ?? 0,
    rawData: (row.raw_data as Record<string, unknown[]>) ?? {},
    analysis: row.analysis as SovAnalysis | undefined,
    generationCostUsd: row.generation_cost_usd != null ? Number(row.generation_cost_usd) : undefined,
    error: row.error as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}
