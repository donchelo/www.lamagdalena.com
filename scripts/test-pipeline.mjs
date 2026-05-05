/**
 * Pipeline test — mide el tiempo de cada etapa para un reporte de Instagram.
 * Uso: node --env-file=.env.local scripts/test-pipeline.mjs
 */
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const APIFY_TOKEN = process.env.APIFY_API_TOKEN
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

// ─── Configuración del test ────────────────────────────────────────────────
const ACCOUNT    = 'lamagdalena___'  // 3 guiones bajos
const DATE_FROM  = '2025-10-01'
const DATE_TO    = '2025-12-31'
const MAX_POSTS  = 200
const MAX_COMMENTS_PER_RUN = 300
const POLL_INTERVAL_MS = 8000

// ─── Helpers ──────────────────────────────────────────────────────────────
function timer() {
  const t0 = Date.now()
  return () => {
    const ms = Date.now() - t0
    return ms < 60000 ? `${(ms / 1000).toFixed(1)}s` : `${(ms / 60000).toFixed(1)}min`
  }
}

async function apifyPost(path, body) {
  const r = await fetch(`https://api.apify.com/v2${path}?token=${APIFY_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(`Apify ${path}: ${JSON.stringify(data)}`)
  return data.data
}

async function apifyGet(path) {
  const r = await fetch(`https://api.apify.com/v2${path}?token=${APIFY_TOKEN}`)
  const data = await r.json()
  if (!r.ok) throw new Error(`Apify GET ${path}: ${JSON.stringify(data)}`)
  return data.data
}

async function waitForRun(runId, label) {
  process.stdout.write(`  Esperando ${label} (${runId})`)
  while (true) {
    const info = await apifyGet(`/actor-runs/${runId}`)
    const s = info.status
    if (s === 'SUCCEEDED') { process.stdout.write(' ✓\n'); return info }
    if (s === 'FAILED' || s === 'ABORTED' || s === 'TIMED-OUT') {
      process.stdout.write(` ✗ (${s})\n`)
      throw new Error(`Run ${runId} terminó con: ${s}`)
    }
    process.stdout.write('.')
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
  }
}

async function fetchDataset(datasetId, limit = 2000) {
  const r = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&limit=${limit}&format=json`
  )
  if (!r.ok) throw new Error(`Dataset ${datasetId}: ${r.status}`)
  return r.json()
}

function sep(title) {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`  ${title}`)
  console.log('─'.repeat(60))
}

// ─── ETAPA 1: Instagram Post Scraper ──────────────────────────────────────
async function testStage1() {
  sep('ETAPA 1 — Apify: Instagram Post Scraper')
  const elapsed = timer()

  console.log(`  Input: username=['${ACCOUNT}'], onlyPostsNewerThan=${DATE_FROM}`)
  const run = await apifyPost('/acts/apify~instagram-post-scraper/runs', {
    username: [ACCOUNT],
    resultsLimit: MAX_POSTS,
    onlyPostsNewerThan: DATE_FROM,
    skipPinnedPosts: false,
  })
  console.log(`  Run ID: ${run.id}`)

  const info = await waitForRun(run.id, 'posts')
  const items = await fetchDataset(info.defaultDatasetId)

  const posts = items.filter(i => i.shortCode || i.likesCount !== undefined || i.displayUrl)
  const t = elapsed()
  console.log(`  Posts encontrados: ${items.length} (${posts.length} con shortCode)`)
  console.log(`  Likes totales: ${posts.reduce((s, i) => s + (i.likesCount ?? 0), 0).toLocaleString('es-CO')}`)
  console.log(`  Comentarios totales: ${posts.reduce((s, i) => s + (i.commentsCount ?? 0), 0).toLocaleString('es-CO')}`)
  console.log(`  ⏱  Tiempo etapa 1: ${t}`)

  if (posts.length > 0) {
    console.log(`\n  Muestra del primer post:`)
    const p = posts[0]
    console.log(`    URL:      ${p.url ?? p.directUrl ?? 'N/A'}`)
    console.log(`    Likes:    ${p.likesCount ?? 0}`)
    console.log(`    Caption:  ${String(p.caption ?? '').slice(0, 80)}...`)
    console.log(`    Fecha:    ${p.timestamp ?? p.postedAt ?? 'N/A'}`)
  }

  // Guardar para las siguientes etapas
  writeFileSync(resolve(__dir, '../temp_stage1.json'), JSON.stringify(items, null, 2))
  console.log(`  Datos guardados en temp_stage1.json`)

  return { items, elapsed: t }
}

// ─── ETAPA 2: Instagram Comment Scraper ───────────────────────────────────
async function testStage2(stage1Items) {
  sep('ETAPA 2 — Apify: Instagram Comment Scraper')
  const elapsed = timer()

  const postUrls = stage1Items
    .map(i => i.url || i.directUrl || i.link)
    .filter(Boolean)
    .filter(u => u.includes('instagram.com/p/'))
    .slice(0, 100) // limitar para el test

  console.log(`  URLs de posts disponibles: ${postUrls.length}`)

  if (postUrls.length === 0) {
    console.log('  ⚠️  Sin URLs de posts — saltando Stage 2')
    return { items: [], elapsed: '0s' }
  }

  const run = await apifyPost('/acts/apify~instagram-comment-scraper/runs', {
    directUrls: postUrls,
    resultsLimit: MAX_COMMENTS_PER_RUN,
    includeNestedComments: false,
    isNewestComments: false,
  })
  console.log(`  Run ID: ${run.id}`)
  console.log(`  Posts enviados al scraper de comentarios: ${postUrls.length}`)

  const info = await waitForRun(run.id, 'comments')
  const items = await fetchDataset(info.defaultDatasetId)

  const t = elapsed()
  console.log(`  Comentarios obtenidos: ${items.length}`)
  console.log(`  ⏱  Tiempo etapa 2: ${t}`)

  if (items.length > 0) {
    console.log(`\n  Muestra de comentarios:`)
    items.slice(0, 3).forEach((c, i) => {
      console.log(`    ${i+1}. "${String(c.text ?? '').slice(0, 80)}"`)
    })
  }

  writeFileSync(resolve(__dir, '../temp_stage2.json'), JSON.stringify(items, null, 2))
  console.log(`  Datos guardados en temp_stage2.json`)

  return { items, elapsed: t }
}

// ─── ETAPA 3: Análisis con Claude ─────────────────────────────────────────
async function testStage3(posts, comments) {
  sep('ETAPA 3 — Claude: Análisis estratégico')
  const elapsed = timer()

  // Importar dependencias del proyecto
  const { analyzeData } = await import('../lib/claude.ts')

  const combined = [...posts, ...comments]
  console.log(`  Items totales enviados a Claude: ${combined.length} (${posts.length} posts + ${comments.length} comentarios)`)

  const analysis = await analyzeData(combined, {
    clientName: `@${ACCOUNT}`,
    dateFrom: DATE_FROM,
    dateTo: DATE_TO,
    selectedNetworks: ['instagram'],
    keywords: [],
    hashtags: [],
  })

  const t = elapsed()
  console.log(`  ⏱  Tiempo etapa 3: ${t}`)
  console.log(`\n  Resumen ejecutivo (primeras 200 chars):`)
  console.log(`    "${analysis.executiveSummary.slice(0, 200)}..."`)
  console.log(`  Posts detectados: ${analysis.volumeMetrics.totalPosts}`)
  console.log(`  Engagement rate: ${analysis.engagementMetrics.avgEngagementRate}%`)
  console.log(`  Sentimiento: ${analysis.sentimentAnalysis.positivePercent}% pos / ${analysis.sentimentAnalysis.negativePercent}% neg`)
  console.log(`  Key insights: ${analysis.keyInsights.length}`)
  console.log(`  Recomendaciones: ${analysis.recommendations.length}`)

  writeFileSync(resolve(__dir, '../temp_analysis.json'), JSON.stringify(analysis, null, 2))
  console.log(`  Análisis guardado en temp_analysis.json`)

  return { analysis, elapsed: t }
}

// ─── ETAPA 4: Generación de PDF ────────────────────────────────────────────
async function testStage4(analysis) {
  sep('ETAPA 4 — PDF: Generación del reporte')
  const elapsed = timer()

  const { renderReportPdf } = await import('../lib/pdf/render.tsx')

  const fakeJob = {
    reportId: 'test-pipeline',
    clientName: `@${ACCOUNT}`,
    dateFrom: DATE_FROM,
    dateTo: DATE_TO,
    selectedNetworks: ['instagram'],
    keywords: [],
    hashtags: [],
    accounts: [ACCOUNT],
    status: 'complete',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const buffer = await renderReportPdf({ job: fakeJob, analysis })
  const outPath = resolve(__dir, '../temp_report.pdf')
  writeFileSync(outPath, buffer)

  const t = elapsed()
  const sizeMB = (buffer.length / 1024 / 1024).toFixed(2)
  console.log(`  PDF generado: ${sizeMB} MB`)
  console.log(`  Guardado en: temp_report.pdf`)
  console.log(`  ⏱  Tiempo etapa 4: ${t}`)

  return { elapsed: t }
}

// ─── MAIN ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  TEST DE PIPELINE — Instagram @${ACCOUNT}`)
  console.log(`  Período: ${DATE_FROM} → ${DATE_TO}`)
  console.log(`${'═'.repeat(60)}`)

  if (!APIFY_TOKEN) { console.error('ERROR: APIFY_API_TOKEN no configurado'); process.exit(1) }
  if (!ANTHROPIC_KEY) { console.error('ERROR: ANTHROPIC_API_KEY no configurado'); process.exit(1) }

  const totalTimer = timer()
  const results = {}

  try {
    // Etapa 1 siempre corre
    const s1 = await testStage1()
    results.stage1 = s1.elapsed

    // Etapa 2
    const s2 = await testStage2(s1.items)
    results.stage2 = s2.elapsed

    // Etapa 3
    const allData = [...s1.items, ...s2.items]
    const s3 = await testStage3(s1.items, s2.items)
    results.stage3 = s3.elapsed

    // Etapa 4 (puede fallar si no hay env de React)
    try {
      const s4 = await testStage4(s3.analysis)
      results.stage4 = s4.elapsed
    } catch (e) {
      console.log(`  ⚠️  PDF requiere entorno Next.js completo: ${e.message}`)
      results.stage4 = 'N/A (requiere Next.js)'
    }

  } catch (err) {
    console.error(`\n❌ Error en pipeline: ${err.message}`)
    console.error(err.stack)
  }

  sep('RESUMEN DE TIEMPOS')
  console.log(`  Etapa 1 — Posts scraping:       ${results.stage1 ?? '—'}`)
  console.log(`  Etapa 2 — Comments scraping:    ${results.stage2 ?? '—'}`)
  console.log(`  Etapa 3 — Análisis Claude:      ${results.stage3 ?? '—'}`)
  console.log(`  Etapa 4 — Generación PDF:       ${results.stage4 ?? '—'}`)
  console.log(`  ──────────────────────────────────────────`)
  console.log(`  TOTAL:                           ${totalTimer()}`)
  console.log()
}

main().catch(e => { console.error(e); process.exit(1) })
