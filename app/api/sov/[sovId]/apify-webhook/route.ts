import { NextRequest, NextResponse } from 'next/server'
import { getSovJob, updateSovJob, appendSovRawData } from '@/lib/sov-supabase'
import { fetchDatasetItems, getRunCostUsd, getRunInfo } from '@/lib/apify'
import { calculateSov, generateSovInsights } from '@/lib/sov-calculator'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sovId: string }> }
) {
  const { sovId } = await params

  // Validate webhook secret
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.APIFY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = body.eventType as string
  const resource = body.resource as Record<string, unknown> | undefined
  const runId = (body.actorRunId ?? resource?.id) as string | undefined
  const datasetId = (body.defaultDatasetId ?? resource?.defaultDatasetId) as string | undefined

  console.log(`[SOV Webhook] ${sovId} — event: ${eventType}, runId: ${runId}`)

  if (!runId) {
    return NextResponse.json({ ok: true, skipped: 'no runId' })
  }

  const job = await getSovJob(sovId)
  if (!job) {
    console.error(`[SOV Webhook] Job ${sovId} not found`)
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // Identify which entity×network this run belongs to
  const runKey = Object.entries(job.apifyRunIds).find(([, id]) => id === runId)?.[0]
  if (!runKey) {
    console.warn(`[SOV Webhook] Run ${runId} not found in apifyRunIds for job ${sovId}`)
    return NextResponse.json({ ok: true, skipped: 'unknown run' })
  }

  if (eventType === 'ACTOR.RUN.FAILED') {
    console.error(`[SOV Webhook] Run ${runId} (${runKey}) failed`)
    const { completedRuns, totalExpected } = await appendSovRawData(sovId, runKey, [], runKey)
    if (completedRuns.length >= totalExpected) {
      await triggerAnalysis(sovId)
    }
    return NextResponse.json({ ok: true })
  }

  if (eventType !== 'ACTOR.RUN.SUCCEEDED') {
    return NextResponse.json({ ok: true, skipped: 'non-terminal event' })
  }

  // Fetch dataset items — prefer datasetId from payload, fallback to getRunInfo
  let resolvedDatasetId = datasetId
  if (!resolvedDatasetId && runId) {
    try {
      const runInfo = await getRunInfo(runId)
      resolvedDatasetId = runInfo.defaultDatasetId
    } catch (err) {
      console.error(`[SOV Webhook] Could not resolve datasetId for run ${runId}:`, err)
    }
  }
  let items: unknown[] = []
  if (resolvedDatasetId) {
    try {
      items = await fetchDatasetItems(resolvedDatasetId, 1000)
      console.log(`[SOV Webhook] Fetched ${items.length} items for ${runKey}`)
    } catch (err) {
      console.error(`[SOV Webhook] Failed to fetch dataset for ${runKey}:`, err)
    }
  } else {
    console.error(`[SOV Webhook] No datasetId available for ${runKey}, storing 0 items`)
  }

  const { completedRuns, totalExpected } = await appendSovRawData(sovId, runKey, items, runKey)
  console.log(`[SOV Webhook] ${completedRuns.length}/${totalExpected} runs completed`)

  if (completedRuns.length >= totalExpected) {
    await triggerAnalysis(sovId)
  }

  return NextResponse.json({ ok: true })
}

async function triggerAnalysis(sovId: string) {
  try {
    await updateSovJob(sovId, { status: 'analyzing' })
    console.log(`[SOV] Starting analysis for ${sovId}`)

    const job = await getSovJob(sovId)
    if (!job) throw new Error('Job disappeared during analysis')

    const partialAnalysis = calculateSov(job.rawData, job.brand, job.competitors)
    const insights = await generateSovInsights(partialAnalysis, job.clientName)

    // Sum up costs from all runs
    const costs = await Promise.all(
      Object.values(job.apifyRunIds).map(runId => getRunCostUsd(runId))
    )
    const totalCost = costs.reduce((sum, c) => sum + c, 0)

    await updateSovJob(sovId, {
      status: 'complete',
      analysis: { ...partialAnalysis, insights },
      generationCostUsd: Math.round(totalCost * 10000) / 10000,
    })

    console.log(`[SOV] Analysis complete for ${sovId}, cost: $${totalCost.toFixed(4)}`)
  } catch (err) {
    console.error(`[SOV] Analysis failed for ${sovId}:`, err)
    await updateSovJob(sovId, {
      status: 'error',
      error: err instanceof Error ? err.message : 'Error en análisis',
    })
  }
}
