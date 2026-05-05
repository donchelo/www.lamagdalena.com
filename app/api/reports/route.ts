import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { saveJob, listReports, type JobData } from '@/lib/blob'
import { startActorRun } from '@/lib/apify'
import { getBaseUrl } from '@/lib/url'

export async function GET() {
  try {
    const reports = await listReports()
    return NextResponse.json(reports.slice(0, 20))
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    console.log(`[API] Creating job ${reportId} for ${clientName}`)
    try {
      await saveJob(job)
      console.log(`[API] Job saved to blob storage`)
    } catch (err) {
      console.error(`[API] Error saving job to blob:`, err)
      throw err
    }

    const webhookUrl = `${getBaseUrl()}/api/reports/${reportId}/apify-webhook?secret=${process.env.APIFY_WEBHOOK_SECRET}`
    const apifyInput = { keywords, hashtags, accounts, dateFrom, dateTo, maxResults: 1000 }
    const apifyRunIds: Record<string, string> = {}

    console.log(`[API] Starting actor runs for: ${selectedNetworks.join(', ')}`)
    await Promise.all(
      selectedNetworks.map(async (network: string) => {
        try {
          console.log(`[API] Triggering Apify actor for ${network}...`)
          const runId = await startActorRun(network, apifyInput, webhookUrl)
          apifyRunIds[network] = runId
          console.log(`[API] Started ${network} run: ${runId}`)
        } catch (err) {
          console.error(`[API] Failed to start Apify actor for ${network}:`, err)
          throw err
        }
      })
    )

    await saveJob({ ...job, status: 'scraping_posts', apifyRunIds, updatedAt: new Date().toISOString() })
    console.log(`[API] Job ${reportId} updated to scraping_posts status`)

    return NextResponse.json({ reportId }, { status: 201 })
  } catch (error) {
    console.error('[API ERROR]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
