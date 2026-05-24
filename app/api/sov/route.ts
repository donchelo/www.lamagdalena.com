import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { saveSovJob, listSovJobs, type SovJobData, type SovEntity } from '@/lib/sov-supabase'
import { startActorRun } from '@/lib/apify'
import { getBaseUrl } from '@/lib/url'

export async function GET() {
  try {
    const jobs = await listSovJobs()
    return NextResponse.json(jobs)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientName, dateFrom, dateTo, selectedNetworks, brand, competitors } = body

    if (!clientName || !dateFrom || !dateTo || !selectedNetworks?.length || !brand?.name) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const sovId = randomUUID()
    const now = new Date().toISOString()

    const brandEntity: SovEntity = {
      id: 'brand',
      name: brand.name,
      accounts: brand.accounts ?? [],
      hashtags: brand.hashtags ?? [],
      keywords: brand.keywords ?? [],
    }

    const competitorEntities: SovEntity[] = (competitors ?? []).slice(0, 5).map(
      (c: Omit<SovEntity, 'id'>, i: number) => ({
        id: `comp_${i}`,
        name: c.name,
        accounts: c.accounts ?? [],
        hashtags: c.hashtags ?? [],
        keywords: c.keywords ?? [],
      })
    )

    const allEntities = [brandEntity, ...competitorEntities]
    const webhookUrl = `${getBaseUrl()}/api/sov/${sovId}/apify-webhook?secret=${process.env.APIFY_WEBHOOK_SECRET}`

    const apifyRunIds: Record<string, string> = {}
    const launchErrors: string[] = []

    await Promise.all(
      allEntities.flatMap(entity =>
        selectedNetworks.map(async (network: string) => {
          const runKey = `${entity.id}_${network}`
          const apifyInput = {
            accounts: entity.accounts,
            hashtags: entity.hashtags,
            keywords: entity.keywords,
            dateFrom,
            dateTo,
            maxResults: 500,
          }
          try {
            const runId = await startActorRun(network, apifyInput, webhookUrl)
            apifyRunIds[runKey] = runId
          } catch (err) {
            console.error(`[SOV] Failed to start ${runKey}:`, err)
            launchErrors.push(runKey)
          }
        })
      )
    )

    const totalExpectedRuns = Object.keys(apifyRunIds).length

    if (totalExpectedRuns === 0) {
      return NextResponse.json({ error: 'No se pudo iniciar ningún scraper de Apify' }, { status: 500 })
    }

    const job: SovJobData = {
      sovId,
      status: 'scraping',
      clientName,
      dateFrom,
      dateTo,
      selectedNetworks,
      brand: brandEntity,
      competitors: competitorEntities,
      apifyRunIds,
      apifyCompletedRuns: [],
      totalExpectedRuns,
      rawData: {},
      createdAt: now,
      updatedAt: now,
    }

    await saveSovJob(job)
    console.log(`[SOV] Created job ${sovId} with ${totalExpectedRuns} runs`)

    return NextResponse.json({ sovId }, { status: 201 })
  } catch (error) {
    console.error('[SOV API ERROR]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
