import fs from 'fs'
import path from 'path'
import { loadJob, loadAnalysis, savePdf, updateJobStatus } from '../lib/supabase'

// Cargar .env.local manualmente para evitar problemas de shell o librerías faltantes
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
import { renderReportPdf } from '../lib/pdf/render'

async function retryPdf(reportId: string) {
  console.log(`--- REINTENTANDO GENERACIÓN DE PDF PARA: ${reportId} ---`)
  
  try {
    const job = await loadJob(reportId)
    if (!job) throw new Error("Job no encontrado")

    console.log("1. Cargando datos reales del scraping...")
    const { loadRawData } = await import('../lib/supabase')
    const rawData = await loadRawData(reportId)

    console.log(`2. Pidiendo a Claude que analice ${rawData.length} elementos...`)
    const { analyzeData } = await import('../lib/claude')
    // @ts-ignore
    const { analysis, claudeCostUSD } = await analyzeData(rawData, job)
    
    const { saveAnalysis } = await import('../lib/supabase')
    await saveAnalysis(reportId, analysis)

    console.log("3. Generando buffer de PDF profesional...")
    const pdfBuffer = await renderReportPdf({ job, analysis })

    console.log("2. Guardando en Supabase...")
    const pdfUrl = await savePdf(reportId, pdfBuffer)

    console.log("3. Marcando como COMPLETO...")
    await updateJobStatus(reportId, { 
      status: 'complete',
      generationCostUSD: claudeCostUSD
    })

    console.log("\n✅ ¡ÉXITO! Refresca tu navegador ahora.")
    console.log(`URL: http://localhost:3000/social-listening/${reportId}`)
  } catch (err) {
    console.error("Error en el reintento:", err)
  }
}

// El ID de tu reporte actual
const REPORT_ID = '34e1b190-7593-4fdd-a498-965284f8d65e'
retryPdf(REPORT_ID)
