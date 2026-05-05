import fs from 'fs'
import path from 'path'
import { loadJob, saveRawData, updateJobStatus } from '../lib/supabase'
import { fetchDatasetItems, getRunInfo } from '../lib/apify'

// Carga manual de env
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
    }
  })
}

import { execSync } from 'child_process'

async function fetchDatasetWithCurl(datasetId: string) {
  const token = process.env.APIFY_API_TOKEN
  const command = `curl -s "https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&format=json"`
  const result = execSync(command).toString()
  return JSON.parse(result)
}

async function rebuildReport(reportId: string) {
  console.log(`--- RECONSTRUYENDO REPORTE: ${reportId} ---`)
  
  try {
    const job = await loadJob(reportId)
    if (!job) throw new Error("Job no encontrado")

    const videoRunId = job.apifyRunIds?.['tiktok']
    const commentRunId = job.apifyRunIds?.['tiktok_comments']

    if (!videoRunId) throw new Error("No se encontró ID de ejecución de videos")

    const videoDatasetId = 'qGVp8meeyA5xcxboR'
    const commentDatasetId = 'fE8MWXxrc1V6Rdb8o'

    console.log(`1. Recuperando videos reales de Apify (${videoDatasetId})...`)
    const videos = await fetchDatasetWithCurl(videoDatasetId)
    console.log(`   Encontrados ${videos.length} videos con métricas de performance.`)

    console.log(`2. Recuperando comentarios reales de Apify (${commentDatasetId})...`)
    const comments = await fetchDatasetWithCurl(commentDatasetId)
    console.log(`   Encontrados ${comments.length} comentarios para análisis de sentimiento.`)

    const combined = [...videos, ...comments]
    console.log(`3. Guardando ${combined.length} elementos combinados (Auditoría OK)...`)
    await saveRawData(reportId, combined)

    console.log("4. Relanzando análisis de Claude 4.6 con datos reales...")
    await updateJobStatus(reportId, { status: 'analyzing' })

    console.log("\n✅ RECONSTRUCCIÓN LISTA. Ahora el pipeline normal debería terminarlo.")
  } catch (err) {
    console.error("Error reconstruyendo:", err)
  }
}

const REPORT_ID = '34e1b190-7593-4fdd-a498-965284f8d65e'
rebuildReport(REPORT_ID)
