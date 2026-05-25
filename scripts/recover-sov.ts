import { createClient } from '@supabase/supabase-js'
import { calculateSov, generateSovInsights } from '../lib/sov-calculator'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOV_ID = process.argv[2] ?? '871d56eb-ca84-44fb-b03e-e8b230e55c0b'

async function run() {
  console.log(`Recovering SOV job: ${SOV_ID}`)
  const { data } = await sb.from('sov_reports').select('*').eq('id', SOV_ID).single()
  if (!data) { console.error('Job not found'); process.exit(1) }

  console.log('rawData keys:', Object.keys(data.raw_data as object))
  for (const [k, v] of Object.entries(data.raw_data as Record<string, unknown[]>)) {
    console.log(`  ${k}: ${v.length} items`)
  }

  await sb.from('sov_reports').update({ status: 'analyzing', updated_at: new Date().toISOString() }).eq('id', SOV_ID)
  console.log('→ status: analyzing')

  const partial = calculateSov(data.raw_data as Record<string, unknown[]>, data.brand, data.competitors)
  console.log('entities:', partial.entities.map(e => `${e.name}: ${e.postCount} posts, SOV ${e.sovMentions}%`).join(', '))

  console.log('→ generating insights...')
  const insights = await generateSovInsights(partial, data.client_name as string)
  console.log(`insights: ${insights.length} chars`)

  const { error } = await sb.from('sov_reports').update({
    status: 'complete',
    analysis: { ...partial, insights },
    updated_at: new Date().toISOString(),
  }).eq('id', SOV_ID)

  if (error) { console.error('Update error:', error); process.exit(1) }
  console.log('✓ Job completed successfully')
}

run().catch(e => { console.error(e.message ?? e); process.exit(1) })
