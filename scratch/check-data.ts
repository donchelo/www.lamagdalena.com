import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkLastReport() {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error fetching last report:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('No reports found.')
    return
  }

  const report = data[0]
  console.log('--- Report Info ---')
  console.log('ID:', report.id)
  console.log('Client:', report.client_name)
  console.log('Status:', report.status)
  console.log('Networks:', report.selected_networks)
  console.log('Keywords:', report.keywords)
  console.log('Hashtags:', report.hashtags)
  console.log('Accounts:', report.accounts)
  console.log('Raw Data Count:', Array.isArray(report.raw_data) ? report.raw_data.length : 'Not an array')
  
  if (Array.isArray(report.raw_data) && report.raw_data.length > 0) {
    console.log('First Item Sample:', JSON.stringify(report.raw_data[0], null, 2).slice(0, 500))
  } else {
    console.log('Raw Data is empty or null')
  }
}

checkLastReport()
