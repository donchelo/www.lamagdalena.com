import fs from 'fs'
import path from 'path'

const DOCS_DIR = path.join(process.cwd(), 'data', 'proyeccion')

export interface MonthFolder {
  name: string
  pdfCount: number
  csvReady: boolean
  hasIncomeFile: boolean
  hasBankStatement: boolean
}

// ─── Financial summary types ──────────────────────────────────────────────────

export interface CsvRow {
  fecha: string; mes: string; tipo: string; numFact: string
  contraparte: string; nit: string; concepto: string
  subtotal: number; iva: number; total: number; archivo: string
}

export interface MonthlySummary {
  name: string; facturacion: number; ingresos: number; costos: number; flujoNeto: number
  margen: number; numFacturas: number
}

export interface FinancialSummary {
  months: string[]
  monthly: MonthlySummary[]
  totals: { facturacion: number; ingresos: number; costos: number; flujoNeto: number; margen: number }
  clienteIngresos: { nombre: string; total: number; pct: number }[]
  costosPorCategoria: { categoria: string; total: number; pct: number; numTrans: number }[]
  topProveedores: { nombre: string; total: number; categoria: string }[]
  iva: { cobrado: number; pagado: number; neto: number }
  facturas: CsvRow[]
  duplicados: number
}

// ─── Categorization ───────────────────────────────────────────────────────────

const CAT_KEYWORDS: Record<string, string[]> = {
  'Talento humano': ['ANDRES CAMILO ROMERO', 'CAROLINA ROMERO', 'CATALINA ROMERO', 'DANIELA RESTREPO', 'NICOLAS GUTIERREZ', 'JUAN PEDRO SIERRA', 'MARIA CAMILA ESCOBAR', 'MARIANO GARCIA', 'DIEGO ALEJANDRO CORREA', 'EDISON ANDRES VASCO', 'VERONICA', 'VERÓNICA'],
  'Transporte y combustible': ['DISTRACOM', 'JETSMART', 'SERVICENTROS', 'GRUPO ZUPETROL', 'EDS EL PRADO', 'EDS SAN SEBASTIAN', 'LILIANA MONTOYA', 'ESTACION DE SERVICIO'],
  'Almacenamiento': ['MEGA STORAGE'],
  'Tecnología': ['GOOGLE', 'ADOBE', 'SHOPIFY', 'PHMUSEUM'],
  'Alimentación': ['CREPES', 'CASA BRAVA', 'COCOROLLO', 'AYAPEL', 'FRANQUICIAS', 'SANCHO PAISA', 'GANSO', 'DISTRITO CULINARIO', 'MARRIAGA', 'INVERSIONES MIRANORTE', 'GRUPO LHL'],
  'Producción creativa': ['LA R FRESH', 'REDACOL', 'GRAPH'],
}

