import { NextRequest, NextResponse } from 'next/server'
import { getSovJob, appendSovRawData, updateSovJob } from '@/lib/sov-supabase'
import { getRunInfo, fetchDatasetItems } from '@/lib/apify'
import { calculateSov, generateSovInsights } from '@/lib/sov-calculator'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ sovId: string }> }
) {
  const { sovId } = await params
  const job = await getSovJob(sovId)
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (job.status === 'complete' || job.status === 'error') {
    return NextResponse.json({ message: 'Job already finished', status: job.status })
  }

  console.log(`[SOV Recover] Checking ${Object.keys(job.apifyRunIds).length} runs for job ${sovId}`)

  // Check every run that hasn't been completed yet
  const pendingRunKeys = Object.keys(job.apifyRunIds).filter(
    k => !job.apifyCompletedRuns.includes(k)
  )

  console.log(`[SOV Recover] Pending runs: ${pendingRunKeys.join(', ')}`)

  for (const runKey of pendingRunKeys) {
    const runId = job.apifyRunIds[runKey]
    try {
      const runInfo = await getRunInfo(runId)
      const terminal = runInfo.status === 'SUCCEEDED' || runInfo.status === 'FAILED' ||
        runInfo.status === 'TIMED-OUT' || runInfo.status === 'ABORTED'

      if (!terminal) {
        console.log(`[SOV Recover] Run ${runKey} (${runId}) still ${runInfo.status}, skipping`)
        continue
      }

      console.log(`[SOV Recover] Run ${runKey} is ${runInfo.status} — fetching data`)
      let items: unknown[] = []
      if (runInfo.status === 'SUCCEEDED' && runInfo.defaultDatasetId) {
        try {
          items = await fetchDatasetItems(runInfo.defaultDatasetId, 1000)
        } catch (e) {
          console.error(`[SOV Recover] Failed to fetch dataset for ${runKey}:`, e)
        }
      }
      await appendSovRawData(sovId, runKey, items, runKey)
      console.log(`[SOV Recover] Marked ${runKey} complete with ${items.length} items`)
    } catch (e) {
      console.error(`[SOV Recover] Error checking run ${runKey}:`, e)
    }
  }

  // Re-fetch updated job state
  const updatedJob = await getSovJob(sovId)
  if (!updatedJob) return NextResponse.json({ error: 'Job disappeared' }, { status: 500 })

  const allDone = updatedJob.apifyCompletedRuns.length >= updatedJob.totalExpectedRuns
  if (!allDone) {
    const still = Object.keys(updatedJob.apifyRunIds).filter(k => !updatedJob.apifyCompletedRuns.includes(k))
    return NextResponse.json({
      message: 'Some runs still in progress',
      completedRuns: updatedJob.apifyCompletedRuns.length,
      totalExpectedRuns: updatedJob.totalExpectedRuns,
      pendingRunKeys: still,
    })
  }

  // All done — trigger analysis
  try {
    await updateSovJob(sovId, { status: 'analyzing' })
    const partial = calculateSov(updatedJob.rawData, updatedJob.brand, updatedJob.competitors)
    const insights = await generateSovInsights(partial, updatedJob.clientName)
    await updateSovJob(sovId, {
      status: 'complete',
      analysis: { ...partial, insights },
    })
    console.log(`[SOV Recover] Analysis complete for ${sovId}`)
    return NextResponse.json({ message: 'Recovered and analysis complete' })
  } catch (e) {
    console.error(`[SOV Recover] Analysis failed:`, e)
    await updateSovJob(sovId, {
      status: 'error',
      error: e instanceof Error ? e.message : 'Error en análisis',
    })
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
