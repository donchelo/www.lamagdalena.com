// Script to kill stuck reports: abort Apify runs and mark as error in Supabase
// Run with: node --env-file=.env.local scripts/kill-stuck-reports.mjs
import { createClient } from '@supabase/supabase-js'

const APIFY_TOKEN = process.env.APIFY_API_TOKEN
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const STUCK_STATUSES = ['queued', 'scraping', 'scraping_posts', 'scraping_comments', 'analyzing', 'generating_pdf']

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function abortApifyRun(runId) {
  const res = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/abort?token=${APIFY_TOKEN}`,
    { method: 'POST' }
  )
  const data = await res.json()
  return { ok: res.ok, status: data?.data?.status ?? data?.error?.message ?? String(res.status) }
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son necesarios.')
    process.exit(1)
  }

  console.log('Buscando reportes atascados en Supabase...\n')

  const { data: stuckJobs, error } = await supabase
    .from('reports')
    .select('*')
    .in('status', STUCK_STATUSES)

  if (error) {
    console.error('Error fetching jobs:', error)
    return
  }

  console.log(`Total reportes atascados encontrados: ${stuckJobs.length}`)

  for (const job of stuckJobs) {
    console.log(`  - [${job.status}] ${job.client_name} | ${job.date_from}→${job.date_to} | runs: ${JSON.stringify(job.apify_run_ids ?? {})}`)
  }

  if (stuckJobs.length === 0) {
    console.log('\nNo hay reportes atascados.')
    return
  }

  console.log('\nMatando reportes...')
  for (const job of stuckJobs) {
    const reportId = job.id
    console.log(`\n[${reportId}] ${job.client_name} (${job.status})`)

    // Abort all Apify runs
    const runIds = Object.values(job.apify_run_ids ?? {})
    for (const runId of runIds) {
      if (!runId || runId === 'simulated-run-id') {
        console.log(`  Skipping run ${runId}`)
        continue
      }
      const result = await abortApifyRun(runId)
      console.log(`  Apify abort ${runId}: ${result.ok ? 'OK' : 'FAIL'} → ${result.status}`)
    }

    // Mark as error in Supabase
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        status: 'error',
        error: 'Terminado manualmente',
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)

    if (updateError) {
      console.error(`  Error marcando como error en Supabase:`, updateError)
    } else {
      console.log(`  ✓ Marcado como error en Supabase`)
    }
  }

  console.log('\nListo. Todos los reportes atascados han sido matados.')
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})

