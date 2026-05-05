// Script to kill stuck reports: abort Apify runs and mark as error
// Run with: node --env-file=.env.local scripts/kill-stuck-reports.mjs
import { list, put } from '@vercel/blob'

const APIFY_TOKEN = process.env.APIFY_API_TOKEN
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN
const STUCK_STATUSES = ['queued', 'scraping', 'scraping_posts', 'scraping_comments', 'analyzing']

async function fetchJson(blobUrl) {
  const res = await fetch(blobUrl, {
    headers: { Authorization: `Bearer ${BLOB_TOKEN}` },
  })
  if (!res.ok) return null
  return res.json()
}

async function abortApifyRun(runId) {
  const res = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/abort?token=${APIFY_TOKEN}`,
    { method: 'POST' }
  )
  const data = await res.json()
  return { ok: res.ok, status: data?.data?.status ?? data?.error?.message ?? String(res.status) }
}

async function main() {
  console.log('Listando todos los reportes en blob...\n')

  const { blobs } = await list({ prefix: 'reports/', token: BLOB_TOKEN })
  const jobBlobs = blobs.filter(b => b.pathname.endsWith('/job.json'))
  console.log(`Total job blobs encontrados: ${jobBlobs.length}`)

  const stuckJobs = []
  for (const blob of jobBlobs) {
    const job = await fetchJson(blob.url)
    if (!job) continue
    if (STUCK_STATUSES.includes(job.status)) {
      stuckJobs.push(job)
    }
  }

  console.log(`\nReportes atascados (${stuckJobs.length}):`)
  for (const job of stuckJobs) {
    console.log(`  - [${job.status}] ${job.clientName} | ${job.dateFrom}→${job.dateTo} | runs: ${JSON.stringify(job.apifyRunIds ?? {})}`)
  }

  if (stuckJobs.length === 0) {
    console.log('\nNo hay reportes atascados.')
    return
  }

  console.log('\nMatando reportes...')
  for (const job of stuckJobs) {
    console.log(`\n[${job.reportId}] ${job.clientName} (${job.status})`)

    // Abort all Apify runs
    const runIds = Object.values(job.apifyRunIds ?? {})
    for (const runId of runIds) {
      if (!runId || runId === 'simulated-run-id') {
        console.log(`  Skipping run ${runId}`)
        continue
      }
      const result = await abortApifyRun(runId)
      console.log(`  Apify abort ${runId}: ${result.ok ? 'OK' : 'FAIL'} → ${result.status}`)
    }

    // Mark as error in blob
    const updated = {
      ...job,
      status: 'error',
      error: 'Terminado manualmente',
      updatedAt: new Date().toISOString(),
    }
    await put(`reports/${job.reportId}/job.json`, JSON.stringify(updated), {
      access: 'private',
      contentType: 'application/json',
      allowOverwrite: true,
      token: BLOB_TOKEN,
    })
    console.log(`  ✓ Marcado como error en blob`)
  }

  console.log('\nListo. Todos los reportes atascados han sido matados.')
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