function categorize(name: string): string {
  const up = name.toUpperCase()
  for (const [cat, kws] of Object.entries(CAT_KEYWORDS)) {
    if (kws.some(k => up.includes(k))) return cat
  }
  return 'Suministros y operación'
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

function parseCSVRows(content: string, months: string[]): CsvRow[] {
  return content.trim().split('\n').slice(1)
    .filter(line => months.some(m => line.includes(m)))
    .map(line => {
      const cols: string[] = []
      let cur = '', inQ = false
      for (const ch of line) {
        if (ch === '"') { inQ = !inQ; continue }
        if (ch === ',' && !inQ) { cols.push(cur); cur = ''; continue }
        cur += ch
      }
      cols.push(cur)
      return {
        fecha: cols[0] ?? '', mes: cols[1] ?? '', tipo: cols[2] ?? '',
        numFact: cols[3] ?? '', contraparte: cols[4] ?? '', nit: cols[5] ?? '',
        concepto: cols[6] ?? '', subtotal: parseFloat(cols[7]) || 0,
        iva: parseFloat(cols[8]) || 0, total: parseFloat(cols[9]) || 0,
        archivo: cols[10] ?? '',
      }
    })
}

// ─── computeSummary ───────────────────────────────────────────────────────────

export function computeSummary(months: string[]): FinancialSummary {
  const empty: FinancialSummary = {
    months, monthly: [],
    totals: { facturacion: 0, ingresos: 0, costos: 0, flujoNeto: 0, margen: 0 },
    clienteIngresos: [], costosPorCategoria: [], topProveedores: [],
    iva: { cobrado: 0, pagado: 0, neto: 0 }, facturas: [], duplicados: 0,
  }
  const consolidado = path.join(DOCS_DIR, '_consolidado.csv')
  if (!fs.existsSync(consolidado)) return empty

  const rows = parseCSVRows(fs.readFileSync(consolidado, 'utf-8'), months)
  const ingresos = rows.filter(r => r.tipo === 'INGRESO')
  const allCostos = rows.filter(r => r.tipo === 'COSTO')

  // Dedup costs
  const seen = new Set<string>()
  const costos: CsvRow[] = []
  let duplicados = 0
  for (const c of allCostos) {
    const key = `${c.numFact}|${c.mes}`
    if (seen.has(key) && c.total > 0) { duplicados++; continue }
    seen.add(key); costos.push(c)
  }

  const totFacturacion = ingresos.reduce((s, r) => s + r.total, 0)
  const totIngresos = ingresos.reduce((s, r) => s + (r.subtotal || (r.total - r.iva)), 0)
  const totCostos   = costos.reduce((s, r) => s + r.total, 0)
  const totFlujo    = totFacturacion - totCostos

  // Monthly
  const monthly: MonthlySummary[] = months.map(m => {
    const rMes = ingresos.filter(r => r.mes === m)
    const mFact = rMes.reduce((s, r) => s + r.total, 0)
    const mIng = rMes.reduce((s, r) => s + (r.subtotal || (r.total - r.iva)), 0)
    const mC = costos.filter(r => r.mes === m).reduce((s, r) => s + r.total, 0)
    const fl = mFact - mC
    return { name: m, facturacion: mFact, ingresos: mIng, costos: mC, flujoNeto: fl,
      margen: mIng > 0 ? (fl / mIng) * 100 : 0,
      numFacturas: costos.filter(r => r.mes === m).length }
  })

  // Clients (based on Gross Facturacion)
  const cliMap: Record<string, number> = {}
  for (const r of ingresos) cliMap[r.contraparte] = (cliMap[r.contraparte] || 0) + r.total
  const clienteIngresos = Object.entries(cliMap).sort((a, b) => b[1] - a[1])
    .map(([nombre, total]) => ({ nombre, total, pct: totFacturacion > 0 ? (total / totFacturacion) * 100 : 0 }))

  // Categories
  const catMap: Record<string, { total: number; count: number }> = {}
  for (const c of costos) {
    const cat = categorize(c.contraparte)
    if (!catMap[cat]) catMap[cat] = { total: 0, count: 0 }
    catMap[cat].total += c.total; catMap[cat].count++
  }
  const costosPorCategoria = Object.entries(catMap).sort((a, b) => b[1].total - a[1].total)
    .map(([categoria, d]) => ({ categoria, total: d.total, pct: totCostos > 0 ? (d.total / totCostos) * 100 : 0, numTrans: d.count }))

  // Top providers
  const provMap: Record<string, number> = {}
  for (const c of costos) provMap[c.contraparte] = (provMap[c.contraparte] || 0) + c.total
  const topProveedores = Object.entries(provMap).sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([nombre, total]) => ({ nombre, total, categoria: categorize(nombre) }))

  const ivaCobrado = ingresos.reduce((s, r) => s + r.iva, 0)
  const ivaPagado  = costos.reduce((s, r) => s + r.iva, 0)

  return {
    months, monthly,
    totals: { facturacion: totFacturacion, ingresos: totIngresos, costos: totCostos, flujoNeto: totFlujo,
      margen: totIngresos > 0 ? (totFlujo / totIngresos) * 100 : 0 },
    clienteIngresos, costosPorCategoria, topProveedores,
    iva: { cobrado: ivaCobrado, pagado: ivaPagado, neto: ivaCobrado - ivaPagado },
    facturas: costos, duplicados,
  }
}

// ─── Helpers de filesystem ────────────────────────────────────────────────────


