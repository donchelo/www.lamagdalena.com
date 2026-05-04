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
  status: 'queued' | 'scraping' | 'analyzing' | 'generating_pdf' | 'complete' | 'error'
  error?: string
  pdfUrl?: string
  createdAt: string
  updatedAt: string
}

async function fetchJson(prefix: string): Promise<unknown | null> {
  const { blobs } = await list({ prefix })
  const blob = blobs.find(b => b.pathname === prefix)
  if (!blob) return null
  const res = await fetch(blob.url)
  return res.json()
}

export async function saveJob(job: JobData): Promise<void> {
  await put(`reports/${job.reportId}/job.json`, JSON.stringify(job), {
    access: 'public',
    contentType: 'application/json',
    allowOverwrite: true,
  })
}

export async function loadJob(reportId: string): Promise<JobData | null> {
  return fetchJson(`reports/${reportId}/job.json`) as Promise<JobData | null>
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
    access: 'public',
    contentType: 'application/json',
    allowOverwrite: true,
  })
}

export async function loadRawData(reportId: string): Promise<unknown> {
  const data = await fetchJson(`reports/${reportId}/raw-data.json`)
  if (!data) throw new Error('Raw data not found')
  return data
}

export async function saveAnalysis(reportId: string, analysis: unknown): Promise<void> {
  await put(`reports/${reportId}/analysis.json`, JSON.stringify(analysis), {
    access: 'public',
    contentType: 'application/json',
    allowOverwrite: true,
  })
}

export async function savePdf(reportId: string, buffer: Buffer): Promise<string> {
  const blob = await put(`reports/${reportId}/report.pdf`, buffer, {
    access: 'public',
    contentType: 'application/pdf',
    allowOverwrite: true,
  })
  return blob.url
}

export async function listReports(): Promise<JobData[]> {
  const { blobs } = await list({ prefix: 'reports/' })
  const jobBlobs = blobs.filter(b => b.pathname.endsWith('/job.json'))
  const jobs: JobData[] = []

  await Promise.all(
    jobBlobs.map(async blob => {
      try {
        const res = await fetch(blob.url)
        const job: JobData = await res.json()
        jobs.push(job)
      } catch {
        // skip malformed
      }
    })
  )

  return jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
