import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { saveJob, type JobData } from '@/lib/blob'
import { startActorRun } from '@/lib/apify'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { clientName, dateFrom, dateTo, keywords, hashtags, accounts, selectedNetworks } = body

  if (!clientName || !dateFrom || !dateTo || !selectedNetworks?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const reportId = randomUUID()
  const now = new Date().toISOString()

  const job: JobData = {
    reportId,
    clientName,
    dateFrom,
    dateTo,
    keywords: keywords ?? [],
    hashtags: hashtags ?? [],
    accounts: accounts ?? [],
    selectedNetworks,
    status: 'queued',
    createdAt: now,
    updatedAt: now,
  }

  await saveJob(job)

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  const webhookUrl = `${baseUrl}/api/reports/${reportId}/apify-webhook`

  const apifyInput = { keywords, hashtags, accounts, dateFrom, dateTo, maxResults: 100 }
  const apifyRunIds: Record<string, string> = {}

  await Promise.all(
    selectedNetworks.map(async (network: string) => {
      try {
        const runId = await startActorRun(network, apifyInput, webhookUrl)
        apifyRunIds[network] = runId
      } catch (err) {
        console.error(`Failed to start Apify actor for ${network}:`, err)
      }
    })
  )

  await saveJob({ ...job, status: 'scraping', apifyRunIds, updatedAt: new Date().toISOString() })

  return NextResponse.json({ reportId }, { status: 201 })
}
