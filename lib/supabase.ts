import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null


function getSupabase() {
  if (supabaseInstance) return supabaseInstance
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    // Si estamos en build y faltan las variables, lanzamos un error solo si se intenta usar
    if (process.env.NODE_ENV === 'production') {
      console.warn('Supabase credentials missing. This is expected during build if not provided, but will fail at runtime.')
    }
  }

  supabaseInstance = createClient(url!, key!)
  return supabaseInstance
}


export interface JobData {
  reportId: string
  clientName: string
  dateFrom: string
  dateTo: string
  keywords: string[]
  hashtags: string[]
  accounts: string[]
  selectedNetworks: string[]
  apifyRunIds?: Record<string, string>
  apifyCompletedRuns?: string[]
  processedRunIds?: string[]
  status: 'queued' | 'scraping' | 'scraping_posts' | 'scraping_comments' | 'analyzing' | 'generating_pdf' | 'complete' | 'error'
  error?: string
  pdfUrl?: string
  generationCostUSD?: number
  createdAt: string
  updatedAt: string
}

export async function saveJob(job: JobData): Promise<void> {
  const { error } = await getSupabase().from('reports').upsert({
    id: job.reportId,
    status: job.status,
    client_name: job.clientName,
    date_from: job.dateFrom,
    date_to: job.dateTo,
    keywords: job.keywords,
    hashtags: job.hashtags,
    accounts: job.accounts,
    selected_networks: job.selectedNetworks,
    apify_run_ids: job.apifyRunIds,
    apify_completed_runs: job.apifyCompletedRuns,
    processed_run_ids: job.processedRunIds,
    error: job.error,
    pdf_url: job.pdfUrl,
    generation_cost_usd: job.generationCostUSD ?? null,
    updated_at: new Date().toISOString(),
    // created_at only on insert
    ...(job.createdAt ? { created_at: job.createdAt } : { created_at: new Date().toISOString() })
  })
  if (error) throw error
}

export async function loadJob(reportId: string): Promise<JobData | null> {
  const { data, error } = await getSupabase()
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (error || !data) return null

  return {
    reportId: data.id,
    status: data.status,
    clientName: data.client_name,
    dateFrom: data.date_from,
    dateTo: data.date_to,
    keywords: data.keywords,
    hashtags: data.hashtags,
    accounts: data.accounts,
    selectedNetworks: data.selected_networks,
    apifyRunIds: data.apify_run_ids,
    apifyCompletedRuns: data.apify_completed_runs,
    processedRunIds: data.processed_run_ids,
    error: data.error,
    pdfUrl: data.pdf_url,
    generationCostUSD: data.generation_cost_usd ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

export async function updateJobStatus(reportId: string, patch: Partial<JobData>): Promise<JobData> {
  const existing = await loadJob(reportId)
  if (!existing) throw new Error(`Job ${reportId} not found`)
  
  const updated: JobData = { ...existing, ...patch, updatedAt: new Date().toISOString() }
  await saveJob(updated)
  return updated
}

export async function saveRawData(reportId: string, data: unknown): Promise<void> {
  const { error } = await getSupabase()
    .from('reports')
    .update({ raw_data: data, updated_at: new Date().toISOString() })
    .eq('id', reportId)
  
  if (error) throw error
}

export async function getRawData(reportId: string): Promise<unknown[]> {
  const { data, error } = await getSupabase()
    .from('reports')
    .select('raw_data')
    .eq('id', reportId)
    .single()

  if (error || !data) return []
  return (data.raw_data as unknown[]) ?? []
}

export async function loadRawData(reportId: string): Promise<unknown[]> {
  const data = await getRawData(reportId)
  if (!data || data.length === 0) throw new Error('Raw data not found')
  return data
}

export async function saveAnalysis(reportId: string, analysis: unknown): Promise<void> {
  const { error } = await getSupabase()
    .from('reports')
    .update({ analysis: analysis, updated_at: new Date().toISOString() })
    .eq('id', reportId)

  if (error) throw error
}

export async function loadAnalysis(reportId: string): Promise<any | null> {
  const { data, error } = await getSupabase()
    .from('reports')
    .select('analysis')
    .eq('id', reportId)
    .single()

  if (error || !data) return null
  return data.analysis
}

export async function savePdf(reportId: string, buffer: Buffer): Promise<string> {
  // Upload to Supabase Storage
  const { data, error } = await getSupabase().storage
    .from('reports')
    .upload(`${reportId}/report.pdf`, buffer, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (error) throw error

  // Get Public URL
  const { data: { publicUrl } } = getSupabase().storage
    .from('reports')
    .getPublicUrl(`${reportId}/report.pdf`)

  // Update record with PDF URL
  await getSupabase()
    .from('reports')
    .update({ pdf_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', reportId)

  return publicUrl
}

export async function listReports(): Promise<JobData[]> {
  const { data, error } = await getSupabase()
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map(row => ({
    reportId: row.id,
    status: row.status,
    clientName: row.client_name,
    dateFrom: row.date_from,
    dateTo: row.date_to,
    keywords: row.keywords,
    hashtags: row.hashtags,
    accounts: row.accounts,
    selectedNetworks: row.selected_networks,
    apifyRunIds: row.apify_run_ids,
    apifyCompletedRuns: row.apify_completed_runs,
    processedRunIds: row.processed_run_ids,
    error: row.error,
    pdfUrl: row.pdf_url,
    generationCostUSD: row.generation_cost_usd ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }))
}