function countFilesInDir(dir: string): number {
  try {
    let count = 0
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry)
      const stat = fs.statSync(full)
      if (stat.isDirectory()) {
        count += countFilesInDir(full)
      } else {
        count++
      }
    }
    return count
  } catch { return 0 }
}

function dirExists(p: string): boolean {
  try { return fs.statSync(p).isDirectory() } catch { return false }
}

function hasFilesInDir(dir: string): boolean {
  try {
    if (!dirExists(dir)) return false
    const entries = fs.readdirSync(dir)
    for (const entry of entries) {
      const full = path.join(dir, entry)
      const stat = fs.statSync(full)
      if (stat.isFile()) return true
      if (stat.isDirectory() && hasFilesInDir(full)) return true
    }
    return false
  } catch { return false }
}

function findPDFsInDir(dir: string, base = ''): string[] {
  const results: string[] = []
  try {
    for (const entry of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, entry)
      const rel = base ? path.join(base, entry) : entry
      if (fs.statSync(fullPath).isDirectory()) {
        results.push(...findPDFsInDir(fullPath, rel))
      } else if (['.pdf', '.xml'].includes(path.extname(entry).toLowerCase())) {
        results.push(rel)
      }
    }
  } catch { /* skip unreadable */ }
  return results
}

// ─── Lectura del _consolidado.csv ─────────────────────────────────────────────

function readCSV(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines   = content.trim().split('\n')
    if (lines.length <= 1) return ''
    return content
  } catch { return '' }
}

function consolidadoHasMonth(csvContent: string, monthName: string): boolean {
  const lines = csvContent.split('\n').slice(1)
  return lines.some(line => line.includes(monthName))
}

// ─── Listar meses ─────────────────────────────────────────────────────────────

