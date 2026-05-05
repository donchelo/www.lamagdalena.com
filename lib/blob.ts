import { put, list } from '@vercel/blob'

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
  createdAt: string
  updatedAt: string
}

// Derives the blob store hostname from the token — avoids list() calls for reads.
// Token format: vercel_blob_rw_<storeId>_<secretKey>
// Private blob URL: https://<storeId>.vercel-storage.com/<pathname>
function getBlobUrl(pathname: string): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN ?? ''
  const parts = token.split('_')
  // parts: ['vercel','blob','rw','<storeId>','<secretKey>']
  const storeId = parts.slice(3, -1).join('_')
  return `https://${storeId}.vercel-storage.com/${pathname}`
}

async function fetchBlobJson(pathname: string): Promise<unknown | null> {
  const url = getBlobUrl(pathname)
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    // No-store ensures we always get fresh data (blobs don't cache)
    cache: 'no-store',
  })
  if (res.status === 404 || res.status === 403) return null
  if (!res.ok) return null
  return res.json()
}

export async function saveJob(job: JobData): Promise<void> {
  await put(`reports/${job.reportId}/job.json`, JSON.stringify(job), {
    access: 'private',
    contentType: 'application/json',
    allowOverwrite: true,
  })
}

export async function loadJob(reportId: string): Promise<JobData | null> {
  return fetchBlobJson(`reports/${reportId}/job.json`) as Promise<JobData | null>
}

export async function updateJobStatus(reportId: string, patch: Partial<JobData>): Promise<JobData> {
  const existing = await loadJob(reportId)
  if (!existing) throw new Error(`Job ${reportId} not found`)
  const updated: JobData = { ...existing, ...patch, updatedAt: new Date().toISOString() }
  await saveJob(updated)
  return updated
}

export async function saveRawData(reportId: string, data: unknown): Promise<void> {
  await put(`reports/${reportId}/raw-data.json`, JSON.stringify(data), {
    access: 'private',
    contentType: 'application/json',
    allowOverwrite: true,
  })
}

// Returns empty array if not found — safe for first webhook call
export async function getRawData(reportId: string): Promise<unknown[]> {
  const data = await fetchBlobJson(`reports/${reportId}/raw-data.json`)
  return (data as unknown[] | null) ?? []
}

// Throws if not found — use for retry where data must exist
export async function loadRawData(reportId: string): Promise<unknown[]> {
  const data = await fetchBlobJson(`reports/${reportId}/raw-data.json`)
  if (!data) throw new Error('Raw data not found')
  return data as unknown[]
}

export async function saveAnalysis(reportId: string, analysis: unknown): Promise<void> {
  await put(`reports/${reportId}/analysis.json`, JSON.stringify(analysis), {
    access: 'private',
    contentType: 'application/json',
    allowOverwrite: true,
  })
}

export async function loadAnalysis(reportId: string): Promise<any | null> {
  return fetchBlobJson(`reports/${reportId}/analysis.json`)
}

export async function savePdf(reportId: string, buffer: Buffer): Promise<string> {
  const blob = await put(`reports/${reportId}/report.pdf`, buffer, {
    access: 'private',
    contentType: 'application/pdf',
    allowOverwrite: true,
  })
  return blob.url
}

export async function listReports(): Promise<JobData[]> {
  // list() is unavoidable here — we need to enumerate all reports
  const { blobs } = await list({ prefix: 'reports/' })
  const jobBlobs = blobs.filter(b => b.pathname.endsWith('/job.json'))

  const jobs: JobData[] = []
  await Promise.all(
    jobBlobs.map(async blob => {
      try {
        // Use direct fetch (no extra list() per report)
        const res = await fetch(blob.url, {
          headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
        })
        const job: JobData = await res.json()
        jobs.push(job)
      } catch {
        // skip malformed
      }
    })
  )

  return jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