export function listMonths(): MonthFolder[] {
  if (!fs.existsSync(DOCS_DIR)) return []

  const consolidado     = path.join(DOCS_DIR, '_consolidado.csv')
  const consolidadoText = readCSV(consolidado)

  return fs.readdirSync(DOCS_DIR)
    .filter(name => {
      if (name.startsWith('.') || name.startsWith('_')) return false
      try { return fs.statSync(path.join(DOCS_DIR, name)).isDirectory() } catch { return false }
    })
    .map(name => {
      const monthDir    = path.join(DOCS_DIR, name)

      // Egresos: contar archivos en Egresos/FACTURAS/
      const facturasDir = path.join(monthDir, 'Egresos', 'FACTURAS')
      const pdfCount    = countFilesInDir(facturasDir)

      // Ingresos: ¿hay archivos xlsx en Ingresos/?
      const ingresosDir  = path.join(monthDir, 'Ingresos')
      const hasIncomeFile = hasFilesInDir(ingresosDir)

      // Admon: ¿hay extracto bancario en Admon/?
      const admonDir       = path.join(monthDir, 'Admon')
      const hasBankStatement = hasFilesInDir(admonDir)

      // CSV: ¿el consolidado tiene filas de este mes?
      const csvReady = consolidadoText ? consolidadoHasMonth(consolidadoText, name) : false

      return {
        name,
        pdfCount,
        csvReady,
        hasIncomeFile,
        hasBankStatement,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

// ─── Carga de contexto de ingresos desde _consolidado.csv ────────────────────

export function loadIncomeContext(months: string[]): string {
  const consolidado = path.join(DOCS_DIR, '_consolidado.csv')
  if (!fs.existsSync(consolidado)) return ''

  const content = readCSV(consolidado)
  if (!content) return ''

  const lines  = content.split('\n')
  const header = lines[0]
  // Solo filas de INGRESO para los meses seleccionados
  const rows = lines.slice(1).filter(line =>
    months.some(m => line.includes(m)) && line.includes('INGRESO')
  )
  if (rows.length === 0) return ''
  return [header, ...rows].join('\n')
}

// ─── Carga de contexto de costos desde _consolidado.csv ──────────────────────

export function loadCostContext(months: string[]): string {
  const consolidado = path.join(DOCS_DIR, '_consolidado.csv')
  if (fs.existsSync(consolidado)) {
    const content = readCSV(consolidado)
    if (content) {
      const lines  = content.split('\n')
      const header = lines[0]
      const rows   = lines.slice(1).filter(line =>
        months.some(m => line.includes(m)) && (line.includes('COSTO') || line.includes('EGRESO'))
      )
      if (rows.length > 0) return [header, ...rows].join('\n')
    }
  }

  // Fallback: CSVs individuales por mes
  const allLines: string[] = []
  let headerAdded = false

  for (const month of months) {
    const csvName = `_resumen_${month.replace(/\s+/g, '_')}.csv`
    const csvPath = path.join(DOCS_DIR, month, csvName)
    const content = readCSV(csvPath)
    if (!content) continue
    const lines = content.split('\n')
    if (!headerAdded) { allLines.push(lines[0]); headerAdded = true }
    allLines.push(...lines.slice(1).filter(Boolean))
  }

  return allLines.join('\n')
}

// ─── loadIncomePDFs (mantenido por compatibilidad — retorna vacío) ────────────
// Los ingresos ahora vienen del _consolidado.csv, no de PDFs.

export function loadIncomePDFs(_months: string[]): { name: string; month: string; data: Uint8Array }[] {
  return []
}

// ─── System prompt ────────────────────────────────────────────────────────────

export function buildSystemPrompt(months: string[], costCSV: string, _incomePDFCount: number): string {
  const monthsDesc = months.length === 0 ? 'ninguno' : months.join(', ')

  // Cargar ingresos también del consolidado
  const incomeCSV = loadIncomeContext(months)

  const costSection = costCSV
    ? `EGRESOS / COSTOS — DATOS ESTRUCTURADOS (facturas electrónicas DIAN, carpeta Egresos/FACTURAS/):
Columnas: fecha, mes, tipo, numeroFactura, contraparte, contraparteNIT, concepto, subtotal, iva, total, archivo

\`\`\`csv
${costCSV}
\`\`\``
    : 'No hay datos de costos disponibles para los meses seleccionados.'

  const incomeSection = incomeCSV
    ? `INGRESOS — DATOS ESTRUCTURADOS (carpeta Ingresos/, reportes de ventas por cliente):
Columnas: fecha, mes, tipo, numeroFactura, contraparte, contraparteNIT, concepto, subtotal, iva, total, archivo

\`\`\`csv
${incomeCSV}
\`\`\``
    : 'No hay datos de ingresos disponibles para los meses seleccionados.'

  return `Eres un analista financiero senior de La Magdalena, una agencia creativa colombiana (NIT: 901578370).

ESTRUCTURA CONTABLE:
- Ingresos: reportes de ventas por cliente en carpeta Ingresos/ (xlsx → CSV)
- Egresos: facturas electrónicas DIAN en carpeta Egresos/FACTURAS/
- Admon: extractos bancarios en carpeta Admon/

PERÍODOS ANALIZADOS: ${monthsDesc}

${incomeSection}

${costSection}

INSTRUCCIONES DE FORMATO (CRÍTICO):
- OBLIGATORIO: Tu PRIMERA línea debe ser exactamente: # PERÍODO ANALIZADO: ${monthsDesc}
  No pongas nada antes. No lo omitas. No lo muevas.
- Incluye una columna "Mes" o "Período" en TODAS las tablas de datos.
- Usa TABLAS de Markdown para todos los resúmenes, comparativas y proyecciones.
- Deja una línea en blanco ANTES y DESPUÉS de cada tabla.
- Formatea montos en COP con separadores de miles (ej: $1.250.000 COP).
- Usa **negritas** para cifras totales y KPIs importantes.
- Estructura la respuesta con encabezados claros (## Resumen, ### Proyecciones, etc.).
- Si falta información para un mes, menciónalo explícitamente.

INSTRUCCIONES DE ANÁLISIS:
- Los INGRESOS y COSTOS están en los CSVs estructurados — úsalos directamente.
- Flujo Neto = Total Ingresos - Total Costos.
- Si hay duplicados en el CSV (mismo número de factura), cuéntalos una sola vez.
- Al proyectar, muestra explícitamente los supuestos (ej: "Basado en el promedio de los últimos 3 meses...").
- Responde siempre en español.`
}
